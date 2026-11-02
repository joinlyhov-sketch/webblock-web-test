"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/common/toast";

/** Google OAuth is run by the backend; until its endpoint exists this only tells the user. */
export function GoogleButton({ label }: { label: string }) {
  return (
    <Button
      variant="secondary"
      size="lg"
      className="w-full"
      onClick={() => toast.warning("Not available yet", "Google sign-in is coming soon. Use your email for now.")}
    >
      <Image src="/images/auth/google.svg" alt="" width={18} height={18} />
      {label}
    </Button>
  );
}
