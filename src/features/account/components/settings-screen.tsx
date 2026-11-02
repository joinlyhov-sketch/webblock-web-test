"use client";

import { useState } from "react";
import type { BillingView as BillingData } from "../service";
import type { Profile } from "../types";
import { BillingView } from "./billing-view";
import { ProfileView } from "./profile-view";
import { SettingsHeader, type SettingsTab } from "./settings-header";

/**
 * Settings: Profile and Billing share one screen. Both are loaded together, so switching tabs only
 * changes state: no navigation, no loading skeleton, no server render. The address bar follows with
 * `history.replaceState`, so a refresh or a shared link opens on the same tab.
 */
export function SettingsScreen({
  profile,
  billing,
  initialTab,
}: {
  profile: Profile;
  billing: BillingData;
  initialTab: SettingsTab;
}) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  function select(next: SettingsTab) {
    if (next === tab) return;
    setTab(next);
    window.history.replaceState(window.history.state, "", `/settings/${next}`);
  }

  return (
    <>
      <SettingsHeader tab={tab} onTab={select} />
      <div className="flex min-h-0 flex-1 flex-col gap-[15px]">
        {tab === "profile" ? <ProfileView profile={profile} /> : <BillingView data={billing} />}
      </div>
    </>
  );
}
