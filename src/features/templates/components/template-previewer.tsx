"use client";

import { useState } from "react";
import { Add } from "iconsax-reactjs";
import { DevicePreview } from "@/components/common/device-preview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Template } from "../types";
import { BusinessInfoModal } from "./business-info-modal";

/** The live template website. It scrolls natively inside the iframe; the frame is scaled by the stage. */
function SiteFrame({
  templateId,
  title,
}: {
  templateId: string;
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full w-full bg-background">
      {loaded ? null : (
        <div
          aria-hidden
          className="absolute inset-0 flex animate-pulse flex-col gap-4 p-6"
        >
          <div className="h-8 w-2/5 rounded-lg bg-muted" />
          <div className="h-40 w-full rounded-xl bg-muted" />
          <div className="h-5 w-3/5 rounded-lg bg-muted" />
          <div className="h-5 w-2/5 rounded-lg bg-muted" />
        </div>
      )}
      <iframe
        src={`/template-sites/${templateId}`}
        title={title}
        onLoad={() => setLoaded(true)}
        className={cn(
          "block h-full w-full border-0 bg-background transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

/** Full-screen template preview with a Desktop / Tablet / Mobile switch and "Use template". */
export function TemplatePreviewer({
  template,
  businessTypes,
}: {
  template: Template;
  businessTypes: string[];
}) {
  const [using, setUsing] = useState(false);

  return (
    <>
      <DevicePreview
        backHref="/templates"
        backLabel="Back to templates"
        title={
          <>
            <h1 className="font-heading text-[17px] font-semibold text-foreground">
              {template.name}
            </h1>
            {template.badge ? (
              <span className="text-xs font-semibold text-primary">
                {template.badge}
              </span>
            ) : null}
          </>
        }
        action={
          <Button size="sm" onClick={() => setUsing(true)}>
            <Add aria-hidden /> Use template
          </Button>
        }
        badge="Template preview"
        address="yourbusiness.webblock.com"
      >
        {(device) => (
          <SiteFrame
            templateId={template.id}
            title={`${template.name} template, ${device} size`}
          />
        )}
      </DevicePreview>

      <BusinessInfoModal
        template={using ? template : null}
        businessTypes={businessTypes}
        onClose={() => setUsing(false)}
      />
    </>
  );
}
