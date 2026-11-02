import type { Metadata } from "next";
import { DeployView, getDeployView } from "@/features/deploy";
import { requireWebsiteOwner } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";

export const metadata: Metadata = { title: "Deploy" };

export default async function DeployPage({
  params,
  searchParams,
}: {
  params: Promise<{ websiteId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { websiteId } = await params;
  const query = await searchParams;
  const user = await requireWebsiteOwner(websiteId);
  const view = await getDeployView(user.id, websiteId, query);
  return <DeployView view={view} />;
}
