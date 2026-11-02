"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { SiteProduct } from "../types";

type Props = {
  eyebrow: string;
  title: string;
  totalCount: number;
  categories: string[];
  searchPlaceholder: string;
  products: SiteProduct[];
  pageSize?: number;
};

export function CleanMonoCatalog({ eyebrow, title, totalCount, categories, searchPlaceholder, products, pageSize = 8 }: Props) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (category === "All" || p.category === category) && (q === "" || p.name.toLowerCase().includes(q)),
    );
  }, [products, category, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);
  const isAll = category === "All" && query.trim() === "";
  const total = isAll ? Math.max(totalCount, filtered.length) : filtered.length;

  return (
    <section id="products" className="mx-auto flex max-w-[1536px] flex-col gap-8 px-5 pt-6 pb-16 sm:px-10 lg:px-24 lg:pb-24">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-3.5">
          <p className="cm-mono text-[12px] tracking-[0.06em] text-(--cm-muted)">{eyebrow}</p>
          <h2 className="cm-display text-[34px] leading-[1.05] font-bold tracking-[-0.02em] text-(--cm-ink) sm:text-[44px] lg:text-[56px]">
            {title}
          </h2>
        </div>
        <p className="cm-mono pb-3 text-[12px] tracking-[0.06em] whitespace-nowrap text-(--cm-muted)">{total} PRODUCTS</p>
      </div>

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Product categories" className="-mx-5 flex gap-6 overflow-x-auto px-5 sm:mx-0 sm:gap-8 sm:px-0">
          {["All", ...categories].map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setCategory(c);
                  setPage(1);
                }}
                className={`flex flex-col gap-2.5 text-[15px] font-medium whitespace-nowrap transition-colors hover:text-(--cm-ink) ${
                  active ? "text-(--cm-ink)" : "text-(--cm-muted)"
                }`}
              >
                {c}
                <span className={`h-0.5 w-full ${active ? "bg-(--cm-ink)" : "bg-transparent"}`} />
              </button>
            );
          })}
        </div>
        <label className="flex w-full items-center gap-3 border border-(--cm-ink) px-4 py-3 md:w-80">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden className="shrink-0 text-(--cm-ink)">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full min-w-0 bg-transparent text-[15px] text-(--cm-ink) outline-none placeholder:text-(--cm-muted)"
          />
        </label>
      </div>

      <div className="h-px bg-(--cm-line)" />

      {visible.length === 0 ? (
        <p className="py-12 text-center text-[15px] text-(--cm-muted)">No products match your search.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-8 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {visible.map((p) => (
            <li key={p.id} className="cm-card flex flex-col gap-3.5">
              <div className="aspect-[4/3] overflow-hidden bg-(--cm-soft) lg:aspect-auto lg:h-[270px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.name} loading="lazy" className="cm-zoom size-full object-cover" />
              </div>
              <div className="h-px bg-(--cm-ink)" />
              <div className="flex items-baseline justify-between gap-3 text-(--cm-ink)">
                <h3 className="cm-display text-[18px] leading-tight font-medium lg:text-[20px]">{p.name}</h3>
                <span className="cm-mono text-[14px] whitespace-nowrap">{formatPrice(p.price, p.currency)}</span>
              </div>
              {p.note && <p className="text-[14px] text-(--cm-muted)">{p.note}</p>}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-[18px]">
        <div className="h-px bg-(--cm-line)" />
        <div className="cm-mono flex items-center justify-between">
          <p className="text-[12px] tracking-[0.06em] text-(--cm-muted)">
            SHOWING {visible.length} OF {total}
          </p>
          {pages > 1 && (
            <div className="flex items-center gap-6 text-[14px]">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-current={n === current ? "page" : undefined}
                  onClick={() => setPage(n)}
                  className={n === current ? "text-(--cm-ink) underline" : "text-(--cm-muted) hover:text-(--cm-ink)"}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                aria-label="Next page"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
                className="text-(--cm-muted) hover:text-(--cm-ink) disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
