"use client";

import { useState, useTransition } from "react";
import { Logout } from "iconsax-reactjs";
import { signOutAction } from "@/features/auth/actions";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

/** Log out icon button with its confirmation dialog, for sidebars that are Server Components. */
export function SignOutButton({ description }: { description: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

  return (
    <>
      <button
        type="button"
        aria-label="Log out"
        onClick={() => setConfirmOpen(true)}
        className="flex size-[18px] shrink-0 items-center justify-center rounded-md text-foreground-soft outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <Logout aria-hidden className="size-[18px]" />
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => startSignOut(() => signOutAction())}
        loading={signingOut}
        icon={<Logout />}
        title="Log out of WebBlock?"
        description={description}
        confirmLabel="Log out"
        look="soft"
      />
    </>
  );
}
