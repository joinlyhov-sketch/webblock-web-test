import type { BusinessInfo } from "@/features/business-info/types";
import type { OpeningHour } from "@/features/websites/types";
import { LANTERN_CAFE_ID, MAPLE_AND_RYE_ID, NORTHPOINT_AUDIO_ID, PETAL_AND_STEM_ID } from "./session";
import { daysAgo } from "./time";

function weekdays(opensAt: string, closesAt: string, weekend: Partial<OpeningHour> = {}): OpeningHour[] {
  return (["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const).map((day) => {
    const isWeekend = day === "SATURDAY" || day === "SUNDAY";
    return { day, open: !isWeekend, opensAt, closesAt, ...(isWeekend ? weekend : {}) };
  });
}

export const businessInfo: BusinessInfo[] = [
  {
    websiteId: PETAL_AND_STEM_ID,
    description:
      "Hand-tied bouquets, single stems and event flowers, arranged in our studio and delivered across town.",
    logoUrl: null,
    phone: "012 345 678",
    email: "hello@petalandstem.com",
    address: "18 Garden Lane, Phnom Penh",
    mapsUrl: "https://maps.app.goo.gl/PetalStem18",
    hours: weekdays("09:00", "18:00"),
    updatedAt: daysAgo(13),
  },
  {
    websiteId: MAPLE_AND_RYE_ID,
    description: "Sourdough, rye loaves and seasonal pastries, baked fresh every morning in our small kitchen.",
    logoUrl: null,
    phone: "+855 17 222 908",
    email: "bake@mapleandrye.com",
    address: "41 Street 240, Daun Penh, Phnom Penh",
    mapsUrl: null,
    hours: weekdays("06:30", "14:00", { open: true, opensAt: "07:00", closesAt: "12:00" }),
    updatedAt: daysAgo(1),
  },
  {
    websiteId: LANTERN_CAFE_ID,
    description: "Slow coffee, Khmer teas and light lunches under the lanterns of a restored shophouse.",
    logoUrl: null,
    phone: "096 555 0142",
    email: "hi@lanterncafe.com",
    address: "7 Riverside Walk, Siem Reap",
    mapsUrl: "https://maps.app.goo.gl/LanternCafeSR",
    hours: weekdays("07:00", "21:30", { open: true }),
    updatedAt: daysAgo(4),
  },
  {
    websiteId: NORTHPOINT_AUDIO_ID,
    description: "Headphones, speakers and turntables you can try in store, with honest advice and repairs.",
    logoUrl: null,
    phone: "023 880 114",
    email: "store@northpointaudio.com",
    address: "Unit 3, 92 Norodom Boulevard, Phnom Penh",
    mapsUrl: null,
    hours: weekdays("10:00", "19:00", { open: false }),
    updatedAt: daysAgo(4.1),
  },
];
