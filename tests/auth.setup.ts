import { test as setup, expect } from "@playwright/test";

// The app has a mock sign-in (any valid email + password; "admin@…" becomes ADMIN). Real sign-in
// through the form is covered in public.spec.ts; here we only need the session cookie, once per role.
for (const [role, file] of [
  ["USER", "tests/.auth/user.json"],
  ["ADMIN", "tests/.auth/admin.json"],
] as const) {
  setup(`sign in as ${role}`, async ({ request }) => {
    const response = await request.post("/api/mock-auth", { multipart: { role }, maxRedirects: 0 });
    expect(response.status()).toBe(303);
    await request.storageState({ path: file });
  });
}
