import { SiteRenderer } from "@/features/editor";
import type { PageData } from "@/features/editor/types";

/** The Keyboards sample website: the same blocks the editor and a published site use, with the template's own page. */
export function KeyboardsSite({ content }: { content: PageData }) {
  return <SiteRenderer data={content} />;
}
