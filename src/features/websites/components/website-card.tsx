import Image from "next/image";
import Link from "next/link";
import { Edit2, Global } from "iconsax-reactjs";
import { CategoryBadge } from "@/components/common/category-badge";
import { PlanBadge, type PlanTier } from "@/components/common/plan-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { liveSiteHref } from "@/config/site";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Website } from "../types";
import { LiveSitePreview } from "./live-site-preview";
import { ReactivateButton } from "./reactivate-button";
import { WebsiteCardMenu } from "./website-card-menu";

const HOUR = 3_600_000;

/** "Edited 2 hours ago", "Suspended today", "Reactivated just now". */
function activityText(website: Website): string {
  const now = Date.now();
  if (website.status === "SUSPENDED" && website.suspendedAt) {
    return now - new Date(website.suspendedAt).getTime() < 24 * HOUR
      ? "Suspended today"
      : `Suspended ${formatRelativeTime(website.suspendedAt)}`;
  }
  if (website.reactivatedAt && now - new Date(website.reactivatedAt).getTime() < HOUR) {
    const ago = formatRelativeTime(website.reactivatedAt);
    return `Reactivated ${ago === "a minute ago" ? "just now" : ago}`;
  }
  return `Edited ${formatRelativeTime(website.updatedAt)}`;
}

/**
 * One website: screenshot with status, name, address, last change and the main actions.
 * `filtered` is the status-tab view, which drops the category pill (Figma filter screens).
 * A live website also shows the plan it is online on (one plan covers all of the account's sites).
 */
export function WebsiteCard({
  website,
  plan,
  filtered = false,
  onPatch,
  onRemove,
}: {
  website: Website;
  plan: PlanTier;
  filtered?: boolean;
  /** Called after an action worked, with the fields that changed, so the list updates at once. */
  onPatch: (patch: Partial<Website>) => void;
  onRemove: () => void;
}) {
  const suspended = website.status === "SUSPENDED";
  const hasMenu = website.status === "DRAFT" || (website.domain !== null && (filtered || !suspended));
  // Suspended in "All": Reactivate is the main action. In the Suspended tab it is the neutral one.
  const reactivateFirst = suspended && !filtered;

  return (
    <article className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-background p-3 shadow-card transition-[border-color,box-shadow,translate] duration-200 ease-out hover:border-primary/30 hover:shadow-float motion-safe:hover:-translate-y-0.5">
      <div className="relative h-[200px] overflow-hidden rounded-[14px] bg-primary-soft">
        <div
          className={cn(
            "absolute inset-0 overflow-hidden bg-background shadow-card",
            !suspended && "border border-border",
          )}
        >
          <Image
            src={website.thumbnailUrl}
            alt={`${website.name} preview`}
            fill
            unoptimized
            sizes="(min-width: 1440px) 25vw, 100vw"
            className="object-cover object-top"
          />
          {/* The real page over the template image: the live site while it is online, else the saved draft
              (a suspended site is hidden from visitors, so its public address no longer shows it). */}
          <LiveSitePreview
            src={website.status === "LIVE" ? liveSiteHref(website.id) : `/websites/${website.id}/draft`}
            name={website.name}
          />
        </div>
        <div className="absolute top-3 right-[11px] flex items-center gap-1.5">
          {website.status === "LIVE" && <PlanBadge plan={plan} className="shadow-button" />}
          <StatusBadge status={website.status} />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-1.5 pb-1.5">
        <div className="flex min-h-9 items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[17px] leading-[22.1px] font-semibold tracking-[-0.17px] text-foreground">
              {website.name}
            </h3>
            <p className="flex h-[19.5px] items-center gap-1.5 text-[13px] text-muted-foreground">
              <Global variant="Outline" aria-hidden className="size-3.5 shrink-0" />
              <span className="truncate">{website.status === "DRAFT" ? "Not deployed yet" : (website.domain ?? "Not deployed yet")}</span>
            </p>
          </div>
          {hasMenu && (
            <WebsiteCardMenu
              websiteId={website.id}
              websiteName={website.name}
              status={website.status}
              domain={website.domain}
              onPatch={onPatch}
              onRemove={onRemove}
            />
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs leading-[18px] text-muted-foreground">
              {activityText(website)} · {website.businessType}
            </span>
            {!filtered && <CategoryBadge category={website.category} className="shrink-0 shadow-none" />}
          </div>

          <div className="flex items-center gap-1.5">
            {suspended ? (
              <>
                <ReactivateButton websiteId={website.id} variant={reactivateFirst ? "primary" : "secondary"} onPatch={onPatch} />
                <EditButton websiteId={website.id} primary={!reactivateFirst} disabled />
              </>
            ) : (
              <>
                {website.status === "LIVE" && website.domain ? (
                  <Button asChild variant="secondary" size="sm" className="flex-1">
                    <Link href={liveSiteHref(website.id)} target="_blank" rel="noopener noreferrer">
                      Visit site
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="secondary" size="sm" className="flex-1">
                    <Link href={`/websites/${website.id}/preview?from=websites`}>Preview</Link>
                  </Button>
                )}
                <EditButton websiteId={website.id} primary />
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function EditButton({ websiteId, primary, disabled }: { websiteId: string; primary: boolean; disabled?: boolean }) {
  // A suspended site cannot be edited until it is reactivated.
  if (disabled) {
    return (
      <Button size="sm" variant="secondary" disabled title="Reactivate this website to edit it" className="flex-1">
        <Edit2 variant="Outline" aria-hidden /> Edit
      </Button>
    );
  }
  return (
    <Button
      asChild
      size="sm"
      variant={primary ? "primary" : "secondary"}
      className={cn("flex-1", primary && "bg-primary hover:bg-brand")}
    >
      <Link href={`/websites/${websiteId}/edit`}>
        <Edit2 variant="Outline" aria-hidden /> Edit
      </Link>
    </Button>
  );
}
