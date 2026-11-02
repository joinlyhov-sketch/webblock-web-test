import { formatDayMonthYear, formatLastActive } from "@/lib/format";
import type { Profile } from "../types";
import { GoogleCard } from "./google-card";
import { PasswordCard } from "./password-card";
import { ProfileCard } from "./profile-card";

const PLAN_LABELS: Record<Profile["plan"], string> = {
  FREE_TRIAL: "Free trial",
  PLUS: "Plus",
  PRO: "Pro",
  ULTRA: "Ultra",
};

/** Settings → Profile: profile on the left (684px), password and Google on the right. */
export function ProfileView({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-col items-start gap-[15px] xl:flex-row">
      <ProfileCard
        profile={profile}
        planLabel={PLAN_LABELS[profile.plan]}
        memberSince={formatDayMonthYear(profile.memberSince)}
        lastSignIn={formatLastActive(profile.lastSignInAt)}
      />
      <div className="flex w-full min-w-0 flex-col gap-[15px] xl:flex-1">
        <PasswordCard hasPassword={profile.hasPassword} />
        <GoogleCard googleEmail={profile.googleEmail} hasPassword={profile.hasPassword} />
      </div>
    </div>
  );
}
