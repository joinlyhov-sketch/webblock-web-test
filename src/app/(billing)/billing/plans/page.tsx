import { PlansView, getPlansView } from "@/features/billing";
import { requireUser } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";

export const metadata = { title: "Choose a plan" };

export default async function PlansPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const user = await requireUser();
  const view = await getPlansView(user.id, query);
  return <PlansView view={view} />;
}
