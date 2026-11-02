import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sms } from "iconsax-reactjs";
import { AuthHeader, AuthShell, OtpForm, emailFromSearchParams } from "@/features/auth";
import { safeNextPath } from "@/lib/auth/next-path";
import type { SearchParams } from "@/lib/table-query";

export const metadata: Metadata = { title: "Check your email" };

export default async function VerifyOtpPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const email = emailFromSearchParams(query);
  const next = safeNextPath(query.next);
  if (!email) redirect("/register");
  return (
    <AuthShell headline={{ line1: "One quick check,", line2: "then", accent: "you’re in." }}>
      <AuthHeader
        step={2}
        backHref="/register"
        icon={<Sms variant="Outline" />}
        title="Check your email"
        description={
          <>
            We sent a 6-digit code to <b className="font-bold text-foreground">{email}</b>. Enter it below.
          </>
        }
      />
      <OtpForm email={email} submitLabel="Verify email" nextHref="/create-password" changeEmailHref="/register" next={next} />
    </AuthShell>
  );
}
