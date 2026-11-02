import { z } from "zod";

/** Every website lives under this host: "<name>.webblock.com". */
export const DOMAIN_SUFFIX = ".webblock.com";

export const SUBDOMAIN_MIN = 3;
export const SUBDOMAIN_MAX = 40;

export const subdomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(SUBDOMAIN_MIN, `Use at least ${SUBDOMAIN_MIN} characters.`)
  .max(SUBDOMAIN_MAX, `Use at most ${SUBDOMAIN_MAX} characters.`)
  .regex(/^[a-z0-9-]+$/, "Use only letters, numbers and hyphens.")
  .regex(/^[a-z0-9].*[a-z0-9]$/, "Start and end with a letter or number.");

/** "Petal & Stem" becomes "petalstem": the address suggested on the first deploy. */
export function suggestSubdomain(siteName: string): string {
  return siteName
    // "Café" → "cafe": split accented letters and drop the accent before removing everything else.
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, SUBDOMAIN_MAX);
}

export const idempotencyKeySchema = z.uuid();

/** The plans screen for a deploy the plan does not allow; `reason` lets it say why. */
export function plansHref(websiteId: string, reason?: string): string {
  return `/billing/plans?from=deploy&website=${websiteId}${reason ? `&reason=${reason}` : ""}`;
}
