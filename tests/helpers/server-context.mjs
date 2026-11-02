import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const compiled = new Map();

export function testStorage(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "webblock-state-test-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(directory).startsWith("webblock-state-test-"));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  return { stateFile: path.join(directory, "state.json") };
}

/** A separate server instance, using real feature APIs and the same durable storage file. */
export function serverContext({ stateFile, now = Date.now(), cookies = new Map([["wb_role", "USER"]]), env = {} }) {
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const context = vm.createContext({
    crypto: globalThis.crypto, Date: Clock, Buffer, structuredClone, TextEncoder,
    Uint8Array, ArrayBuffer, File, FormData, URL, fetch, console, setTimeout, clearTimeout,
    process: { cwd: () => ROOT, env: {
      NODE_ENV: "test", WEBBLOCK_STATE_FILE: stateFile, ...env,
    } },
  });
  const cache = new Map();
  function load(specifier, parent = path.join(ROOT, "src", "entry.ts")) {
    if (specifier === "next/server") return { connection: async () => {} };
    if (specifier === "next/headers") return { cookies: async () => ({
      get: (name) => cookies.has(name) ? { value: cookies.get(name) } : undefined,
      set: (name, value) => cookies.set(name, value),
      delete: (name) => cookies.delete(name),
    }) };
    if (specifier === "next/navigation") return {
      notFound() { throw Object.assign(new Error("Not found"), { status: 404 }); },
      redirect(href) { throw Object.assign(new Error("Redirect: " + href), { digest: "NEXT_REDIRECT;" + href }); },
    };
    if (specifier === "@/lib/api/delay") return { delay: async () => {} };
    if (!specifier.startsWith("@/") && !specifier.startsWith(".")) return nodeRequire(specifier);
    const base = specifier.startsWith("@/")
      ? path.join(ROOT, "src", specifier.slice(2))
      : path.resolve(path.dirname(parent), specifier);
    const filename = [base + ".ts", path.join(base, "index.ts")].find(fs.existsSync);
    assert.ok(filename, `Cannot resolve ${specifier}`);
    if (cache.has(filename)) return cache.get(filename).exports;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    if (!compiled.has(filename)) compiled.set(filename, ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText);
    vm.runInContext("(function(require,module,exports){" + compiled.get(filename) + "\n})", context)(
      (name) => load(name, filename), loadedModule, loadedModule.exports,
    );
    return loadedModule.exports;
  }
  return { load, cookies };
}
