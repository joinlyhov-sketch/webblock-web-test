import { mockApi } from "@/lib/mock-state";
import type { ActionResult } from "@/lib/actions/result";
import { ApiError } from "@/lib/api/errors";
import { formText } from "@/lib/validation/fields";
import { sendContactMessage } from "./api";
import { parseContact } from "./schemas";

export type ContactReceipt = { email: string };

/**
 * Validates and sends the public contact form. Called by the `/api/contact` Route Handler, not a
 * Server Action: visitors on the landing page are not signed in, so there is no user to require().
 */
export const submitContact = mockApi(async function submitContact(formData: FormData): Promise<ActionResult<ContactReceipt>> {
  const values = {
    name: formText(formData, "name"),
    email: formText(formData, "email"),
    message: formText(formData, "message"),
  };

  const parsed = parseContact(values);
  if (!parsed.ok) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: parsed.fieldErrors, values };
  }

  try {
    const sent = await sendContactMessage(parsed.data);
    return { ok: true, data: { email: sent.email }, message: "Message sent" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message, values };
    throw e;
  }
});
