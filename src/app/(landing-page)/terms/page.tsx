import type { Metadata } from "next";
import { LegalPage, termsOfService } from "@/features/landing";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return <LegalPage doc={termsOfService} />;
}
