import {
  getOverview,
  getWebsite,
  listDeploys,
  OverviewView,
} from "@/features/admin";
import { nullIfNotFound } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";

export const metadata = { title: "Overview" };

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const websiteId =
    typeof query.website === "string" && query.website ? query.website : undefined;
  const [overview, deploys, detail] = await Promise.all([
    getOverview(),
    listDeploys({}, { page: 0, size: 3 }),
    websiteId
      ? Promise.all([
          getWebsite(websiteId),
          listDeploys({ websiteId }, { page: 0, size: 3 }),
        ])
          .then(([website, siteDeploys]) => ({ website, deploys: siteDeploys }))
          .catch(nullIfNotFound)
      : null,
  ]);
  return <OverviewView overview={overview} deploys={deploys} detail={detail} />;
}
