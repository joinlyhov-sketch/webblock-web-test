import {
  getWebsite,
  listDeploys,
  listWebsites,
  WebsitesView,
  type PlanCode,
  type ReleaseStatus,
} from "@/features/admin";
import { nullIfNotFound } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/session";
import { parseTableQuery, type SearchParams } from "@/lib/table-query";

export const metadata = { title: "User Websites" };

const RELEASES: ReleaseStatus[] = ["LIVE", "GOING_LIVE", "FAILED"];
const PLANS: PlanCode[] = ["FREE_TRIAL", "PLUS", "PRO", "ULTRA"];
const param = (v: SearchParams[string]) =>
  typeof v === "string" && v ? v : undefined;

export default async function AdminWebsitesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const release = RELEASES.find((r) => r === query.release);
  const websiteId = param(query.website);

  // The tabs' numbers follow the search, plan and owner filters, but not the tab itself.
  const base = {
    q: param(query.q),
    plan: PLANS.find((p) => p === query.plan),
    ownerId: param(query.owner),
  };
  const count = (r?: ReleaseStatus) =>
    listWebsites({ ...base, release: r }, { page: 0, size: 1 }).then(
      (page) => page.totalItems,
    );

  const [websites, releaseCounts, detail] = await Promise.all([
    listWebsites(
      { ...base, release },
      parseTableQuery(query, {
        sort: { field: "lastDeployAt", direction: "desc" },
      }),
    ),
    Promise.all([count(), count("LIVE"), count("FAILED")]).then(
      ([all, live, failed]) => ({ all, live, failed }),
    ),
    websiteId
      ? Promise.all([
          getWebsite(websiteId),
          listDeploys({ websiteId }, { page: 0, size: 3 }),
        ])
          .then(([website, deploys]) => ({ website, deploys }))
          .catch(nullIfNotFound)
      : null,
  ]);

  return (
    <WebsitesView
      websites={websites}
      releaseCounts={releaseCounts}
      searchParams={query}
      detail={detail}
    />
  );
}
