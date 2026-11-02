"use client";

import type { ReactNode } from "react";
import { DevicePreview } from "@/components/common/device-preview";
import { StatusBadge } from "@/components/common/status-badge";
import type { WebsiteStatus } from "@/features/websites";
import type { PageData } from "../../types";
import { SiteRenderer } from "../site-renderer";

/**
 * Website preview (Figma "12 Preview"), same screen as the template preview: back link, name,
 * Desktop / Tablet / Mobile and an action, the saved draft inside a scaled device.
 * The site lays out with container queries, so it responds to each device's screen width.
 */
export function PreviewShell({
  data,
  backHref,
  backLabel,
  siteName,
  status,
  domain,
  badge,
  action,
}: {
  data: PageData;
  backHref: string;
  backLabel: string;
  siteName: string;
  status: WebsiteStatus;
  domain: string | null;
  /** Floating chip top-left, e.g. "Live preview". */
  badge: string;
  action: ReactNode;
}) {
  return (
    <DevicePreview
      backHref={backHref}
      backLabel={backLabel}
      title={
        <>
          <h1 className="truncate font-heading text-[17px] font-semibold text-foreground">
            {siteName}
          </h1>
          <StatusBadge status={status} />
        </>
      }
      action={action}
      badge={badge}
      address={domain ?? "Not deployed yet"}
    >
      {() => (
        <div className="h-full w-full overflow-y-auto bg-background">
          <SiteRenderer data={data} />
        </div>
      )}
    </DevicePreview>
  );
}
