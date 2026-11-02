// Data access for templates. Mock now, Spring later.
import { ApiError } from "@/lib/api/errors";
import { delay } from "@/lib/api/delay";
import type { Page } from "@/lib/api/types";
import { toPage } from "@/lib/table-query";
import { templates } from "@/mocks/templates";
import { templateSites } from "@/mocks/template-sites";
import type { TemplateSite } from "@/features/template-sites/types";
import type { Template, TemplateCategory } from "./types";

export type ListTemplatesFilter = {
  category?: TemplateCategory;
  q?: string;
};

export async function listTemplates(filter: ListTemplatesFilter = {}): Promise<Page<Template>> {
  await delay();
  const q = filter.q?.trim().toLowerCase();
  const items = templates
    .filter((t) => !filter.category || t.category === filter.category)
    .filter(
      (t) => !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  return toPage(items, { page: 0, size: 100 });
}

export async function getTemplate(templateId: string): Promise<Template> {
  await delay(100);
  const template = templates.find((t) => t.id === templateId);
  if (!template) {
    throw new ApiError({ title: "Template not found", status: 404, detail: "That template is not available." });
  }
  return template;
}

export async function getTemplateSite(templateId: string): Promise<TemplateSite> {
  await delay(50);
  const site = templateSites[templateId];
  if (!site) {
    throw new ApiError({ title: "Template not found", status: 404, detail: "That template is not available." });
  }
  return site;
}
