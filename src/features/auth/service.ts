// Mock session end: clears the role cookie. With Spring this calls the logout endpoint.
import { cookies } from "next/headers";
import { ROLE_COOKIE } from "@/lib/auth/roles";

export async function signOut(): Promise<void> {
  (await cookies()).delete(ROLE_COOKIE);
}
