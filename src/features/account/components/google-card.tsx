import Image from "next/image";
import { Link21 } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SettingsCard } from "./settings-card";

/** Connected sign-in methods. The note shows until the user has set a password. */
export function GoogleCard({
  googleEmail,
  hasPassword,
}: {
  googleEmail: string | null;
  hasPassword: boolean;
}) {
  return (
    <SettingsCard icon={<Link21 variant="Outline" />} title="Sign in with Google" description="Connected accounts" headerClassName="pb-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3.5">
          <span className="flex size-[46px] shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-surface">
            <Image src="/images/settings/google.svg" alt="" width={22} height={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] leading-[19.5px] font-bold">Google</p>
            <p className={cn("flex h-[18px] items-center gap-1.5 text-xs", googleEmail ? "text-success" : "text-hint")}>
              <span aria-hidden className={cn("size-[7px] rounded-full", googleEmail ? "bg-success" : "bg-hint")} />
              {googleEmail ? `Connected · ${googleEmail}` : "Not connected"}
            </p>
          </div>
          {!googleEmail && (
            // Same as the Google button on sign-in: not connected to Google yet.
            <Button variant="secondary" size="sm" disabled title="Google sign-in is coming soon">
              Coming soon
            </Button>
          )}
        </div>
        {googleEmail && !hasPassword && (
          <p className="text-xs text-hint">
            Set a password too, so you can still sign in if you ever lose access to your Google account.
          </p>
        )}
      </div>
    </SettingsCard>
  );
}
