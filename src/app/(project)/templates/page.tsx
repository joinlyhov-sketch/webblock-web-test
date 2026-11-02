import { requireUser } from "@/lib/auth/session";
import type { SearchParams } from "@/lib/table-query";
import { getTemplatesView, parseInitialTemplateFilter, TemplatesView } from "@/features/templates";
import { getBusinessTypes } from "@/features/websites";

export const metadata = { title: "Templates" };

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  await requireUser();
  const [data, businessTypes] = await Promise.all([getTemplatesView({}), getBusinessTypes()]);

  return <TemplatesView
      templates={data.templates}
      businessTypes={businessTypes}
      initialFilter={parseInitialTemplateFilter(query)}
    />;
}
