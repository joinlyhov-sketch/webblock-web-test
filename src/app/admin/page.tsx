import { getOverview, listDeploys, OverviewView } from "@/features/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  await requireAdmin();
  const [overview, deploys] = await Promise.all([
    getOverview(),
    listDeploys({}, { page: 0, size: 3 }),
  ]);
  return <OverviewView overview={overview} deploys={deploys} />;
}
