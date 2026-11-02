import { requireUser } from "@/lib/auth/session";
import { getCurrentPlan } from "@/features/account";
import type { SearchParams } from "@/lib/table-query";
import { getNotificationsView } from "@/features/notifications";
import { getTemplatesView } from "@/features/templates";
import { getAllWebsites, getBusinessTypes, parseInitialFilter, WebsitesView } from "@/features/websites";

export const metadata = { title: "My Websites" };

export default async function WebsitesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const user = await requireUser();
  const [websites, notifications, templates, businessTypes, plan] = await Promise.all([
    getAllWebsites(user.id),
    getNotificationsView(user.id),
    getTemplatesView({}),
    getBusinessTypes(),
    getCurrentPlan(user.id),
  ]);

  return (
    <WebsitesView
      websites={websites}
      notifications={notifications}
      templates={templates.templates}
      businessTypes={businessTypes}
      plan={plan}
      initialFilter={parseInitialFilter(query)}
    />
  );
}
