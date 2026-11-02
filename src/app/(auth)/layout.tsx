import type { ReactNode } from "react";

/** Each auth page renders its own `AuthShell`, because the showcase headline changes per page. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
