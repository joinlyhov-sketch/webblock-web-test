import type { Metadata } from "next";
import { DeployButton, getPageData, PreviewShell } from "@/features/editor";
import { getWebsite } from "@/features/websites";
import { requireWebsiteOwner } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";

export const metadata: Metadata = { title: "Preview" };

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ websiteId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { websiteId } = await params;
  // Opened from a My Websites card (?from=websites) → back goes there; otherwise back to the editor.
  const fromList = (await searchParams).from === "websites";
  await requireWebsiteOwner(websiteId);
  const [website, page] = await Promise.all([
    getWebsite(websiteId),
    getPageData(websiteId),
  ]);
  return (
    <PreviewShell
      data={page.draft}
      backHref={fromList ? "/websites" : `/websites/${websiteId}/edit`}
      backLabel={fromList ? "Back to my websites" : "Back to editor"}
      siteName={website.name}
      status={website.status}
      domain={website.domain}
      badge="Live preview"
      action={
        <DeployButton websiteId={websiteId} />
      }
    />
  );
}
