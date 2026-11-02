import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/session";
import { getTemplateView, TemplatePreviewer } from "@/features/templates";
import { getBusinessTypes } from "@/features/websites";

export const metadata: Metadata = { title: "Template preview" };

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  await requireUser();
  const [template, businessTypes] = await Promise.all([
    getTemplateView(templateId).catch((e: unknown) => {
      if (e instanceof ApiError && e.status === 404) notFound();
      throw e;
    }),
    getBusinessTypes(),
  ]);

  return <TemplatePreviewer template={template} businessTypes={businessTypes} />;
}
