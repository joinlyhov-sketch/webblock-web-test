import { z } from "zod";
import { EMAIL_MAX, FULL_NAME_MAX, PASSWORD_MAX } from "@/lib/validation/fields";

const email = z.email("Enter a valid email address.").max(EMAIL_MAX, `Use ${EMAIL_MAX} characters or fewer.`);

/** Figma rules: 8+ characters, one uppercase letter and one number. A symbol is optional. */
const newPassword = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(PASSWORD_MAX, `Use ${PASSWORD_MAX} characters or fewer.`)
  .regex(/[A-Z]/, "Add an uppercase letter.")
  .regex(/\d/, "Add a number.");

export const signInInput = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(PASSWORD_MAX, `Use ${PASSWORD_MAX} characters or fewer.`),
});

export const registerInput = z.object({
  fullName: z.string().trim().min(1, "Enter your full name.").max(FULL_NAME_MAX, `Use ${FULL_NAME_MAX} characters or fewer.`),
  email,
});

export const emailInput = z.object({ email });

export const otpInput = z.object({
  email,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export const newPasswordInput = z
  .object({
    email,
    password: newPassword,
    confirmPassword: z.string().max(PASSWORD_MAX),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export type FieldErrors = Partial<Record<string, string[]>>;

/** The `?email=` that carries the address between flow steps, or null when missing/invalid. */
export function emailFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const parsed = email.safeParse(searchParams.email);
  return parsed.success ? parsed.data : null;
}

/** Validate a submitted form against a schema. Works in the browser now and in Server Actions later. */
export function parseForm<T>(
  schema: z.ZodType<T>,
  formData: FormData,
): { ok: true; data: T } | { ok: false; fieldErrors: FieldErrors } {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
}
