"use client";

import { useMemo, useState } from "react";
import type { SiteProduct } from "../types";
import { EverydayStoreProductCard } from "./everyday-store-product-card";

type Props = {
  eyebrow: string;
  title: string;
  searchPlaceholder: string;
  categories: string[];
  pageSize: number;
  emptyLabel: string;
  products: SiteProduct[];
};

function pageList(total: number, current: number): (number | "gap")[] {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

export function EverydayStoreCatalog({ eyebrow, title, searchPlaceholder, categories, pageSize, emptyLabel, products }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (category === categories[0] || p.category === category) && (!q || p.name.toLowerCase().includes(q)),
    );
  }, [products, query, category, categories]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);

  return (
    <section id="shop" className="es-catalog">
      <div className="es-wrap">
        <div className="es-head">
          <span className="es-eyebrow">{eyebrow}</span>
          <h2 className="es-h2">{title}</h2>
        </div>
        <div className="es-tools">
          <label className="es-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <div className="es-tabs" role="group" aria-label="Categories">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className="es-tab"
                aria-pressed={c === category}
                onClick={() => {
                  setCategory(c);
                  setPage(1);
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="es-grid">
          {visible.length === 0 ? (
            <p className="es-empty">{emptyLabel}</p>
          ) : (
            visible.map((p) => <EverydayStoreProductCard key={p.id} product={p} />)
          )}
        </div>
        {totalPages > 1 ? (
          <nav className="es-pager" aria-label="Pagination">
            <div className="es-pages">
              <button type="button" className="es-page es-page-edge" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Previous page">
                <span aria-hidden="true">&lsaquo;</span>
                <span className="es-page-label">Previous</span>
              </button>
              {pageList(totalPages, current).map((n, i) =>
                n === "gap" ? (
                  <span key={`g${i}`} className="es-gap">
                    &hellip;
                  </span>
                ) : (
                  <button key={n} type="button" className="es-page" aria-current={n === current ? "page" : undefined} onClick={() => setPage(n)}>
                    {n}
                  </button>
                ),
              )}
              <button type="button" className="es-page es-page-edge" disabled={current === totalPages} onClick={() => setPage(current + 1)} aria-label="Next page">
                <span className="es-page-label">Next</span>
                <span aria-hidden="true">&rsaquo;</span>
              </button>
            </div>
            <p className="es-pager-info">
              Page <b>{current}</b> of {totalPages}
            </p>
          </nav>
        ) : null}
      </div>
    </section>
  );
}
