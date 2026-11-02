"use client";

import { useActionState, useEffect } from "react";
import { Send2, Sms } from "iconsax-reactjs";
import { Avatar } from "@/components/common/avatar";
import { Modal } from "@/components/common/modal";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/actions/result";
import { cn } from "@/lib/utils";
import { contactOwnerAction } from "../actions";
import type { AdminWebsite } from "../types";

export type ContactOwnerWebsite = Pick<AdminWebsite, "id" | "name" | "ownerName" | "ownerEmail" | "releaseStatus">;

/** Starting text: about the failed deploy when there is one, otherwise just a greeting. */
function draft(website: ContactOwnerWebsite) {
  const firstName = website.ownerName.split(/\s+/)[0] ?? website.ownerName;
  if (website.releaseStatus === "FAILED") {
    return {
      subject: `Your deploy for ${website.name} failed`,
      message: `Hi ${firstName}, the latest deploy of ${website.name} didn't go through. Could you check the website in the editor? We'll redeploy right after.`,
    };
  }
  return { subject: `About your website ${website.name}`, message: `Hi ${firstName}, ` };
}

/**
 * "Email Sovannarith Soeun" popup (Contact owner on User Websites): To (read-only), subject, message,
 * Cancel · Send. The backend sends the email; the form only collects the text.
 */
export function ContactOwnerDialog({
  website,
  open,
  onOpenChange,
}: {
  website: ContactOwnerWebsite;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Modal
      title={`Email ${website.ownerName}`}
      hideTitle
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-[400px] rounded-3xl"
    >
      {/* Mounted only while open, so the form starts from the draft every time. */}
      <ContactOwnerForm website={website} onDone={() => onOpenChange(false)} />
    </Modal>
  );
}

function ContactOwnerForm({ website, onDone }: { website: ContactOwnerWebsite; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    contactOwnerAction.bind(null, website.id),
    null,
  );
  const start = draft(website);
  const values = state?.ok === false ? state.values : undefined;
  const errors = state?.ok === false ? state.fieldErrors : undefined;

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(`Email sent to ${website.ownerName}`, state.message);
      onDone();
    } else if (!state.fieldErrors) {
      toast.error("Couldn't send the email", state.message);
    }
  }, [state, website.ownerName, onDone]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-2.5 p-4">
      <header className="relative -mx-4 -mt-4 mb-1 flex items-center gap-3 overflow-hidden border-b border-border bg-linear-to-br from-brand-soft via-primary-soft/60 to-background px-4 py-3.5">
        {/* Soft blue glow filling the empty right side of the header. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-radial from-primary/20 to-transparent to-70%"
        />
        {/* Small dot grid in the corner, same dots as the landing decor. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-1 right-12 h-14 w-24 bg-[radial-gradient(var(--color-decor-dot)_1.2px,transparent_1.2px)] bg-size-[10px_10px] mask-l-from-10% opacity-70"
        />
        <span className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary [&_svg]:size-[18px]">
          <Sms />
        </span>
        <div className="relative min-w-0 pr-8">
          <h2 className="truncate text-[15px] leading-5 font-semibold text-foreground">Email {website.ownerName}</h2>
          <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <span
              aria-hidden
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                website.releaseStatus === "FAILED" ? "bg-danger" : "bg-primary",
              )}
            />
            {website.name}
            {website.releaseStatus === "FAILED" && <span className="text-danger">· Deploy failed</span>}
          </p>
        </div>
      </header>

      <p className="flex h-10 items-center gap-2.5 rounded-full border border-input bg-surface pr-4 pl-1.5 text-sm">
        <Avatar name={website.ownerName} src={null} size="sm" variant="soft" className="size-7" />
        <span className="text-muted-foreground">To</span>
        <span className="truncate text-foreground">{website.ownerEmail}</span>
      </p>

      <div>
        <label htmlFor="contact-subject" className="sr-only">
          Subject
        </label>
        <Input
          id="contact-subject"
          name="subject"
          defaultValue={values?.subject ?? start.subject}
          placeholder="Subject"
          maxLength={120}
          aria-invalid={!!errors?.subject}
          aria-describedby={errors?.subject ? "contact-subject-error" : undefined}
          className="h-10 rounded-full text-sm"
        />
        {errors?.subject && (
          <p id="contact-subject-error" className="mt-1.5 px-1 text-xs text-danger">
            {errors.subject[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="sr-only">
          Message
        </label>
        <Textarea
          id="contact-message"
          name="message"
          rows={3}
          defaultValue={values?.message ?? start.message}
          placeholder="Write your message"
          maxLength={2000}
          aria-invalid={!!errors?.message}
          aria-describedby={errors?.message ? "contact-message-error" : undefined}
          className="min-h-24 py-2.5 text-sm leading-6"
        />
        {errors?.message && (
          <p id="contact-message-error" className="mt-1.5 px-1 text-xs text-danger">
            {errors.message[0]}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-0.5">
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={pending}>
          {!pending && <Send2 />}
          Send
        </Button>
      </div>
    </form>
  );
}
