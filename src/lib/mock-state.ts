// Persistence for the demo backend. Feature DTOs stay unchanged when Spring replaces it.
import { AsyncLocalStorage } from "node:async_hooks";
import { mkdir, readFile, rename, rmdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import type { Pool } from "pg";
import { ApiError } from "./api/errors";

type State = Record<string, unknown>;
type Snapshot = { revision: number; payload: string };
const contexts = new AsyncLocalStorage<State>();
const seeds = new Map<string, object>();

// Keep binary uploads and version/idempotency maps intact when crossing server instances.
export function serializeMockState(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) => {
    if (Object.prototype.toString.call(item) === "[object Map]") {
      return { __webblockType: "Map", entries: [...(item as Map<unknown, unknown>)] };
    }
    if (item instanceof Uint8Array) {
      return { __webblockType: "Bytes", base64: Buffer.from(item).toString("base64") };
    }
    return item;
  });
}

export function deserializeMockState<T>(value: string): T {
  return JSON.parse(value, (_key, item: unknown) => {
    if (item && typeof item === "object" && "__webblockType" in item) {
      if (item.__webblockType === "Map" && "entries" in item && Array.isArray(item.entries)) {
        return new Map(item.entries);
      }
      if (item.__webblockType === "Bytes" && "base64" in item && typeof item.base64 === "string") {
        return new Uint8Array(Buffer.from(item.base64, "base64"));
      }
    }
    return item;
  }) as T;
}

/** Stable references resolve to the current operation's isolated snapshot, never another request. */
export function mockCollection<T extends object>(name: string, initial: T): T {
  if (!seeds.has(name)) seeds.set(name, deserializeMockState<T>(serializeMockState(initial)));
  const seed = seeds.get(name) as T;
  const current = (): T => {
    const state = contexts.getStore();
    if (!state) return seed; // Module-level fixture construction only.
    if (!Object.hasOwn(state, name)) state[name] = deserializeMockState<T>(serializeMockState(seed));
    return state[name] as T;
  };
  return new Proxy(seed, {
    get: (_target, key) => {
      const value = current();
      const member: unknown = Reflect.get(value, key, value);
      return typeof member === "function" ? member.bind(value) : member;
    },
    set: (_target, key, value: unknown) => Reflect.set(current(), key, value),
    deleteProperty: (_target, key) => Reflect.deleteProperty(current(), key),
    has: (_target, key) => Reflect.has(current(), key),
    ownKeys: () => Reflect.ownKeys(current()),
    getOwnPropertyDescriptor: (_target, key) => Reflect.getOwnPropertyDescriptor(current(), key),
  });
}

let database: Promise<Pool> | undefined;

async function createDatabase(): Promise<Pool> {
  const { Pool: PgPool } = await import("pg");
  const pool = new PgPool({
    connectionString: process.env.DATABASE_URL ?? process.env.POSTGRES_URL,
    max: 3,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  });
  pool.on("error", () => console.error("The shared demo database connection failed."));
  // Serialize first-time schema creation across cold starts.
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(749231, 1)");
      await client.query(`CREATE TABLE IF NOT EXISTS webblock_demo_state (
        namespace text PRIMARY KEY,
        revision bigint NOT NULL,
        payload text NOT NULL
      )`);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    return pool;
  } catch (error) {
    await pool.end();
    throw error;
  }
}

async function getDatabase(): Promise<Pool> {
  // Assign the promise before any I/O so concurrent first requests use one pool/schema setup.
  database ??= createDatabase();
  try {
    return await database;
  } catch (error) {
    database = undefined;
    throw error;
  }
}

function databaseConfigured(): boolean {
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) return true;
  if (process.env.VERCEL) {
    throw new ApiError({
      title: "Shared storage is not configured",
      status: 503,
      detail: "Connect a PostgreSQL database and set the server-only DATABASE_URL in Vercel before using the demo backend.",
    });
  }
  return false;
}

// This file is runtime data created locally, not an asset to bundle into Vercel functions.
const stateFile = () => path.resolve(/* turbopackIgnore: true */ process.env.WEBBLOCK_STATE_FILE ?? path.join(process.cwd(), ".data", "webblock-state.json"));
const namespace = () => process.env.WEBBLOCK_DATA_NAMESPACE ?? "webblock-demo-v1";
const hasCode = (error: unknown, code: string) => !!error && typeof error === "object" && "code" in error && error.code === code;

async function readSnapshot(): Promise<Snapshot> {
  if (databaseConfigured()) {
    const pool = await getDatabase();
    const result = await pool.query<{ revision: string; payload: string }>(
      "SELECT revision, payload FROM webblock_demo_state WHERE namespace = $1", [namespace()],
    );
    const row = result.rows[0];
    return row ? { revision: Number(row.revision), payload: row.payload } : { revision: 0, payload: "{}" };
  }
  try {
    return JSON.parse(await readFile(/* turbopackIgnore: true */ stateFile(), "utf8")) as Snapshot;
  } catch (error) {
    if (hasCode(error, "ENOENT")) return { revision: 0, payload: "{}" };
    throw error;
  }
}

async function compareAndSwap(snapshot: Snapshot, payload: string): Promise<boolean> {
  if (databaseConfigured()) {
    const pool = await getDatabase();
    const result = snapshot.revision === 0
      ? await pool.query("INSERT INTO webblock_demo_state (namespace, revision, payload) VALUES ($1, 1, $2) ON CONFLICT DO NOTHING", [namespace(), payload])
      : await pool.query("UPDATE webblock_demo_state SET revision = revision + 1, payload = $1 WHERE namespace = $2 AND revision = $3", [payload, namespace(), snapshot.revision]);
    return result.rowCount === 1;
  }
  const file = stateFile();
  await mkdir(path.dirname(file), { recursive: true });
  const lock = `${file}.lock`;
  for (let attempt = 0; ; attempt++) {
    try {
      await mkdir(lock);
      break;
    } catch (error) {
      if (!hasCode(error, "EEXIST") || attempt >= 150) throw error;
      const info = await stat(lock).catch(() => null);
      if (info && Date.now() - info.mtimeMs > 30_000) await rmdir(lock).catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
  try {
    if ((await readSnapshot()).revision !== snapshot.revision) return false;
    const temporary = `${file}.${crypto.randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify({ revision: snapshot.revision + 1, payload }), "utf8");
    await rename(temporary, file);
    return true;
  } finally {
    await rmdir(lock);
  }
}

/** Nested feature calls share one snapshot; conflicts retry without losing other instances' writes. */
export async function withMockState<T>(operation: () => Promise<T>): Promise<T> {
  if (contexts.getStore()) return operation();
  await connection();
  for (let attempt = 0; attempt < 12; attempt++) {
    const snapshot = await readSnapshot();
    const state = deserializeMockState<State>(snapshot.payload);
    const { output, payload } = await contexts.run(state, async () => {
      const result = await operation();
      // Materialize returned collection references before leaving this request's context.
      const output = result === undefined ? result : deserializeMockState<T>(serializeMockState(result));
      return { output, payload: serializeMockState(state) };
    });
    if (payload === snapshot.payload || await compareAndSwap(snapshot, payload)) return output;
  }
  throw new ApiError({ title: "Data changed", status: 409, detail: "Another request changed this data. Please try again." });
}

export function mockApi<Args extends unknown[], Result>(operation: (...args: Args) => Promise<Result>) {
  return (...args: Args): Promise<Result> => withMockState(() => operation(...args));
}
