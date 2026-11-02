"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "../../types";

/** "All" chip value. */
export const ALL_CATEGORIES = "All";

/**
 * Search + category chips + pagination for an All products block. State is local to the visitor's
 * browser tab (this is the customer website, not a platform screen, so it does not use the URL).
 */
export function useProductBrowser(products: Product[], categories: Category[], pageSize: number) {
  const [query, setQueryState] = useState("");
  const [category, setCategoryState] = useState(ALL_CATEGORIES);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === ALL_CATEGORIES || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
  }, [products, query, category]);

  const size = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, totalPages - 1);

  return {
    query,
    /** Changing the search goes back to page 1. */
    setQuery: (value: string) => {
      setQueryState(value);
      setPage(0);
    },
    category,
    setCategory: (value: string) => {
      setCategoryState(value);
      setPage(0);
    },
    /** Chip labels, "All" first. */
    chips: [ALL_CATEGORIES, ...categories.map((c) => c.name)],
    /** Zero-based. */
    page: current,
    setPage,
    totalPages,
    items: filtered.slice(current * size, current * size + size),
    /** Matching products across all pages. */
    total: filtered.length,
  };
}
