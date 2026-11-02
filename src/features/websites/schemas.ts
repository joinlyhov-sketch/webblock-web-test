import { createCollector, type Validated } from "@/lib/validation/fields";
import type { OpeningHour, Weekday } from "./types";

export const WEEKDAYS: { day: Weekday; label: string }[] = [
  { day: "MONDAY", label: "Monday" },
  { day: "TUESDAY", label: "Tuesday" },
  { day: "WEDNESDAY", label: "Wednesday" },
  { day: "THURSDAY", label: "Thursday" },
  { day: "FRIDAY", label: "Friday" },
  { day: "SATURDAY", label: "Saturday" },
  { day: "SUNDAY", label: "Sunday" },
];

/** Monday to Friday, 9:00 AM – 6:00 PM. */
export function defaultOpeningHours(): OpeningHour[] {
  return WEEKDAYS.map(({ day }) => ({
    day,
    open: day !== "SATURDAY" && day !== "SUNDAY",
    opensAt: "09:00",
    closesAt: "18:00",
  }));
}

/** Every 30 minutes from 5:00 AM to 11:30 PM, as "HH:mm". */
export const TIME_OPTIONS: string[] = Array.from({ length: 38 }, (_, i) => {
  const minutes = 5 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

/** Character limits, shared by the validators and the form inputs (`maxLength`). */
export const BUSINESS_LIMITS = { businessName: 60, businessType: 60, description: 300, address: 150 };
const LIMITS = BUSINESS_LIMITS;

export type BusinessDetailsInput = {
  businessName: string;
  businessType: string;
  description: string;
};

export type BusinessContactInput = {
  phone: string;
  email: string;
  address: string;
  hours: OpeningHour[];
};

export function validateBusinessDetails(input: BusinessDetailsInput): Validated<BusinessDetailsInput> {
  const c = createCollector();
  c.text("businessName", input.businessName, "Business name", { min: 2, max: LIMITS.businessName });
  c.text("businessType", input.businessType, "Business type", { max: LIMITS.businessType });
  c.text("description", input.description, "Description", { min: 10, max: LIMITS.description });
  return c.result(input);
}

export function validateBusinessContact(input: BusinessContactInput): Validated<BusinessContactInput> {
  const c = createCollector();
  c.phone("phone", input.phone);
  c.email("email", input.email);
  c.text("address", input.address, "Address", { max: LIMITS.address });
  if (!input.hours.some((h) => h.open)) c.add("hours", "Turn on at least one day you are open.");
  if (input.hours.some((h) => h.open && h.opensAt >= h.closesAt)) {
    c.add("hours", "Closing time must be later than opening time.");
  }
  return c.result(input);
}
