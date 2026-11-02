import type { ReactNode } from "react";
import { MotionProvider } from "@/components/common/motion";
import { ContactDialog, LandingFooter, LandingHeader } from "@/features/landing";

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <div data-landing className="flex min-h-dvh flex-col overflow-x-clip">
        <LandingHeader />
        <main className="flex-1">{children}</main>
        <LandingFooter />
        <ContactDialog />
      </div>
    </MotionProvider>
  );
}
