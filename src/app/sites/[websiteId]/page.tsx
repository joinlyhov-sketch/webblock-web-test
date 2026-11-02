// The published website, as visitors see it. Public: no sign-in (not in proxy.ts's matcher).
// In production each site is served on its own subdomain by the backend; this route renders the same data.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPage, SiteRenderer, type PageData } from "@/features/editor";
import { ApiError } from "@/lib/api/errors";

async function loadPage(websiteId: string): Promise<PageData> {
  try {
    return await getPublishedPage(websiteId);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ websiteId: string }> }): Promise<Metadata> {
  const { websiteId } = await params;
  const page = await loadPage(websiteId);
  return { title: { absolute: page.root.props?.businessName ?? "Website" } };
}

export default async function PublishedSitePage({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;
  const page = await loadPage(websiteId);
  return <SiteRenderer data={page} />;
}
