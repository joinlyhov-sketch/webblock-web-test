"use client";

import { useState } from "react";

type Props = {
  name: string;
  openNowLabel: string;
  links: { label: string; href: string }[];
  contactHref: string;
};

export function CleanMonoHeader({ name, openNowLabel, links, contactHref }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-(--cm-line) bg-white">
      <div className="mx-auto flex max-w-[1536px] items-center justify-between px-5 py-4 sm:px-10 lg:px-24 lg:py-[22px]">
        <a href="#top" onClick={close} className="cm-display text-[18px] leading-[33px] font-bold text-(--cm-ink) lg:text-[22px]">
          ▲ {name}
        </a>

        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="cm-link text-[15px] text-(--cm-nav)">
              {l.label}
            </a>
          ))}
          <span className="hidden items-center gap-2 rounded-full bg-(--cm-open-bg) py-2 pr-3.5 pl-3 text-[13px] font-medium text-(--cm-open) lg:inline-flex">
            <span className="size-2 rounded-full bg-(--cm-open)" aria-hidden />
            {openNowLabel}
          </span>
          <a
            href={contactHref}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-(--cm-accent) px-5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Contact
          </a>
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="cm-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-11 items-center justify-center border border-(--cm-ink) md:hidden"
        >
          <span className="relative block h-3 w-5" aria-hidden>
            <span className={`absolute left-0 h-0.5 w-5 bg-(--cm-ink) transition-all ${open ? "top-[5px] rotate-45" : "top-0"}`} />
            <span className={`absolute top-[5px] left-0 h-0.5 w-5 bg-(--cm-ink) transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 h-0.5 w-5 bg-(--cm-ink) transition-all ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
          </span>
        </button>
      </div>

      {open && (
        <nav id="cm-mobile-nav" aria-label="Mobile" className="border-t border-(--cm-line) bg-white px-5 pb-5 sm:px-10 md:hidden">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href} className="border-b border-(--cm-line)">
                <a href={l.href} onClick={close} className="block py-3.5 text-[16px] font-medium text-(--cm-ink)">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-(--cm-open-bg) py-2 pr-3.5 pl-3 text-[13px] font-medium text-(--cm-open)">
            <span className="size-2 rounded-full bg-(--cm-open)" aria-hidden />
            {openNowLabel}
          </span>
          <a
            href={contactHref}
            onClick={close}
            className="mt-4 flex h-11 items-center justify-center rounded-lg bg-(--cm-accent) text-[15px] font-semibold text-white"
          >
            Contact
          </a>
        </nav>
      )}
    </header>
  );
}
