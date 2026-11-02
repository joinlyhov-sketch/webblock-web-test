"use client";

import { useEffect, useState } from "react";

const EVENT = "wb:profile-updated";

export type ProfileIdentityPatch = { fullName: string; initials: string; avatarUrl: string | null };

/** Tells every listener (the sidebar) the user's name or photo changed. Nothing goes to the server. */
export function announceProfile(identity: ProfileIdentityPatch) {
  window.dispatchEvent(new CustomEvent<ProfileIdentityPatch>(EVENT, { detail: identity }));
}

/** The sidebar's profile: the server value first, then whatever Settings announces. */
export function useProfileUpdates<T extends ProfileIdentityPatch>(initial: T): T {
  const [profile, setProfile] = useState(initial);

  useEffect(() => {
    const onUpdate = (event: Event) => setProfile((current) => ({ ...current, ...(event as CustomEvent<ProfileIdentityPatch>).detail }));
    window.addEventListener(EVENT, onUpdate);
    return () => window.removeEventListener(EVENT, onUpdate);
  }, []);

  return profile;
}
