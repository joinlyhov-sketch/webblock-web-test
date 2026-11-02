import { getTemplate, getTemplateSite, listTemplates } from "./api";
import type { SearchParams } from "@/lib/table-query";
import { CATEGORY_BY_PARAM } from "./categories";
import type { Template } from "./types";
import type { TemplateSite } from "@/features/template-sites/types";

export type TemplatesView = {
  templates: Template[];
  q: string;
  category: string;
};

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Starting filter read from the URL, so a shared or refreshed link opens on the same search. */
export function parseInitialTemplateFilter(searchParams: SearchParams): { q: string; category: string } {
  const category = first(searchParams.category);
  return { q: first(searchParams.q).trim(), category: category in CATEGORY_BY_PARAM ? category : "" };
}

export async function getTemplatesView(searchParams: SearchParams): Promise<TemplatesView> {
  const categoryParam = first(searchParams.category);
  const q = first(searchParams.q).trim();
  const page = await listTemplates({ category: CATEGORY_BY_PARAM[categoryParam], q });
  return {
    templates: page.items,
    q,
    category: categoryParam in CATEGORY_BY_PARAM ? categoryParam : "",
  };
}

export async function getTemplateView(templateId: string): Promise<Template> {
  return getTemplate(templateId);
}

export async function getTemplateSiteView(templateId: string): Promise<TemplateSite> {
  return getTemplateSite(templateId);
}
