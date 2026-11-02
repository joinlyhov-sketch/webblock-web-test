import type { Metadata } from "next";
import { AuthHeader, AuthShell, SignInForm, emailFromSearchParams } from "@/features/auth";
import { safeNextPath } from "@/lib/auth/next-path";
import type { SearchParams } from "@/lib/table-query";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const email = emailFromSearchParams(query);
  return (
    <AuthShell headline={{ line1: "Pick up right", line2: "where you", accent: "left off." }}>
      <AuthHeader title="Welcome back" description="Sign in to manage your websites." />
      <SignInForm defaultEmail={email ?? undefined} next={safeNextPath(query.next)} />
    </AuthShell>
  );
}
