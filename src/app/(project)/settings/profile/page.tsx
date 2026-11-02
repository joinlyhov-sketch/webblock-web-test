import { requireUser } from "@/lib/auth/session";
import { getSettingsView, SettingsScreen } from "@/features/account";

export const metadata = { title: "Profile" };

export default async function ProfileSettingsPage() {
  const user = await requireUser();
  const { profile, billing } = await getSettingsView(user.id, {});

  return <SettingsScreen profile={profile} billing={billing} initialTab="profile" />;
}
