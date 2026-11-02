import { getPlan, listPlans, PlansView } from "@/features/admin";
import { nullIfNotFound } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";

export const metadata = { title: "Manage plans" };

export default async function AdminPlansPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const query = await searchParams;
  const planId = typeof query.edit === "string" && query.edit ? query.edit : null;
  const [plans, editing] = await Promise.all([listPlans(), planId ? getPlan(planId).catch(nullIfNotFound) : null]);
  return <PlansView plans={plans} searchParams={query} editing={editing} />;
}
