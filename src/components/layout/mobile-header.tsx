"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { Logout } from "iconsax-reactjs";
import { Avatar } from "@/components/common/avatar";
import { Logo } from "@/components/common/logo";
import { Modal } from "@/components/common/modal";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { signOutAction } from "@/features/auth/actions";
import { useProfileUpdates } from "@/hooks/use-profile-updates";

export function MobileHeader({ profile: serverProfile, homeHref, notifications, children }: {
  profile: { fullName: string; avatarUrl: string | null; email?: string; initials?: string };
  homeHref: string;
  notifications: ReactNode;
  children?: ReactNode;
}) {
  const profile = useProfileUpdates({ ...serverProfile, initials: serverProfile.initials ?? "" });
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  return <>
    <header aria-label="Mobile header" className="mobile-glass sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 pt-[env(safe-area-inset-top)] sm:px-6 lg:hidden">
      <Link href={homeHref} prefetch aria-label="WebBlock home" className="flex min-h-11 min-w-0 items-center rounded-lg focus-visible:ring-3 focus-visible:ring-ring/40"><Logo /></Link>
      <div className="flex shrink-0 items-center gap-2">
        {notifications}
        <button type="button" aria-label="Open account menu" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"><Avatar name={profile.fullName} src={profile.avatarUrl} className="size-10" /></button>
      </div>
    </header>
    <Modal open={open} onClose={() => setOpen(false)} label="Account menu" className="mobile-nav-sheet">
      <div className="p-5">
        <div className="mb-4 flex items-center gap-3"><Avatar name={profile.fullName} src={profile.avatarUrl} /><div className="min-w-0 flex-1"><h2 className="truncate font-semibold">{profile.fullName}</h2>{profile.email && <p className="truncate text-sm text-muted-foreground">{profile.email}</p>}</div><button type="button" aria-label="Close account menu" onClick={() => setOpen(false)} className="min-h-11 min-w-11 rounded-full bg-muted text-sm">Close</button></div>
        <nav aria-label="Account" className="flex flex-col gap-1">
          <Link href="/settings/profile" prefetch onClick={() => setOpen(false)} className="flex min-h-12 items-center rounded-xl px-3 hover:bg-muted">Profile</Link>
          <Link href="/settings" prefetch onClick={() => setOpen(false)} className="flex min-h-12 items-center rounded-xl px-3 hover:bg-muted">Settings</Link>
          {children && <div className="my-1 border-y border-border py-1" onClick={(event) => { if ((event.target as HTMLElement).closest("a")) setOpen(false); }}>{children}</div>}
          <button type="button" onClick={() => { setOpen(false); setConfirm(true); }} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-left hover:bg-muted"><Logout variant="Outline" aria-hidden className="size-5" />Log out</button>
        </nav>
      </div>
    </Modal>
    <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={() => startSignOut(() => signOutAction())} loading={signingOut} title="Log out of WebBlock?" description="You’ll need to sign in again to manage your websites." confirmLabel="Log out" icon={<Logout variant="Outline" />} look="soft" />
  </>;
}
