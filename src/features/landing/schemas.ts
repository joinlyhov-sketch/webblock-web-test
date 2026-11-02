// Contact form rules. The dialog checks them in the browser; the service checks them again on the server.
import { z } from "zod";
import { EMAIL_MAX, FULL_NAME_MAX } from "@/lib/validation/fields";

/** Character limits of the contact form, also used as `maxLength`. */
export const CONTACT_LIMITS = { name: FULL_NAME_MAX, email: EMAIL_MAX, message: 2000 };

/** Letters in any language (Khmer vowel signs are marks, so \p{M} too), spaces and . ' - (Dr. Sokha, O'Neil, Jean-Paul). */
const NAME = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;
/** Any character a name can never contain: digits, emoji, other symbols. */
const NAME_BAD_CHARACTER = /[^\p{L}\p{M} .'’-]/u;
const NAME_MESSAGE = "Use letters only. Spaces, . ' and - are fine.";

export const contactInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .min(2, "Enter your full name.")
    .max(CONTACT_LIMITS.name, `Use ${CONTACT_LIMITS.name} characters or fewer.`)
    .regex(NAME, NAME_MESSAGE),
  // Trimmed first, so a space pasted with the address doesn't make it "invalid".
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(CONTACT_LIMITS.email, `Use ${CONTACT_LIMITS.email} characters or fewer.`)
    .pipe(z.email("Enter a valid email address, like you@example.com.")),
  message: z
    .string()
    .trim()
    .min(1, "Write your message.")
    .min(10, "Write at least 10 characters.")
    .max(CONTACT_LIMITS.message, `Use ${CONTACT_LIMITS.message} characters or fewer.`)
    .regex(/\p{L}/u, "Write your message in words."),
});

export type ContactInput = z.infer<typeof contactInput>;
export type ContactField = keyof ContactInput;
export type FieldErrors = Partial<Record<string, string[]>>;

/** First problem with one field, or `null` when it's fine. The dialog uses it on blur and while fixing. */
export function contactFieldError(field: ContactField, value: string): string | null {
  const parsed = contactInput.shape[field].safeParse(value);
  return parsed.success ? null : (parsed.error.issues[0]?.message ?? "Check this field.");
}

/** While typing a name, only characters that can never be used are flagged (not "too short" yet). */
export function contactNameTypingError(value: string): string | null {
  return NAME_BAD_CHARACTER.test(value) ? NAME_MESSAGE : null;
}

/** Validate the submitted contact form. Used by the dialog and by the service. */
export function parseContact(
  values: Record<string, unknown>,
): { ok: true; data: ContactInput } | { ok: false; fieldErrors: FieldErrors } {
  const parsed = contactInput.safeParse(values);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
}
