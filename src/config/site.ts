export const siteConfig = {
  name: "WebBlock",
  description: "Build a showcase website for your business in minutes.",
  supportEmail: "support@webblock.com",
} as const;

/**
 * Where "Visit site" opens (in a new tab). The backend will serve each live site on its own
 * subdomain; until then the app renders the published page itself (app/sites/[websiteId]).
 */
export function liveSiteHref(websiteId: string): string {
  return `/sites/${websiteId}`;
}
