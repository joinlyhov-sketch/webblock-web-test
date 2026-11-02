"use client";

import { useState } from "react";

type Props = {
  brand: string;
  openNote: string;
  links: { label: string; href: string }[];
  contactHref: string;
};

export function SweetPastelNav({ brand, openNote, links, contactHref }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-(--sp-line) bg-(--sp-cream)">
      <div className="flex items-center justify-between px-5 py-4 md:px-12 md:py-[22px] xl:px-24">
        <a
          href="#home"
          className="font-(family-name:--font-fredoka) text-[20px] font-bold text-(--sp-ink) outline-none focus-visible:ring-2 focus-visible:ring-(--sp-pink) md:text-[22px]"
        >
          ✧ {brand}
        </a>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[15px] text-(--sp-muted) transition-colors hover:text-(--sp-pink) focus-visible:text-(--sp-pink) focus-visible:outline-none"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#visit"
            className="flex items-center gap-2 rounded-full bg-(--sp-mint-soft) py-2 pr-3.5 pl-3 text-[13px] font-medium text-(--sp-green) transition-opacity hover:opacity-80"
          >
            <span className="size-2 rounded-full bg-(--sp-green-dot)" />
            {openNote}
          </a>
          <a
            href={contactHref}
            className="flex h-11 items-center justify-center rounded-full bg-(--sp-pink) px-5 text-[15px] font-semibold text-white transition-colors hover:bg-(--sp-pink-dark) focus-visible:ring-2 focus-visible:ring-(--sp-ink) focus-visible:outline-none"
          >
            Contact
          </a>
        </nav>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full bg-(--sp-pink-soft) text-(--sp-ink) transition-colors hover:bg-(--sp-pink-tint) focus-visible:ring-2 focus-visible:ring-(--sp-pink) focus-visible:outline-none lg:hidden"
          aria-expanded={open}
          aria-controls="sp-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
          </svg>
        </button>
      </div>
      {open && (
        <div id="sp-mobile-menu" className="flex flex-col gap-1 border-t border-(--sp-line) px-5 pt-3 pb-5 md:px-12 lg:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={close} className="rounded-2xl px-3 py-3 text-[16px] text-(--sp-ink) hover:bg-(--sp-pink-soft)">
              {l.label}
            </a>
          ))}
          <a
            href="#visit"
            onClick={close}
            className="mt-1 flex w-fit items-center gap-2 rounded-full bg-(--sp-mint-soft) px-3 py-2 text-[13px] font-medium text-(--sp-green)"
          >
            <span className="size-2 rounded-full bg-(--sp-green-dot)" />
            {openNote}
          </a>
          <a
            href={contactHref}
            onClick={close}
            className="mt-2 flex h-11 items-center justify-center rounded-full bg-(--sp-pink) text-[15px] font-semibold text-white hover:bg-(--sp-pink-dark)"
          >
            Contact
          </a>
        </div>
      )}
    </header>
  );
}
