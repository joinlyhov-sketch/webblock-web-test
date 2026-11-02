// Demo session storage only; the real deployment pipeline belongs in Spring/database storage.
import { cookies } from "next/headers";
import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { DOMAIN_SUFFIX, subdomainSchema } from "./schemas";

const COOKIE_NAME = "wb_mock_deployments";
const MAX_DEPLOYMENTS = 6;
const MAX_COOKIE_BYTES = 3800;

const snapshotSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  websiteId: z.uuid(),
  idempotencyKey: z.uuid(),
  kind: z.enum(["FIRST", "REDEPLOY"]),
  domain: z.string().max(253).refine((host) =>
    host.endsWith(DOMAIN_SUFFIX) && subdomainSchema.safeParse(host.slice(0, -DOMAIN_SUFFIX.length)).success,
  ),
  startedAt: z.iso.datetime(),
});
const sessionSchema = z.array(snapshotSchema).max(MAX_DEPLOYMENTS);

export type MockDeploymentSnapshot = z.infer<typeof snapshotSchema>;

export async function readMockDeployments(userId: string): Promise<MockDeploymentSnapshot[]> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value || value.length > MAX_COOKIE_BYTES) return [];
  try {
    const parsed = sessionSchema.safeParse(JSON.parse(Buffer.from(value, "base64url").toString("utf8")));
    if (!parsed.success) return [];
    return parsed.data.filter((entry) => entry.userId === userId);
  } catch {
    return [];
  }
}

/** Only called from the start-deploy Server Action; progress renders never write cookies. */
export async function saveMockDeployment(snapshot: MockDeploymentSnapshot): Promise<void> {
  const parsed = snapshotSchema.safeParse(snapshot);
  if (!parsed.success) {
    throw new ApiError({ title: "Invalid demo deploy", status: 400, detail: "Could not save this demo deployment." });
  }
  const entries = [parsed.data, ...(await readMockDeployments(snapshot.userId))
    .filter((entry) => entry.id !== snapshot.id)].slice(0, MAX_DEPLOYMENTS);
  let value = Buffer.from(JSON.stringify(entries)).toString("base64url");
  while (value.length > MAX_COOKIE_BYTES && entries.length > 1) {
    entries.pop();
    value = Buffer.from(JSON.stringify(entries)).toString("base64url");
  }
  if (value.length > MAX_COOKIE_BYTES) {
    throw new ApiError({ title: "Demo deploy too large", status: 400, detail: "Could not save this demo deployment." });
  }
  (await cookies()).set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}
