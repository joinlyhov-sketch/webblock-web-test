"use client";

import Link from "next/link";
import { Copy, Edit2, ExportSquare, Lock1, TickCircle } from "iconsax-reactjs";
import { Modal } from "@/components/common/modal";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import type { DeploymentKind } from "../types";

/** "Your website is live!" / "Your changes are live!" popup shown when the backend reports the deploy finished. */
export function DeploySuccessDialog({
  open,
  kind,
  siteName,
  domain,
  siteHref,
  editorHref,
  onClose,
}: {
  open: boolean;
  kind: DeploymentKind;
  siteName: string;
  domain: string;
  /** Where "Visit your website" opens, in a new tab. */
  siteHref: string;
  editorHref: string;
  onClose: () => void;
}) {
  const first = kind === "FIRST";
  const title = first ? "Your website is live!" : "Your changes are live!";

  async function copy() {
    try {
      await navigator.clipboard.writeText(domain);
      toast.success("Address copied", domain);
    } catch {
      toast.error("Couldn't copy", "Select the address and copy it by hand.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      label={title}
      className="max-w-[420px] rounded-3xl"
    >
      <div className="flex flex-col items-center gap-3 px-8 pt-9 pb-7 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success shadow-card [&_svg]:size-7">
          <TickCircle aria-hidden />
        </span>
        <h2 className="font-heading text-[26px] leading-8 font-semibold tracking-[-0.5px] text-brand-strong">
          {title}
        </h2>
        <p className="text-sm leading-5 text-muted-foreground">
          {first
            ? `Customers can now visit ${siteName} at`
            : `Customers now see the new version of ${siteName} at`}
        </p>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground">
            <Lock1 aria-hidden className="size-3.5 text-muted-foreground" />{" "}
            {domain}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="shadow-button"
            aria-label="Copy address"
            onClick={copy}
          >
            <Copy aria-hidden />
          </Button>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button asChild>
            <Link href={siteHref} target="_blank" rel="noopener noreferrer">
              <ExportSquare aria-hidden /> Visit your website
            </Link>
          </Button>
          <Button asChild variant="ghost" className="shadow-button">
            <Link href={editorHref}>
              <Edit2 aria-hidden /> Back to editor
            </Link>
          </Button>
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
        >
          <Link href="/websites">Go to dashboard</Link>
        </Button>
      </div>
    </Modal>
  );
}
