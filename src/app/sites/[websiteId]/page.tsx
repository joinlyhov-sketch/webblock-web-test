// The published website, as visitors see it. Public: no sign-in (not in proxy.ts's matcher).
// In production each site is served on its own subdomain by the backend; this route renders the same data.
// A live site that has no saved page yet shows the template it was built from.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPage, SiteRenderer, type PageData } from "@/features/editor";
import { TemplateSiteRenderer } from "@/features/template-sites";
import { getTemplateSiteView } from "@/features/templates";
import { getWebsite } from "@/features/websites";
import { ApiError } from "@/lib/api/errors";

/** Mock templates ("…1c01" to "…1c08"): the fallback for live sites the websites mock does not know. */
const TEMPLATE_IDS = Array.from({ length: 8 }, (_, i) => `c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c0${i + 1}`);

type Loaded = { kind: "page"; page: PageData } | { kind: "template"; templateId: string };

async function load(websiteId: string): Promise<Loaded> {
  try {
    return { kind: "page", page: await getPublishedPage(websiteId) };
  } catch (e) {
    if (!(e instanceof ApiError) || e.status !== 404) throw e;
  }
  const website = await getWebsite(websiteId).catch(() => null);
  if (website?.status === "SUSPENDED") notFound();
  const hash = [...websiteId].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return { kind: "template", templateId: website?.templateId ?? TEMPLATE_IDS[hash % TEMPLATE_IDS.length] };
}

export async function generateMetadata({ params }: { params: Promise<{ websiteId: string }> }): Promise<Metadata> {
  const { websiteId } = await params;
  const loaded = await load(websiteId);
  return { title: { absolute: loaded.kind === "page" ? (loaded.page.root.props?.businessName ?? "Website") : "Website" } };
}

export default async function PublishedSitePage({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;
  const loaded = await load(websiteId);
  if (loaded.kind === "page") return <SiteRenderer data={loaded.page} />;
  const site = await getTemplateSiteView(loaded.templateId);
  return <TemplateSiteRenderer site={site} />;
}
