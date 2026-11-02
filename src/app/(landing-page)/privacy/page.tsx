import type { Metadata } from "next";
import { LegalPage, privacyPolicy } from "@/features/landing";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return <LegalPage doc={privacyPolicy} />;
}
