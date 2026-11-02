"use client";

import { useEffect, useState, useTransition } from "react";
import { Add, Clock, TickCircle } from "iconsax-reactjs";
import { listVersionsAction, restoreVersionAction } from "../actions";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Modal } from "@/components/common/modal";
import { toast } from "@/components/common/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import type { PageVersion } from "../types";

/**
 * Deployed versions of one website. "Restore this version" puts an old one back live; the saved
 * draft is untouched by normal editing, so the live site only changes on Publish or Restore.
 */
export function VersionHistoryDialog({
  websiteId,
  websiteName,
  open,
  onClose,
}: {
  websiteId: string;
  websiteName: string;
  open: boolean;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<PageVersion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<PageVersion | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listVersionsAction(websiteId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setVersions(result.data);
        setError(null);
      } else {
        setError(result.message ?? "Could not load the versions.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, websiteId]);

  function restore() {
    if (!target) return;
    startTransition(async () => {
      const result = await restoreVersionAction(websiteId, target.id);
      setTarget(null);
      if (result.ok) {
        setVersions(result.data);
        toast.success(result.message ?? "Version restored");
      } else {
        toast.error("Could not restore the version", result.message);
      }
    });
  }

  return (
    <>
      <Modal open={open} onClose={onClose} label="Version history" className="max-w-[460px] rounded-[18px] border border-border shadow-dialog">
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
          <div className="min-w-0">
            <h2 className="font-heading text-base font-semibold">Version history</h2>
            <p className="truncate text-[13px] text-muted-foreground">
              Every time {websiteName} was deployed. Saving a draft never changes the live site.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <Add variant="Outline" aria-hidden className="size-5 rotate-45" />
          </button>
        </div>

        <ul className="flex max-h-[360px] flex-col gap-2 overflow-y-auto px-6 pb-6" aria-busy={versions === null && !error}>
          {versions === null && !error && [0, 1, 2].map((i) => (
            <li key={i}><Skeleton className="h-[60px] rounded-xl" /></li>
          ))}
          {error && <li role="alert" className="py-6 text-center text-[13px] text-danger">{error}</li>}
          {versions?.length === 0 && (
            <li className="py-8 text-center text-[13px] text-muted-foreground">No deployed versions yet. Deploy your website to create the first one.</li>
          )}
          {versions?.map((version) => (
            <li key={version.id} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
              <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-brand">
                {version.current ? <TickCircle variant="Outline" className="size-[18px]" /> : <Clock variant="Outline" className="size-[18px]" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{formatDateTime(version.publishedAt)}</p>
                <p className="text-xs text-muted-foreground">
                  {version.current ? "Live now" : `Deployed ${formatRelativeTime(version.publishedAt)}`}
                </p>
              </div>
              {!version.current && (
                <Button size="sm" variant="secondary" onClick={() => setTarget(version)} disabled={pending}>
                  Restore this version
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Modal>

      <ConfirmDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={restore}
        loading={pending}
        tone="primary"
        icon={<Clock variant="Outline" />}
        title="Restore this version?"
        description={
          target
            ? `The live site goes back to the version from ${formatDateTime(target.publishedAt)}. Your current draft is replaced by it.`
            : ""
        }
        confirmLabel="Restore version"
      />
    </>
  );
}
