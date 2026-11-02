"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TocSection = { id: string; heading: string };

/**
 * "On this page" list of /privacy and /terms. The section being read gets the brand background:
 * the last heading that has scrolled past the top third of the screen.
 */
export function LegalToc({ sections }: { sections: TocSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const headings = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    function update() {
      const line = window.innerHeight / 3;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      // At the very bottom the last sections can never reach the line, so the last one wins.
      const current = atBottom
        ? headings[headings.length - 1]
        : (headings.findLast((el) => el.getBoundingClientRect().top <= line) ?? headings[0]);
      setActiveId(current.id);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  return (
    <ol className="flex flex-col gap-1">
      {sections.map((section) => {
        const active = section.id === activeId;
        return (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active ? "location" : undefined}
              onClick={() => setActiveId(section.id)}
              className={cn(
                "block rounded-lg px-3 py-1.5 text-sm leading-5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                active
                  ? "bg-brand-soft font-medium text-brand-strong"
                  : "text-foreground-soft hover:bg-muted hover:text-brand-strong",
              )}
            >
              {section.heading}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
