// The saved draft, bare (no chrome): what the My Websites card of a not-yet-deployed website shows.
// Owner only, unlike /sites/[websiteId] which is public and serves the published page.
import type { Metadata } from "next";
import { getPageData, SiteRenderer } from "@/features/editor";
import { requireWebsiteOwner } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Draft", robots: { index: false } };

export default async function DraftPage({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;
  await requireWebsiteOwner(websiteId);
  const page = await getPageData(websiteId);
  return (
    <div className="-m-page">
      <SiteRenderer data={page.draft} />
    </div>
  );
}
