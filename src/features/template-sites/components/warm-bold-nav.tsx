"use client";

import { useState } from "react";

type NavLink = { label: string; href: string };

type WarmBoldNavProps = {
  brandName: string;
  links: NavLink[];
  openNowLabel: string;
  contactLabel: string;
  contactHref: string;
};

export function WarmBoldNav({ brandName, links, openNowLabel, contactLabel, contactHref }: WarmBoldNavProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const pill = (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#ebf7f0] py-2 pr-3.5 pl-3 text-[13px] font-medium text-[#147345]">
      <span className="size-2 rounded-full bg-[#2fb36b]" aria-hidden />
      {openNowLabel}
    </span>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#46362c] bg-[var(--wb-bg)]">
      <div className="flex items-center justify-between px-5 py-[18px] md:px-10 lg:px-24 lg:py-[22px]">
        <a
          href="#home"
          onClick={close}
          className="wb-display text-xl font-black text-[var(--wb-cream)] transition-colors hover:text-[var(--wb-amber)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--wb-amber)] lg:text-[22px] lg:font-bold"
        >
          ◉ {brandName}
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[15px] text-[var(--wb-nav-muted)] transition-colors hover:text-[var(--wb-cream)] focus-visible:text-[var(--wb-cream)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--wb-amber)]"
            >
              {l.label}
            </a>
          ))}
          {pill}
          <a
            href={contactHref}
            className="inline-flex h-11 w-[143px] items-center justify-center rounded-md bg-[var(--wb-amber)] text-[15px] font-semibold text-[var(--wb-bg)] transition-colors hover:bg-[#ffc968] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wb-cream)]"
          >
            {contactLabel}
          </a>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={contactHref}
            onClick={close}
            className="rounded bg-[var(--wb-amber)] px-3.5 py-2 text-[13px] font-semibold text-[var(--wb-bg)] transition-colors hover:bg-[#ffc968] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wb-cream)]"
          >
            {contactLabel}
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="wb-mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col gap-1 rounded px-1 py-2 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[var(--wb-amber)]"
          >
            <span className={`h-0.5 w-5 rounded-[1px] bg-[var(--wb-cream)] transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 rounded-[1px] bg-[var(--wb-cream)] transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 rounded-[1px] bg-[var(--wb-cream)] transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      <div
        id="wb-mobile-menu"
        hidden={!open}
        className="border-t border-[#46362c] bg-[var(--wb-bg)] px-5 py-4 md:px-10 lg:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={close}
              className="border-b border-[var(--wb-line)] py-3 text-[16px] text-[var(--wb-cream)] transition-colors hover:text-[var(--wb-amber)]"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mt-4">{pill}</div>
      </div>
    </header>
  );
}
