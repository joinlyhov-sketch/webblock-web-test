import { requireUser } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";
import { getSettingsView, SettingsScreen } from "@/features/account";

export const metadata = { title: "Billing" };

export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const user = await requireUser();
  const { profile, billing } = await getSettingsView(user.id, query);

  return <SettingsScreen profile={profile} billing={billing} initialTab="billing" />;
}
