"use client";

import { useState, type ReactNode } from "react";
import { Calendar, Copy, MagicStar, Personalcard, ShieldTick, Sms, TickCircle } from "iconsax-reactjs";
import { Avatar } from "@/components/common/avatar";
import { Pill } from "@/components/common/status-badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminProfile } from "../types";

/** Header avatar (Figma "Header · Admin profile"): opens the read-only "Admin profile" card. */
export function AdminProfileMenu({ profile }: { profile: AdminProfile }) {
  const [copied, setCopied] = useState(false);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(profile.accountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (e.g. insecure context): the ID stays selectable in the card.
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Admin profile"
          className="rounded-full outline-none transition-transform focus-visible:ring-3 focus-visible:ring-ring/40 motion-safe:active:scale-95"
        >
          <Avatar variant="solid"
            name={profile.fullName}
            src={profile.avatarUrl}
            className="size-10 text-xs"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label="Admin profile"
        // Don't move focus into the card on open (the copy button would grab it).
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[min(300px,calc(100vw-32px))] overflow-hidden rounded-[24px] p-0"
      >
        <h2 className="sr-only">Admin profile</h2>

        {/* Cover: light blue gradient with a faint dot grid fading out, same family as the confirm popups. */}
        <div aria-hidden className="relative h-[84px] overflow-hidden bg-linear-to-b from-brand-soft to-primary-soft/40">
          <span className="absolute inset-0 bg-[radial-gradient(var(--color-decor-dot)_1.2px,transparent_1.4px)] bg-size-[12px_12px] mask-b-from-20% opacity-70" />
          {/* Two soft light spots for depth. */}
          <span className="absolute -top-10 -left-8 size-28 rounded-full bg-primary/15 blur-2xl" />
          <span className="absolute -top-12 -right-6 size-32 rounded-full bg-violet-border blur-2xl" />
          {/* Little sparkles in the empty corners. */}
          <MagicStar variant="Bold" className="absolute top-4 right-6 size-3.5 text-brand-border" />
          <MagicStar variant="Bold" className="absolute top-9 left-7 size-2.5 text-brand-border" />
        </div>

        <div className="-mt-10 flex flex-col items-center px-4 text-center">
          {/* Avatar in a thin blue gradient ring, with a green "signed in" dot on its bottom-right edge. */}
          <span className="relative grid rounded-full bg-linear-to-br from-primary to-brand-border p-[3px] shadow-card motion-safe:animate-fade-up">
            <Avatar
              variant="solid"
              name={profile.fullName}
              src={profile.avatarUrl}
              className="size-[70px] text-lg ring-[3px] ring-background"
            />
            <span className="absolute right-1 bottom-1 size-3.5 rounded-full bg-success ring-[2.5px] ring-background">
              <span className="sr-only">Signed in</span>
            </span>
          </span>
          <p className="mt-3 max-w-full truncate font-heading text-lg leading-6 font-semibold text-foreground">
            {profile.fullName}
          </p>
          <Pill tone="brand" icon={<ShieldTick aria-hidden />} className="mt-1.5">
            {profile.title}
          </Pill>
        </div>

        <ul className="m-4 mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/60 motion-safe:animate-fade-up motion-safe:[animation-delay:80ms]">
          <ProfileRow icon={<Sms />} label="Email" value={profile.email} />
          <ProfileRow
            icon={<Personalcard />}
            label="Account ID"
            value={profile.accountCode}
            mono
            action={
              <button
                type="button"
                onClick={copyId}
                aria-label={copied ? "Account ID copied" : "Copy account ID"}
                className="grid size-7 shrink-0 place-items-center rounded-lg text-foreground-soft outline-none transition-colors hover:bg-background hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                {copied ? (
                  <TickCircle className="size-4 text-success" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            }
          />
          <ProfileRow
            icon={<Calendar />}
            label="Joined"
            value={formatDate(profile.joinedAt)}
          />
        </ul>
        <span aria-live="polite" className="sr-only">
          {copied ? "Account ID copied" : ""}
        </span>
      </PopoverContent>
    </Popover>
  );
}

/** One "icon · label / value" line of the profile card; `action` sits on the right (e.g. copy). */
function ProfileRow({
  icon,
  label,
  value,
  mono = false,
  action,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  /** Tabular digits for codes like "ADM-000001". */
  mono?: boolean;
  action?: ReactNode;
}) {
  return (
    <li className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-background">
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-xl bg-background text-brand shadow-button transition-colors group-hover:bg-brand-soft [&_svg]:size-4"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[11px] leading-4 text-muted-foreground">{label}</p>
        <p
          className={cn(
            "truncate text-[13px] leading-5 font-medium text-foreground select-all",
            mono && "tabular-nums tracking-wide",
          )}
          title={value}
        >
          {value}
        </p>
      </div>
      {action}
    </li>
  );
}
