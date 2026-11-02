/**
 * `tel:` link for a Cambodian phone number as people write it ("012 345 678", "+855 17 222 908"):
 * always international (+855) so it dials from any phone. Zero-transaction rule: CTAs use `tel:+855…`.
 */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  return `tel:+855${digits.replace(/^0/, "")}`;
}
