import type { ReactNode } from "react";

/** Bare shell for public template websites: no sidebar, no app chrome. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-white">{children}</div>;
}
