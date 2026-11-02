import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sms } from "iconsax-reactjs";
import { AuthHeader, AuthShell, OtpForm, emailFromSearchParams } from "@/features/auth";
import type { SearchParams } from "@/lib/table-query";

export const metadata: Metadata = { title: "Check your email" };

export default async function ForgotPasswordVerifyPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const email = emailFromSearchParams(await searchParams);
  if (!email) redirect("/forgot-password");
  return (
    <AuthShell headline={{ line1: "Just making sure", line2: "it’s", accent: "really you." }}>
      <AuthHeader
        step={2}
        backHref="/forgot-password"
        icon={<Sms variant="Outline" />}
        title="Check your email"
        description={
          <>
            We sent a 6-digit code to <b className="font-bold text-foreground">{email}</b>. Enter it below to
            reset your password.
          </>
        }
      />
      <OtpForm email={email} submitLabel="Verify code" nextHref="/reset-password" changeEmailHref="/forgot-password" />
    </AuthShell>
  );
}
