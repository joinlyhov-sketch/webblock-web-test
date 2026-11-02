"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { SiteProduct } from "../types";

type WarmBoldShopProps = {
  products: SiteProduct[];
  categories: string[];
  searchPlaceholder: string;
  totalItems: number;
};

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className="shrink-0">
      <circle cx="8" cy="8" r="5.5" stroke="#b89e8a" strokeWidth="1.5" />
      <path d="M12.5 12.5L16 16" stroke="#b89e8a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function WarmBoldShop({ products, categories, searchPlaceholder, totalItems }: WarmBoldShopProps) {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const tabs = ["All", ...categories];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (active === "All" || p.category === active) && (q === "" || p.name.toLowerCase().includes(q)),
    );
  }, [products, active, query]);

  return (
    <div className="flex flex-col gap-5 lg:gap-9">
      <label className="flex w-full items-center gap-2.5 border-b border-[rgba(246,236,220,0.5)] pb-2.5 transition-colors focus-within:border-[var(--wb-amber)] lg:w-[360px] lg:gap-3">
        <SearchIcon />
        <span className="sr-only">Search products</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-transparent text-sm text-[var(--wb-cream)] outline-none placeholder:text-[var(--wb-muted)] lg:text-[15px]"
        />
      </label>

      <div className="border-b border-[var(--wb-line)]">
        <div role="group" aria-label="Product categories" className="flex gap-[22px] overflow-x-auto lg:gap-9">
          {tabs.map((t) => {
            const on = t === active;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(t)}
                className={`flex shrink-0 flex-col gap-2 text-sm font-medium transition-colors lg:gap-3 lg:text-base ${
                  on ? "text-[var(--wb-cream)]" : "text-[var(--wb-muted)] hover:text-[var(--wb-cream)]"
                } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wb-amber)]`}
              >
                {t}
                <span className={`h-0.5 w-full ${on ? "bg-[var(--wb-amber)]" : "bg-transparent"}`} />
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-[15px] text-[var(--wb-muted)]">No products match your search.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-6 md:gap-y-9 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-11">
          {visible.map((p) => (
            <li key={p.id} className="group flex min-w-0 flex-col gap-2.5 lg:gap-3.5">
              <div className="h-[127px] overflow-hidden rounded bg-[var(--wb-panel)] md:h-[190px] lg:h-[240px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-end gap-2.5 lg:gap-3">
                <h3 className="wb-display min-w-0 text-[13px] leading-tight font-semibold text-[var(--wb-cream)] md:text-lg lg:text-[22px]">
                  {p.name}
                </h3>
                <span aria-hidden className="mb-1 min-w-2 flex-1 border-b border-dotted border-[var(--wb-muted)]/60" />
                <span className="wb-mono shrink-0 text-xs font-medium text-[var(--wb-amber)] md:text-sm lg:text-lg">
                  {formatPrice(p.price, p.currency)}
                </span>
              </div>
              {p.note ? <p className="text-[11px] text-[var(--wb-muted)] md:text-[13px] lg:text-sm">{p.note}</p> : null}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 lg:gap-5">
        <div className="h-px w-full bg-[var(--wb-line)]" />
        <p className="wb-mono text-[11px] tracking-[0.66px] text-[var(--wb-muted)] lg:text-xs lg:tracking-[0.96px]" aria-live="polite">
          SHOWING {visible.length} OF {totalItems} ITEMS
        </p>
      </div>
    </div>
  );
}
