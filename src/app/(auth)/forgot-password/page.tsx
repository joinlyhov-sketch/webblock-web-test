import type { Metadata } from "next";
import { AuthHeader, AuthShell, EmailStepForm } from "@/features/auth";

export const metadata: Metadata = { title: "Forgot your password?" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell headline={{ line1: "Back to your business", line2: "in a", accent: "minute." }}>
      <AuthHeader
        step={1}
        title="Forgot your password?"
        description="Enter the email you signed up with and we’ll help you reset it."
      />
      <EmailStepForm mode="forgot-password" />
    </AuthShell>
  );
}
