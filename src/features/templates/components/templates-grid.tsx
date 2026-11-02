"use client";

import { useState } from "react";
import { Layer } from "iconsax-reactjs";
import { EmptyState } from "@/components/common/empty-state";
import type { Template } from "../types";
import { BusinessInfoModal } from "./business-info-modal";
import { TemplateCard } from "./template-card";

/** Grid of template cards. "Use template" opens the business form for that template. */
export function TemplatesGrid({
  templates,
  businessTypes,
  searching = false,
}: {
  templates: Template[];
  businessTypes: string[];
  /** True when a search word is typed, so the empty state asks for a different keyword. */
  searching?: boolean;
}) {
  const [selected, setSelected] = useState<Template | null>(null);

  if (templates.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center pb-6">
        <EmptyState
          icon={<Layer />}
          title={searching ? "No results found" : "No templates found"}
          description={
            searching ? "Try a different keyword." : "Try another category, or choose All to see every template."
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} onUse={setSelected} />
        ))}
      </div>
      <BusinessInfoModal template={selected} businessTypes={businessTypes} onClose={() => setSelected(null)} />
    </>
  );
}
