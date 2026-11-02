// Sidebar items. No count badges.

/** Icon names, mapped to iconsax icons in components/layout/sidebar-nav.tsx. */
export type NavIcon =
  | "websites"
  | "templates"
  | "settings"
  | "support"
  | "products"
  | "business"
  | "monitor"
  | "overview"
  | "users"
  | "subscriptions"
  | "monitoring";

export type NavItem = {
  label: string;
  href: string;
  /** Only active on this exact path (for section roots like /admin). */
  exact?: boolean;
  icon?: NavIcon;
  /** Sub-pages shown under the item; the item itself is then a group toggle, not a link. */
  children?: NavItem[];
};

export const userNav: NavItem[] = [
  { label: "My Websites", href: "/websites", icon: "websites" },
  { label: "Templates", href: "/templates", icon: "templates" },
  { label: "Settings", href: "/settings", icon: "settings" },
  { label: "Contact Support", href: "/support", icon: "support" },
];

export function ownerNav(websiteId: string): NavItem[] {
  const base = `/portal/${websiteId}`;
  return [
    { label: "Products", href: `${base}/products`, icon: "products" },
    { label: "Business information", href: `${base}/info`, icon: "business" },
    { label: "Monitor", href: `${base}/monitoring`, icon: "monitor" },
  ];
}

// Notifications open from the header bell; plans are managed from Subscriptions.
export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", exact: true, icon: "overview" },
  { label: "User Accounts", href: "/admin/users", icon: "users" },
  { label: "User Websites", href: "/admin/websites", icon: "websites" },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: "subscriptions" },
  {
    label: "Monitoring",
    href: "/admin/monitoring",
    icon: "monitoring",
    children: [
      { label: "Pipeline & Generation", href: "/admin/monitoring/pipeline" },
      { label: "Activity Log", href: "/admin/monitoring/activity" },
    ],
  },
];
