import { SiteRenderer } from "@/features/editor";
import type { PageData } from "@/features/editor/types";

/** The Iced coffee sample website: the same blocks the editor and a published site use, with the template's own page. */
export function IcedCoffeeSite({ content }: { content: PageData }) {
  return <SiteRenderer data={content} />;
}
