import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthHeader, AuthShell, NewPasswordForm, emailFromSearchParams } from "@/features/auth";
import type { SearchParams } from "@/lib/table-query";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const email = emailFromSearchParams(await searchParams);
  if (!email) redirect("/forgot-password");
  return (
    <AuthShell headline={{ line1: "A fresh password,", line2: "a", accent: "fresh start." }}>
      <AuthHeader
        step={3}
        title="Set a new password"
        description={
          <>
            Code verified. Choose a new password for <b className="font-bold text-foreground">{email}</b>.
          </>
        }
      />
      <NewPasswordForm email={email} mode="reset" />
    </AuthShell>
  );
}
