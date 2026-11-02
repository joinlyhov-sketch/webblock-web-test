import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CleanMonoSite, EverydayStoreSite, IcedCoffeeSite, JacketsSite, KeyboardsSite, SweetPastelSite, WarmBoldSite } from "@/features/template-sites";
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
  switch (site.slug) {
    case "everyday-store":
      return <EverydayStoreSite content={site.content} />;
    case "sweet-pastel":
      return <SweetPastelSite content={site.content} />;
    case "warm-bold":
      return <WarmBoldSite content={site.content} />;
    case "clean-mono":
      return <CleanMonoSite content={site.content} />;
    case "jackets":
      return <JacketsSite content={site.content} />;
    case "keyboards":
      return <KeyboardsSite content={site.content} />;
    case "iced-coffee":
      return <IcedCoffeeSite content={site.content} />;
  }
}
