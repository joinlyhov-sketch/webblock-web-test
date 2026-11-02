"use client";

import { useMemo, useState } from "react";
import { Add, Layer, LayoutMaximize, SearchNormal1 } from "iconsax-reactjs";
import { EmptyState } from "@/components/common/empty-state";
import { PillSelect } from "@/components/common/filter-select";
import { Modal } from "@/components/common/modal";
import { CATEGORY_LABELS } from "@/config/categories";
import type { Template, TemplateCategory } from "../types";
import { BusinessInfoModal } from "./business-info-modal";
import { TemplateCard } from "./template-card";

/** "Start a new website": pick a template (search and category work in the browser), then fill the form. */
export function ChooseTemplateModal({
  open,
  onClose,
  templates,
  businessTypes,
}: {
  open: boolean;
  onClose: () => void;
  templates: Template[];
  businessTypes: string[];
}) {
  const [selected, setSelected] = useState<Template | null>(null);

  return (
    <>
      <Modal
        open={open && selected === null}
        onClose={onClose}
        label="Start a new website"
        className="max-w-[1288px]"
      >
        <TemplatePicker templates={templates} onClose={onClose} onUse={setSelected} />
      </Modal>
      <BusinessInfoModal
        template={selected}
        businessTypes={businessTypes}
        onClose={() => {
          setSelected(null);
          onClose();
        }}
      />
    </>
  );
}

function TemplatePicker({
  templates,
  onClose,
  onUse,
}: {
  templates: Template[];
  onClose: () => void;
  onUse: (template: Template) => void;
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<TemplateCategory | "">("");

  const categories = useMemo(() => [...new Set(templates.map((t) => t.category))], [templates]);
  const shown = templates.filter(
    (t) =>
      (!category || t.category === category) &&
      (!q.trim() || `${t.name} ${t.description}`.toLowerCase().includes(q.trim().toLowerCase())),
  );

  return (
    <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
      <div className="flex items-center justify-between gap-4 p-[15px]">
        <div className="flex items-center gap-3">
          <span aria-hidden className="flex size-9 items-center justify-center rounded-[10px] bg-chip text-primary">
            <LayoutMaximize className="size-[18px]" />
          </span>
          <div>
            <h2 className="text-[17px] leading-[22.1px] font-semibold tracking-[-0.17px]">Start a new website</h2>
            <p className="text-xs leading-[18px] text-muted-foreground">Pick a template to begin</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-full text-foreground-soft outline-none transition-colors hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <Add aria-hidden className="size-[18px] rotate-45" />
        </button>
      </div>
      <div className="mx-6 h-px shrink-0 bg-border" />

      <div className="flex min-h-0 flex-col gap-[15px] overflow-y-auto p-[15px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex h-11 w-[400px] max-w-full items-center gap-2.5 rounded-full border border-border bg-background px-[14px] focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/25">
            <SearchNormal1 aria-hidden className="size-[17px] shrink-0 text-placeholder" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search templates, e.g. “minimal”"
              aria-label="Search templates"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:appearance-none"
            />
          </label>
          <div className="flex items-center gap-3">
            <p className="text-[13px] leading-[19.5px] text-muted-foreground" aria-live="polite">
              {shown.length} {shown.length === 1 ? "template" : "templates"}
            </p>
            <PillSelect
              label="Category:"
              value={category}
              onValueChange={(next) => setCategory(next as TemplateCategory | "")}
              options={[
                { value: "", label: "All" },
                ...categories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
              ]}
            />
          </div>
        </div>

        {shown.length === 0 ? (
          <EmptyState
            icon={<Layer />}
            title="No templates found"
            description="Try another category or search, or choose All to see every template."
          />
        ) : (
          <div className="grid gap-[15px] sm:grid-cols-2 xl:grid-cols-4">
            {shown.map((template) => (
              <TemplateCard key={template.id} template={template} onUse={onUse} previewClassName="h-[360px]" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
