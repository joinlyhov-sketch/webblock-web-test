"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Call, CloseCircle, Location, Send2, Sms } from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import { useSite } from "./site-context";
import { directionsHref, EXTERNAL_LINK, linkProps, mailtoHref, telegramHref, telHref } from "./site-links";

/**
 * Figma "Overlay · Contact" ("Get in touch"): every way to reach the business.
 * Zero-transaction: phone, Telegram, email and directions only. Styled with the site theme tokens.
 * `trigger` renders the button that opens it.
 */
export function ContactDialog({
  trigger,
}: {
  trigger: (open: () => void) => ReactNode;
}) {
  const site = useSite();
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const rows = [
    ...site.phones.map((p) => ({ icon: Call, label: "Phone", value: p.number, action: "Call", href: telHref(p.number) })),
    ...(site.telegram
      ? [{ icon: Send2, label: "Telegram", value: `@${site.telegram}`, action: "Message", href: telegramHref(site.telegram) }]
      : []),
    ...(site.email ? [{ icon: Sms, label: "Email", value: site.email, action: "Write", href: mailtoHref(site.email) }] : []),
  ];

  return (
    <>
      {trigger(() => setOpen(true))}
      <dialog
        ref={ref}
        aria-labelledby="site-contact-title"
        onClose={() => setOpen(false)}
        // Click on the backdrop (the dialog element itself) closes it.
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        className="m-auto w-[min(424px,calc(100vw-32px))] rounded-site-card bg-site-surface p-0 font-site-body text-site-ink shadow-xl backdrop:bg-site-ink/45"
      >
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="site-contact-title" className="font-site-heading text-xl font-semibold">
                Get in touch
              </h2>
              <p className="mt-1 text-[13px] text-site-muted">Call or message us · we usually reply within a few hours.</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="text-site-muted transition-colors hover:text-site-ink focus-visible:outline-2 focus-visible:outline-site-accent"
            >
              <CloseCircle variant="Outline" className="size-6" />
            </button>
          </div>

          <ul className="flex flex-col gap-2">
            {rows.map((row) => (
              <li key={`${row.label}-${row.value}`}>
                <a
                  {...linkProps(row.href)}
                  className="flex items-center gap-3 rounded-site-card bg-site-alt px-3 py-2.5 transition-colors hover:bg-site-accent-soft focus-visible:outline-2 focus-visible:outline-site-accent"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-site-surface text-site-accent">
                    <row.icon variant="Outline" aria-hidden className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] tracking-wide text-site-muted uppercase">{row.label}</span>
                    <span className="block truncate text-sm font-medium">{row.value}</span>
                  </span>
                  <span className="text-[13px] font-semibold text-site-accent">{row.action}</span>
                </a>
              </li>
            ))}
          </ul>

          {site.address && (
            <p className="flex gap-2 text-[13px] text-site-muted">
              <Location variant="Outline" aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>
                {site.address} ·{" "}
                <a href={directionsHref(site.address)} {...EXTERNAL_LINK} className={cn("font-semibold text-site-accent hover:underline")}>
                  Get directions ↗
                </a>
                {site.hoursDetail && <span className="block">{site.hoursDetail}</span>}
              </span>
            </p>
          )}
        </div>
      </dialog>
    </>
  );
}
