"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Danger, Notification, Sms } from "iconsax-reactjs";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { liveSiteHref } from "@/config/site";
import { cn } from "@/lib/utils";
import type { Deployment } from "../types";
import { DeploySteps } from "./deploy-steps";
import { DeploySuccessDialog } from "./deploy-success-dialog";

const POLL_MS = 2000;
const RING = { size: 120, stroke: 8, radius: 52 };
const CIRCUMFERENCE = 2 * Math.PI * RING.radius;

function timeLeft(seconds: number | null): string {
  if (seconds === null || seconds < 60) return "less than a minute left";
  const minutes = Math.ceil(seconds / 60);
  return `about ${minutes} ${minutes === 1 ? "minute" : "minutes"} left`;
}

function Ring({ percent, failed }: { percent: number; failed: boolean }) {
  return (
    <div
      role="progressbar"
      aria-label="Deploy progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="relative flex size-[120px] items-center justify-center rounded-full bg-background shadow-card"
    >
      <svg
        width={RING.size}
        height={RING.size}
        viewBox={`0 0 ${RING.size} ${RING.size}`}
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={60}
          cy={60}
          r={RING.radius}
          fill="none"
          strokeWidth={RING.stroke}
          className="stroke-brand-soft"
        />
        <circle
          cx={60}
          cy={60}
          r={RING.radius}
          fill="none"
          strokeWidth={RING.stroke}
          strokeLinecap="round"
          strokeDasharray={`${(CIRCUMFERENCE * percent) / 100} ${CIRCUMFERENCE}`}
          className={cn(
            "transition-[stroke-dasharray] duration-700",
            failed ? "stroke-danger" : "stroke-primary",
          )}
        />
      </svg>
      <span
        className={cn(
          "font-heading text-[30px] font-semibold",
          failed ? "text-danger" : "text-brand-strong",
        )}
      >
        {percent}%
      </span>
    </div>
  );
}

/**
 * Deploy progress (Figma "15 Deploying", "15b Deploying changes", "15 Deploy failed"). The backend owns the
 * pipeline: this page re-reads it every couple of seconds and shows whatever it reports, then the
 * "live" popup or the failed state. Nothing here decides that a step finished.
 */
export function DeployProgress({
  deployment,
  siteName,
  editorHref,
}: {
  deployment: Deployment;
  siteName: string;
  editorHref: string;
}) {
  const router = useRouter();
  const running = deployment.status === "RUNNING";
  const failed = deployment.status === "FAILED";
  const first = deployment.kind === "FIRST";

  useEffect(() => {
    if (!running) return;
    const poll = setInterval(() => router.refresh(), POLL_MS);
    return () => clearInterval(poll);
  }, [running, router]);

  const failedAt = deployment.steps.findIndex((s) => s.status === "FAILED");
  const title = failed
    ? first
      ? `${siteName} isn’t online yet`
      : "Your changes weren’t deployed"
    : first
      ? `Putting ${siteName} online`
      : "Deploying your changes";
  const subtitle = failed
    ? first
      ? "Nothing went live. Go back to the editor to deploy again once this is fixed."
      : "Your current website stays online, so visitors won’t notice anything."
    : first
      ? "You can close this page. We’ll email you when your website is live."
      : "Your current website stays online until the new version is ready.";

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center motion-safe:animate-fade-up">
        <Ring percent={deployment.percent} failed={failed} />
        <PageHeader
          align="center"
          tone={failed ? "danger" : "primary"}
          className="mb-0"
          eyebrow={
            <Pill tone={failed ? "danger" : "brand"}>
              {failed
                ? `Deploy failed · stopped at step ${failedAt + 1} of ${deployment.steps.length}`
                : running
                  ? `Deploying · ${timeLeft(deployment.secondsLeft)}`
                  : "Deployed"}
            </Pill>
          }
          title={title}
          description={subtitle}
        />
      </div>

      <div className="mt-6 flex w-full justify-center">
        <DeploySteps deployment={deployment} />
      </div>

      {(running || failed) && (
        <div className="mt-4 flex max-w-[520px] items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 shadow-card">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full [&_svg]:size-4",
              failed
                ? "bg-danger-soft text-danger"
                : "bg-brand-soft text-brand",
            )}
          >
            {failed ? <Danger aria-hidden /> : <Notification aria-hidden />}
          </span>
          <div className="flex flex-col text-left">
            <p className="text-[15px] leading-[20px] font-semibold text-foreground">
              {failed
                ? "Something went wrong while deploying"
                : "You can safely leave this page"}
            </p>
            <p className="text-[14px] leading-[20px] text-muted-foreground">
              {failed
                ? "Send this error to the admin and we’ll email you when it’s fixed."
                : first
                  ? "We’ll keep building in the background and notify you when your website is live."
                  : "We’ll keep deploying in the background and notify you when your changes are live."}
            </p>
          </div>
          {failed && (
            <Button asChild variant="soft" size="sm" className="shrink-0">
              <Link href="/support">
                <Sms aria-hidden /> Contact admin
              </Link>
            </Button>
          )}
        </div>
      )}

      <DeploySuccessDialog
        open={deployment.status === "SUCCEEDED"}
        kind={deployment.kind}
        siteName={siteName}
        domain={deployment.domain}
        siteHref={liveSiteHref(deployment.websiteId)}
        editorHref={editorHref}
        onClose={() => router.push(editorHref)}
      />
    </>
  );
}
