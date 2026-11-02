"use client";

import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PageHeader } from "@/components/common/page-header";
import { PillSelect } from "@/components/common/filter-select";
import { SearchInput } from "@/components/common/search-input";
import { Pill } from "@/components/common/status-badge";
import { categoryOptions, CATEGORY_BY_PARAM } from "../categories";
import type { Template } from "../types";
import { TemplatesGrid } from "./templates-grid";

/**
 * "Templates": hero with search, then the count + category filter and the grid. Search and category
 * filter the loaded list in state, so typing never reloads the page; the URL is kept in sync with
 * `history.replaceState` so a refresh or a shared link opens on the same view.
 */
export function TemplatesView({
  templates,
  businessTypes,
  initialFilter,
}: {
  templates: Template[];
  businessTypes: string[];
  initialFilter: { q: string; category: string };
}) {
  const [query, setQuery] = useState(initialFilter.q);
  const debouncedQuery = useDebouncedValue(query);
  const [category, setCategory] = useState(initialFilter.category);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    if (category) params.set("category", category);
    const search = params.toString();
    window.history.replaceState(window.history.state, "", search ? `?${search}` : window.location.pathname);
  }, [debouncedQuery, category]);

  const q = debouncedQuery.trim().toLowerCase();
  const visible = useMemo(
    () =>
      templates
        .filter((t) => !category || t.category === CATEGORY_BY_PARAM[category])
        .filter((t) => !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)),
    [templates, category, q],
  );

  return (
    <>
      <section data-stable-gutter className="relative h-[357px] shrink-0 overflow-hidden rounded-[28px] border border-border bg-linear-to-b from-[#fbfcff] to-[#f1f5fd]">
        {/* Dot grid, fading out toward every edge (mask is a gradient, so no box edge is ever visible). */}
        <div
          aria-hidden
          className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_60%_75%_at_50%_45%,black_20%,transparent_100%)]"
        />
        {/* Centre glow: a gradient that reaches transparent well inside its layer, so it never clips. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_45%_55%_at_50%_50%,rgb(67_121_214/0.16),rgb(67_121_214/0.06)_45%,transparent_75%)]"
        />
        {/* Edge fade (Figma "Edge fade"): soft wash toward the top and bottom edges. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_100%_56%_at_50%_50%,rgb(247_249_254/0),rgb(247_249_254/0.2)_60%,rgb(247_249_254/0.9)_100%)]"
        />
        <span aria-hidden className="absolute top-[92px] left-[18%] size-3 rounded-full bg-primary/30 blur-[1px]" />
        <span aria-hidden className="absolute top-[215px] right-[17%] size-[9px] rounded-full bg-primary/20 blur-[1px]" />
        <span aria-hidden className="absolute top-[88px] right-[11%] size-1.5 rounded-full bg-primary/20" />

        <div className="absolute top-[29px] left-1/2 w-[800px] max-w-full -translate-x-1/2 px-4">
          <PageHeader
            align="center"
            size="hero"
            tone="heading"
            className="mb-0"
            eyebrow={
              <Pill outline icon={<span aria-hidden>✦</span>}>
                Choose the one that matches your business
              </Pill>
            }
            title={
              <>
                Start from a website that
                <br />
                already <span className="text-primary">looks like yours</span>
              </>
            }
            description="Same pages, different look. Pick the style that fits your brand, then swap in your name, photos and prices."
          />
        </div>

        <div className="absolute top-[226px] left-1/2 w-[560px] max-w-full -translate-x-1/2 px-4">
          <SearchInput
            variant="hero"
            value={query}
            onValueChange={setQuery}
            placeholder="Search templates, e.g. “minimal”"
            label="Search templates"
          />
        </div>
      </section>

      <div className="flex items-center gap-2">
        <p className="text-[13px] leading-[19.5px] text-muted-foreground" aria-live="polite">
          {visible.length} {visible.length === 1 ? "template" : "templates"}
        </p>
        <span aria-hidden className="h-px flex-1" />
        <PillSelect label="Category:" value={category} onValueChange={setCategory} options={categoryOptions} />
      </div>

      <TemplatesGrid templates={visible} businessTypes={businessTypes} searching={q !== ""} />
    </>
  );
}
