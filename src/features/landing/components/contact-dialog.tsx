"use client";

import { useEffect, useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { CloseCircle, Profile, Sms, TickCircle } from "iconsax-reactjs";
import { FormField } from "@/components/common/form-field";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/actions/result";
import { siteConfig } from "@/config/site";
import { CONTACT_HASH } from "../content";
import {
  CONTACT_LIMITS as LIMITS,
  contactFieldError,
  contactNameTypingError,
  parseContact,
  type ContactField,
  type FieldErrors,
} from "../schemas";
import type { ContactReceipt } from "../service";

const labelClass = "text-[13px] leading-[19.5px]";
const fieldClass = "h-[46px] rounded-xl bg-background px-3.5 pl-[42px] text-sm";
const fieldIconClass = "left-3.5 text-foreground";

/** Opens when the URL hash is `#contact-form`; closing clears the hash so the same link opens it again. */
function useContactHash(): [boolean, () => void] {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(window.location.hash === CONTACT_HASH);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  function close() {
    setOpen(false);
    if (window.location.hash === CONTACT_HASH) {
      history.replaceState(history.state, "", window.location.pathname + window.location.search);
    }
  }

  return [open, close];
}

/**
 * "Talk to us" popup on the landing, privacy and terms pages: name, email and message, sent to
 * `/api/contact`. Every "Talk to us", "Email support" and "Contact" link points at `#contact-form`.
 */
export function ContactDialog() {
  const [open, close] = useContactHash();

  return (
    <Modal open={open} onClose={close} label="Talk to us" className="max-w-[520px] rounded-[24px]">
      <ContactForm onClose={close} />
    </Modal>
  );
}

/** Field order on screen, to focus the first one with an error. */
const FIELDS: ContactField[] = ["name", "email", "message"];

/** Mounted fresh each time the popup opens (Modal unmounts closed content), so it always starts empty. */
function ContactForm({ onClose }: { onClose: () => void }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const checked = parseContact(Object.fromEntries(formData));
    setErrors(checked.ok ? {} : checked.fieldErrors);
    setFailure(null);
    if (!checked.ok) {
      // Take the visitor to the first field that needs fixing.
      const first = FIELDS.find((field) => checked.fieldErrors[field]?.length);
      if (first) e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/contact", { method: "POST", body: formData });
      const result = (await response.json()) as ActionResult<ContactReceipt>;
      if (result.ok) setSentTo(result.data.email);
      else {
        setErrors(result.fieldErrors ?? {});
        setFailure(result.message);
      }
    } catch {
      setFailure(`We couldn't send your message. Check your connection, or email ${siteConfig.supportEmail}.`);
    } finally {
      setPending(false);
    }
  }

  const error = (field: string) => errors[field]?.[0];

  function setFieldError(field: ContactField, message: string | null) {
    setErrors((current) => ({ ...current, [field]: message ? [message] : undefined }));
  }

  /**
   * While typing: a field already marked wrong is re-checked on every key, so the message goes away
   * as soon as it's fixed. A name also flags digits and symbols right away; nothing else nags yet.
   */
  function onFieldChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const field = e.target.name as ContactField;
    const value = e.target.value;
    if (errors[field]?.length) setFieldError(field, contactFieldError(field, value));
    else if (field === "name") setFieldError(field, contactNameTypingError(value));
  }

  /** Leaving a field checks it fully. Empty fields wait for "Send message" so tabbing past doesn't nag. */
  function onFieldBlur(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const field = e.target.name as ContactField;
    if (e.target.value.trim()) setFieldError(field, contactFieldError(field, e.target.value));
  }

  const fieldEvents = { onChange: onFieldChange, onBlur: onFieldBlur };

  return (
    <div className="relative flex flex-col gap-5 p-6 sm:p-8">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <CloseCircle variant="Outline" aria-hidden className="size-5" />
      </button>

      {sentTo ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
            <TickCircle variant="Outline" aria-hidden className="size-7" />
          </span>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Message sent</h2>
          <p className="text-[15px] leading-6 text-foreground-soft">
            Thanks for writing. We usually reply to <strong className="font-semibold text-foreground">{sentTo}</strong>{" "}
            within 48 hours.
          </p>
          <Button onClick={onClose} className="mt-2">
            Done
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5 pr-8">
            <h2 className="font-heading text-2xl font-semibold text-foreground">Talk to us</h2>
            <p className="text-[15px] leading-6 text-foreground-soft">
              Questions about WebBlock? Send us a message and we’ll reply by email.
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <FormField id="contact-name" label="Your name" labelClassName={labelClass} error={error("name")}>
              <Input
                id="contact-name"
                name="name"
                autoComplete="name"
                maxLength={LIMITS.name}
                icon={<Profile variant="Outline" />}
                iconClassName={fieldIconClass}
                className={fieldClass}
                placeholder="e.g. Sokha Chan"
                {...fieldEvents}
                aria-invalid={!!error("name") || undefined}
                aria-describedby={error("name") ? "contact-name-hint" : undefined}
              />
            </FormField>
            <FormField id="contact-email" label="Email" labelClassName={labelClass} error={error("email")}>
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={LIMITS.email}
                icon={<Sms variant="Outline" />}
                iconClassName={fieldIconClass}
                className={fieldClass}
                placeholder="you@example.com"
                {...fieldEvents}
                aria-invalid={!!error("email") || undefined}
                aria-describedby={error("email") ? "contact-email-hint" : undefined}
              />
            </FormField>
            <FormField id="contact-message" label="Message" labelClassName={labelClass} error={error("message")}>
              <Textarea
                id="contact-message"
                name="message"
                maxLength={LIMITS.message}
                placeholder="How can we help?"
                {...fieldEvents}
                className="min-h-[140px] rounded-xl px-3.5 py-3 text-sm leading-[21.7px]"
                aria-invalid={!!error("message") || undefined}
                aria-describedby={error("message") ? "contact-message-hint" : undefined}
              />
            </FormField>

            {failure && (
              <p role="alert" className="text-[13px] text-danger">
                {failure}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                Send message
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
