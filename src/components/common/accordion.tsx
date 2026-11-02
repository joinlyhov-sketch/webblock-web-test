"use client";

import { useState } from "react";
import { ArrowDown2, MessageQuestion } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

export type AccordionItem = { id: string; question: string; answer: string };

/** One-open-at-a-time list of questions and answers (Figma "FAQ" rows). */
export function Accordion({
  items,
  defaultOpenId,
}: {
  items: AccordionItem[];
  defaultOpenId?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <ul className="flex flex-col gap-2 pt-4 pb-1.5">
      {items.map((item) => {
        const open = item.id === openId;
        return (
          <li
            key={item.id}
            // The border is always there (transparent when closed) so opening doesn't shift the row by 1px.
            className={cn(
              "overflow-clip rounded-xl border transition-colors duration-200",
              open ? "border-faq-open-border bg-primary-soft" : "border-transparent bg-faq-row hover:bg-primary-soft",
            )}
          >
            <h3 className="font-sans">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`faq-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-center gap-2.5 rounded-xl p-3 text-left text-[13px] leading-[19.5px] outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                <MessageQuestion aria-hidden className="size-[18px] shrink-0 text-primary" />
                <span className={cn("min-w-0 flex-1", open ? "font-semibold text-faq-open-text" : "text-foreground")}>
                  {item.question}
                </span>
                <ArrowDown2
                  aria-hidden
                  className={cn(
                    "size-[18px] shrink-0 transition-[rotate,color] duration-200 ease-out",
                    open ? "rotate-180 text-primary" : "text-muted-foreground",
                  )}
                />
              </button>
            </h3>
            {/* Answer slides open/closed (grid rows 0fr ⇄ 1fr) instead of popping in. */}
            <div
              id={`faq-${item.id}`}
              inert={!open}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="mt-1.5 pr-3.5 pb-3 pl-10 text-[13px] leading-5 text-muted-foreground">{item.answer}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
