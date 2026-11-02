import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplateSiteRenderer } from "@/features/template-sites";
import { getTemplateSiteView } from "@/features/templates";
import { ApiError } from "@/lib/api/errors";

export const metadata: Metadata = { title: "Template website preview", robots: { index: false } };

/** Public, sidebar-less template website. Loaded inside the preview device frames. */
export default async function TemplateSitePage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;
  const site = await getTemplateSiteView(templateId).catch((e: unknown) => {
    if (e instanceof ApiError) notFound();
    throw e;
  });
  return <TemplateSiteRenderer site={site} />;
}
