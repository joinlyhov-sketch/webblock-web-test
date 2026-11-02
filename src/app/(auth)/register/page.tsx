import type { Metadata } from "next";
import { AuthHeader, AuthShell, EmailStepForm } from "@/features/auth";
import { safeNextPath } from "@/lib/auth/next-path";
import type { SearchParams } from "@/lib/table-query";

export const metadata: Metadata = { title: "Create your account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const next = safeNextPath((await searchParams).next);
  return (
    <AuthShell headline={{ line1: "Your website, live", line2: "in an", accent: "afternoon." }}>
      <AuthHeader
        step={1}
        title="Create your account"
        description="Free to start. No card needed for your 14-day trial."
      />
      <EmailStepForm mode="register" next={next} />
    </AuthShell>
  );
}
