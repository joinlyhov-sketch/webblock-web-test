// Every href a customer website can produce. Zero-transaction: section anchors, tel:, mailto:,
// Google Maps directions and external https:// links only. Blocks never build hrefs themselves.
import { telHref } from "@/lib/tel";
import type { CtaAction, SiteRootProps } from "../../types";

/** Section anchors. The Header links to these; blocks put the matching `id` on their <section>. */
export const SECTION_ID = { top: "top", shop: "shop", visit: "visit" } as const;

/** "012 345 678" → "tel:+85512345678" (Cambodian numbers drop the leading 0). */
export { telHref };

export function mailtoHref(email: string): string {
  return `mailto:${email}`;
}

export function directionsHref(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export function telegramHref(username: string): string {
  return `https://t.me/${encodeURIComponent(username.replace(/^@/, ""))}`;
}

/** The href for a button's action. Uses the first phone number for "call". */
export function ctaHref(action: CtaAction, site: SiteRootProps): string {
  switch (action) {
    case "shop":
      return `#${SECTION_ID.shop}`;
    case "visit":
      return `#${SECTION_ID.visit}`;
    case "call":
      return site.phones[0] ? telHref(site.phones[0].number) : `#${SECTION_ID.visit}`;
    case "email":
      return site.email ? mailtoHref(site.email) : `#${SECTION_ID.visit}`;
    case "directions":
      return directionsHref(site.address);
  }
}

/** Props for a link that leaves the site (Maps, social, Telegram). */
export const EXTERNAL_LINK = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Spread onto an <a>: adds EXTERNAL_LINK when the href is an https:// URL. */
export function linkProps(href: string) {
  return href.startsWith("https://") ? { href, ...EXTERNAL_LINK } : { href };
}

/** Social links that are filled in, in display order. */
export function socialLinks(site: SiteRootProps): { label: string; href: string }[] {
  return [
    site.telegram && { label: "Telegram", href: telegramHref(site.telegram) },
    site.facebookUrl && { label: "Facebook", href: site.facebookUrl },
    site.instagramUrl && { label: "Instagram", href: site.instagramUrl },
  ].filter((link): link is { label: string; href: string } => Boolean(link));
}
