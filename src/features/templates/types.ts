export type TemplateCategory = "CLOTHES" | "FOOD_BEVERAGES" | "TECHNOLOGY" | "HANDMADE";

export type TemplatePreviewImage = { url: string; width: number; height: number };

export type TemplatePreviews = {
  /** Full-page capture, used only as the small tilted preview in the business-info modal. */
  desktop: TemplatePreviewImage;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnailUrl: string;
  /** Short label shown next to the name on the preview screen, e.g. "Popular". */
  badge?: string;
  /** Static capture for the business-info modal. The preview screen loads the live /template-sites/<id> page. */
  previews: TemplatePreviews;
};
