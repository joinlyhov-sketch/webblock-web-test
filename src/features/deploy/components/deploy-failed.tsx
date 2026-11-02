"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Danger, Refresh2, Sms } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { startDeployAction } from "../actions";
import { plansHref } from "../schemas";
import type { DeployStepKey, Deployment } from "../types";

/** What went wrong at each stage, in words an owner understands. The backend only reports which step failed. */
const FAILURE: Record<DeployStepKey, string> = {
  BUILD: "We couldn’t build your website from your design.",
  PRODUCTS: "We couldn’t set up your products and prices.",
  PACKAGE: "We couldn’t package your website to run on our servers.",
  LAUNCH: "We couldn’t start your website on our servers.",
  SSL: "We couldn’t add the secure padlock (SSL) to your address.",
  LIVE: "We couldn’t open your website to customers.",
};

/**
 * The failed state of a deploy: which stage stopped, what it means for the live site, and what to do next.
 * "Try again" asks the backend for a new deploy of the saved draft (a fresh idempotency key, so it is a new
 * attempt); the backend owns the pipeline and its own retries. Nothing here decides why it failed.
 */
export function DeployFailed({ deployment, editorHref }: { deployment: Deployment; editorHref: string }) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = deployment.kind === "FIRST";
  const failedStep = deployment.steps.find((s) => s.status === "FAILED");
  const reference = deployment.id.slice(0, 8).toUpperCase();

  async function retry() {
    setRetrying(true);
    setError(null);
    // A first deploy keeps the address the owner chose; a redeploy has none to send.
    const subdomain = first ? (deployment.domain.split(".")[0] ?? null) : null;
    const result = await startDeployAction(deployment.websiteId, subdomain, crypto.randomUUID());
    if (!result.ok) {
      setRetrying(false);
      return setError(result.message);
    }
    const next = result.data;
    if (next.next === "PLANS") router.replace(plansHref(deployment.websiteId, next.reason));
    else if (next.next === "CHOOSE_DOMAIN") router.replace(`/websites/${deployment.websiteId}/deploy`);
    else router.replace(`/websites/${deployment.websiteId}/deploy?deployment=${next.deploymentId}`);
  }

  return (
    <section
      role="alert"
      aria-label="Deploy failed"
      className="mt-4 flex w-full max-w-[560px] flex-col gap-4 rounded-2xl border border-border bg-background p-5 text-left shadow-card"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger [&_svg]:size-4">
          <Danger variant="Outline" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-[15px] leading-[20px] font-semibold text-foreground">Something went wrong while deploying</p>
          <p className="text-[14px] leading-[20px] text-muted-foreground">
            {failedStep ? FAILURE[failedStep.key] : "The deploy stopped before it finished."}{" "}
            {first ? "Nothing went live yet." : "Your current website is still online."} Your design and products are saved.
          </p>
          <p className="pt-1 text-[12px] leading-[18px] text-muted-foreground">
            Error reference <span className="font-mono font-medium text-foreground-soft">{reference}</span> · quote it if you contact us.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-[13px] leading-[18px] text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <Button onClick={retry} loading={retrying}>
          <Refresh2 variant="Outline" aria-hidden /> Try again
        </Button>
        <Button asChild variant="secondary">
          <Link href={editorHref}>
            <ArrowLeft variant="Outline" aria-hidden /> Back to editor
          </Link>
        </Button>
        <Button asChild variant="soft">
          <Link href="/support">
            <Sms variant="Outline" aria-hidden /> Contact admin
          </Link>
        </Button>
      </div>
    </section>
  );
}
