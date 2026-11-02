import { ActivityView, listActivity, listActivityActors, type ActivityAction } from "@/features/admin/monitoring";
import { requireAdmin } from "@/lib/auth/session";
import { parseTableQuery, type SearchParams } from "@/lib/table-query";

export const metadata = { title: "Activity Log" };

const ACTIONS: ActivityAction[] = [
  "SUSPEND_HOSTING",
  "RESUME_HOSTING",
  "ROLLBACK",
  "SUSPEND_USER",
  "REACTIVATE_USER",
  "CHANGE_PLAN",
];

export default async function AdminActivityPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const query = await searchParams;
  const by = typeof query.by === "string" && query.by ? query.by : undefined;

  const [entries, actors] = await Promise.all([
    listActivity({ action: ACTIONS.find((a) => a === query.action), actor: by }, parseTableQuery(query)),
    listActivityActors(),
  ]);

  return <ActivityView entries={entries} actors={actors} searchParams={query} />;
}
