"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Danger } from "iconsax-reactjs";
import { LogoMark } from "@/components/common/logo";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { startDeployAction } from "../actions";
import { plansHref } from "../schemas";

/**
 * Right after the owner paid for this deploy: asks the backend to start it and moves on to the progress
 * screen (or wherever the backend answers). `idempotencyKey` is the payment id, so a reload or a second
 * mount sends the same request and gets the same deployment back.
 */
export function StartDeploy({
  websiteId,
  idempotencyKey,
  editorHref,
}: {
  websiteId: string;
  idempotencyKey: string;
  editorHref: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    startDeployAction(websiteId, null, idempotencyKey).then((result) => {
      if (!active) return;
      if (!result.ok) return setError(result.message);
      const next = result.data;
      if (next.next === "PLANS") router.replace(plansHref(websiteId, next.reason));
      else if (next.next === "CHOOSE_DOMAIN") router.replace(`/websites/${websiteId}/deploy`);
      else router.replace(`/websites/${websiteId}/deploy?deployment=${next.deploymentId}`);
    });
    return () => {
      active = false;
    };
  }, [websiteId, idempotencyKey, attempt, router]);

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger [&_svg]:size-6">
          <Danger aria-hidden />
        </span>
        <PageHeader align="center" tone="danger" className="mb-0" title="Couldn’t start the deploy" description={error} />
        <div className="flex gap-2.5 pt-2">
          <Button
            onClick={() => {
              setError(null);
              setAttempt((n) => n + 1);
            }}
          >
            Try again
          </Button>
          <Button asChild variant="secondary">
            <Link href={editorHref}>Back to editor</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div role="status" className="flex flex-col items-center gap-4 text-center motion-safe:animate-fade-up">
      <span aria-hidden className="relative flex size-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-brand-soft motion-safe:animate-halo-ripple" />
        <span
          className="absolute inset-0 rounded-full bg-brand-soft motion-safe:animate-halo-ripple"
          style={{ animationDelay: "1.2s" }}
        />
        <span className="relative flex size-16 items-center justify-center rounded-full border border-border bg-background shadow-card motion-safe:animate-float-soft">
          <LogoMark className="h-8" />
        </span>
      </span>
      <PageHeader
        align="center"
        className="mb-0"
        title="Starting your deploy…"
        description="Payment confirmed. Your website is being generated and deployed."
      />
    </div>
  );
}
