import type { ReactNode } from "react";

/** Plans and payment are full-screen pages: no sidebar, they bring their own slim top bar. */
export default function BillingLayout({ children }: { children: ReactNode }) {
  return <main className="h-dvh overflow-hidden bg-background">{children}</main>;
}
