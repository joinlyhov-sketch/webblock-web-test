"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const DELAY_MS = 5500; // long enough to enjoy the confetti

/** Once the bank has confirmed the payment, takes the owner back to where they chose the plan. */
export function RedirectAfterPaid({ href }: { href: string }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace(href), DELAY_MS);
    return () => clearTimeout(timer);
  }, [href, router]);

  return null;
}
