"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Clock,
  Edit,
  ExportSquare,
  More,
  PauseCircle,
  PlayCircle,
  Trash,
} from "iconsax-reactjs";
import { deleteWebsiteAction, reactivateWebsiteAction, suspendWebsiteAction } from "../actions";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { toast } from "@/components/common/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VersionHistoryDialog } from "@/features/editor/components/version-history-dialog";
import type { Website, WebsiteStatus } from "../types";

/**
 * "…" menu on a website card.
 * Draft: Open editor, Delete. Live: Portal, Open editor, Version history, Suspend (the card has its own "Visit site" button).
 * Suspended: Open editor (disabled), Portal, Version history, Reactivate (visitors can't see it, so no
 * "View live site").
 */
export function WebsiteCardMenu({
  websiteId,
  websiteName,
  status,
  domain,
  onPatch,
  onRemove,
}: {
  websiteId: string;
  websiteName: string;
  status: WebsiteStatus;
  domain: string | null;
  onPatch: (patch: Partial<Website>) => void;
  onRemove: () => void;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function suspend() {
    startTransition(async () => {
      const result = await suspendWebsiteAction(websiteId);
      setConfirmOpen(false);
      if (result.ok) {
        const now = new Date().toISOString();
        onPatch({ status: "SUSPENDED", suspendedAt: now, reactivatedAt: null, updatedAt: now });
        toast.success(result.message ?? "Website suspended");
      }
      else toast.error("Could not suspend the website", result.message);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteWebsiteAction(websiteId);
      setDeleteOpen(false);
      if (result.ok) {
        onRemove();
        toast.success(result.message ?? "Website deleted", `${websiteName} was deleted.`);
      }
      else toast.error("Could not delete the website", result.message);
    });
  }

  function reactivate() {
    startTransition(async () => {
      const result = await reactivateWebsiteAction(websiteId);
      if (result.ok) {
        const now = new Date().toISOString();
        onPatch({ status: "LIVE", suspendedAt: null, reactivatedAt: now, updatedAt: now });
        toast.success(result.message ?? "Website reactivated");
      }
      else toast.error("Could not reactivate the website", result.message);
    });
  }

  const editor =
    status === "SUSPENDED" ? (
      <DropdownMenuItem disabled>
        <Edit variant="Outline" aria-hidden /> <span className="flex-1">Open editor</span>
      </DropdownMenuItem>
    ) : (
      <DropdownMenuItem asChild>
        <Link href={`/websites/${websiteId}/edit`}>
          <Edit variant="Outline" aria-hidden /> <span className="flex-1">Open editor</span>
        </Link>
      </DropdownMenuItem>
    );
  // The Owner Portal and the live site each open in their own tab, apart from the dashboard.
  const portal = (
    <DropdownMenuItem asChild>
      <Link href={`/portal/${websiteId}`} target="_blank" rel="noopener noreferrer">
        <ExportSquare variant="Outline" aria-hidden /> <span className="flex-1">Portal</span>
      </Link>
    </DropdownMenuItem>
  );
  const history = domain && (
    <DropdownMenuItem onSelect={() => setHistoryOpen(true)}>
      <Clock variant="Outline" aria-hidden /> <span className="flex-1">Version history</span>
    </DropdownMenuItem>
  );

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          aria-label={`More actions for ${websiteName}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-foreground-soft outline-none transition-colors hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40 data-[state=open]:bg-primary-soft"
        >
          <More variant="Outline" aria-hidden className="size-[17px]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[216px]">
          {status === "DRAFT" && (
            <>
              {editor}
              <DropdownMenuSeparator className="mx-1 my-[3px]" />
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                <Trash variant="Outline" aria-hidden /> <span className="flex-1">Delete website</span>
              </DropdownMenuItem>
            </>
          )}
          {status === "LIVE" && (
            <>
              {portal}
              {editor}
              {history}
              <DropdownMenuSeparator className="mx-1 my-[3px]" />
              <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
                <PauseCircle variant="Outline" aria-hidden /> <span className="flex-1">Suspend website</span>
              </DropdownMenuItem>
            </>
          )}
          {status === "SUSPENDED" && (
            <>
              {editor}
              {portal}
              {history}
              <DropdownMenuSeparator className="mx-1 my-[3px]" />
              <DropdownMenuItem disabled={pending} onSelect={reactivate}>
                <PlayCircle variant="Outline" aria-hidden /> <span className="flex-1">Reactivate website</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <VersionHistoryDialog
        websiteId={websiteId}
        websiteName={websiteName}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={suspend}
        loading={pending}
        icon={<PauseCircle variant="Outline" />}
        title="Suspend this website?"
        description="It will be taken offline and visitors won’t be able to see it. Your pages and content are kept, so you can reactivate it any time."
        confirmLabel="Suspend website"
        look="soft"
      />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={remove}
        loading={pending}
        icon={<Trash variant="Outline" />}
        title={`Delete ${websiteName}?`}
        description="This draft and everything in it will be removed for good. This can’t be undone."
        confirmLabel="Delete website"
      />
    </>
  );
}
