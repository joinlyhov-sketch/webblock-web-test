// Small field validators shared by the browser (instant feedback) and the service layer (the real check).

export type FieldErrors = Partial<Record<string, string[]>>;

export type Validated<T> = { ok: true; data: T } | { ok: false; fieldErrors: FieldErrors };

/** Longest valid email address (RFC 5321). Used by every email field, in the schema and as `maxLength`. */
export const EMAIL_MAX = 254;
/** Longest password accepted; anything longer is not a real password and only slows hashing down. */
export const PASSWORD_MAX = 128;
/** A person's full name: sign-up and Settings → Profile share it, so a name that registers can be saved. */
export const FULL_NAME_MAX = 60;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+()\d\s-]{6,20}$/;

/** Collects errors per field; `result()` returns the data only when there are none. */
export function createCollector() {
  const errors: Record<string, string[]> = {};
  const add = (field: string, message: string) => {
    (errors[field] ??= []).push(message);
  };
  return {
    add,
    text(field: string, value: string, label: string, opts: { min?: number; max?: number } = {}) {
      if (!value) add(field, `${label} is required.`);
      else if (opts.min && value.length < opts.min) add(field, `${label} must be at least ${opts.min} characters.`);
      else if (opts.max && value.length > opts.max) add(field, `${label} must be ${opts.max} characters or fewer.`);
    },
    email(field: string, value: string) {
      if (!value) add(field, "Email is required.");
      else if (value.length > EMAIL_MAX) add(field, `Email must be ${EMAIL_MAX} characters or fewer.`);
      else if (!EMAIL.test(value)) add(field, "Enter a valid email address.");
    },
    phone(field: string, value: string) {
      if (!value) add(field, "Phone number is required.");
      else if (!PHONE.test(value)) add(field, "Enter a valid phone number.");
    },
    get hasErrors() {
      return Object.keys(errors).length > 0;
    },
    errors,
    result<T>(data: T): Validated<T> {
      return Object.keys(errors).length > 0 ? { ok: false, fieldErrors: errors } : { ok: true, data };
    },
  };
}

/** Reads a form value as trimmed text ("" when missing or a file). */
export function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}
