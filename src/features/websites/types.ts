import type { TemplateCategory } from "@/features/templates/types";

export type WebsiteStatus = "LIVE" | "DRAFT" | "SUSPENDED";

export type Website = {
  id: string;
  name: string;
  businessType: string;
  category: TemplateCategory;
  status: WebsiteStatus;
  /** Public host, e.g. "petalandstem.webblock.com". `null` until the first deploy. */
  domain: string | null;
  templateId: string;
  thumbnailUrl: string;
  updatedAt: string;
  suspendedAt: string | null;
  /** Set when a suspended website was switched back on; `null` otherwise. */
  reactivatedAt: string | null;
};

export type WebsiteStatusCounts = Record<"ALL" | WebsiteStatus, number>;

// Business details entered in the "Use template" wizard (was src/types/business.ts).
export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

/** `opensAt` / `closesAt` are 24-hour "HH:mm" strings. */
export type OpeningHour = {
  day: Weekday;
  open: boolean;
  opensAt: string;
  closesAt: string;
};

export type BusinessDetails = {
  businessName: string;
  businessType: string;
  description: string;
  logoUrl: string | null;
  phone: string;
  email: string;
  address: string;
  hours: OpeningHour[];
};
