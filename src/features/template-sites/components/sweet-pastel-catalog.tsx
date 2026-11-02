"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { SiteProduct } from "../types";

type Props = {
  kicker: string;
  title: string;
  searchPlaceholder: string;
  categories: string[];
  pageSize: number;
  products: SiteProduct[];
};

const TINTS = ["bg-(--sp-butter)", "bg-(--sp-mint)", "bg-(--sp-lilac)", "bg-(--sp-pink-soft)"];

export function SweetPastelCatalog({ kicker, title, searchPlaceholder, categories, pageSize, products }: Props) {
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

  return (
    <div className="flex flex-col gap-8 rounded-[32px] bg-white p-6 md:rounded-[56px] md:p-10 xl:p-16">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-(family-name:--font-caveat) text-[24px] font-bold text-(--sp-pink) md:text-[28px]">{kicker}</p>
          <h2 className="font-(family-name:--font-fredoka) text-[32px] font-bold tracking-[-0.01em] text-(--sp-ink) md:text-[40px] xl:text-[48px]">
            {title}
          </h2>
        </div>
        <label className="flex w-full items-center gap-2.5 rounded-full border border-(--sp-border) bg-(--sp-cream) px-5 py-3 focus-within:ring-2 focus-within:ring-(--sp-pink) lg:w-[380px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mock/template-sites/sweet-pastel/icon-search.svg" alt="" width={18} height={18} />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            aria-label="Search products"
            className="w-full min-w-0 bg-transparent text-[15px] text-(--sp-ink) outline-none placeholder:text-(--sp-muted-2)"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Categories">
        {["All", ...categories].map((c, i) => {
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
              className={`rounded-full px-[18px] py-2.5 text-[15px] font-medium transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-(--sp-ink) focus-visible:outline-none ${
                active ? "bg-(--sp-pink) text-white" : `${TINTS[(i - 1) % 4]} text-(--sp-ink)`
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-[15px] text-(--sp-muted-2)">No treats match your search yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {visible.map((p, i) => (
            <li
              key={p.id}
              className={`group flex flex-col gap-3 rounded-[32px] px-4 pt-4 pb-5 transition-transform hover:-translate-y-1 ${TINTS[i % 4]}`}
            >
              <div className="aspect-[3/2] overflow-hidden rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between gap-2 px-1">
                <h3 className="font-(family-name:--font-fredoka) text-[20px] leading-tight font-semibold text-(--sp-ink) xl:text-[22px]">
                  {p.name}
                </h3>
                <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[14px] font-bold text-(--sp-pink)">
                  {formatPrice(p.price, p.currency)}
                </span>
              </div>
              {p.note && <p className="px-1 text-[14px] text-(--sp-muted-2)">{p.note}</p>}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col items-center gap-3.5">
        {pages > 1 && (
          <div className="flex items-center gap-2.5">
            <PageButton label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)}>
              ‹
            </PageButton>
            {Array.from({ length: pages }, (_, n) => n + 1).map((n) => (
              <PageButton key={n} label={`Page ${n}`} active={n === current} onClick={() => setPage(n)}>
                {n}
              </PageButton>
            ))}
            <PageButton label="Next page" disabled={current === pages} onClick={() => setPage(current + 1)}>
              ›
            </PageButton>
          </div>
        )}
        <p className="text-[14px] text-(--sp-muted-2)">
          Showing {visible.length} of {filtered.length} treats
        </p>
      </div>
    </div>
  );
}

function PageButton({
  children,
  label,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`size-11 rounded-full border text-[15px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-(--sp-pink) focus-visible:outline-none disabled:opacity-40 ${
        active
          ? "border-(--sp-pink) bg-(--sp-pink) text-white"
          : "border-(--sp-border) bg-(--sp-cream) text-(--sp-ink) hover:bg-(--sp-pink-soft)"
      }`}
    >
      {children}
    </button>
  );
}
