"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Flash,
  Lock1,
  Send2,
  ShieldTick,
  TickCircle,
  Wallet,
} from "iconsax-reactjs";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/status-badge";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { useUrlParam } from "@/hooks/use-url-param";
import { cn } from "@/lib/utils";
import { startDeployAction } from "../actions";
import { DOMAIN_SUFFIX, plansHref, SUBDOMAIN_MAX } from "../schemas";
import type { DomainCheck } from "../types";

const PERKS = [
  {
    icon: <ShieldTick variant="Outline" aria-hidden />,
    title: "Free SSL",
    detail: "Secure https:// address, included",
  },
  {
    icon: <Flash variant="Outline" aria-hidden />,
    title: "Live in minutes",
    detail: "Your site goes online right after deploy",
  },
  {
    icon: <Wallet variant="Outline" aria-hidden />,
    title: "No payment",
    detail: "The WebBlock address is free to use",
  },
];

/**
 * First deploy (Figma "13 First Deploy · Choose Domain"): the owner picks the free WebBlock address.
 * The name being typed lives in the URL (`?name=`), so the server can check it and send the answer back.
 */
export function ChooseDomainView({
  websiteId,
  siteName,
  initialName,
  check,
}: {
  websiteId: string;
  siteName: string;
  initialName: string;
  check: DomainCheck;
}) {
  const router = useRouter();
  const { setParam } = useUrlParam();
  const [value, setValue] = useState(initialName);
  const [pending, startTransition] = useTransition();

  const typed = value.trim().toLowerCase();
  // `check` answers for the name in the URL; while the owner keeps typing it is still the old answer.
  const settled = check.name === typed;
  const available = settled && check.available;

  useEffect(() => {
    if (typed === initialName) return;
    const timer = setTimeout(() => setParam("name", typed), 350);
    return () => clearTimeout(timer);
  }, [typed, initialName, setParam]);

  function deploy() {
    startTransition(async () => {
      const result = await startDeployAction(
        websiteId,
        typed,
        crypto.randomUUID(),
      );
      if (!result.ok) {
        toast.error("Couldn’t deploy", result.message);
        return;
      }
      const next = result.data;
      if (next.next === "PLANS") router.push(plansHref(websiteId, next.reason));
      else if (next.next === "PROGRESS")
        router.push(
          `/websites/${websiteId}/deploy?deployment=${next.deploymentId}`,
        );
    });
  }

  return (
    <>
      <PageHeader
        align="center"
        className="mb-0"
        eyebrow="First deploy"
        title="Pick your free web address"
        description={`This is where customers will find ${siteName}. Pick it carefully: it stays the same after this first deploy.`}
      />

      <form
        className="mt-8 flex w-full max-w-[540px] flex-col gap-5 rounded-3xl border border-border bg-background p-7 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          if (available) deploy();
        }}
      >
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">
            Your free WebBlock address
          </h2>
          <p className="pt-0.5 text-[13px] text-muted-foreground">
            Pick a name for your site. It is free, with SSL included.
          </p>
        </div>

        <div>
          <div
            className={cn(
              "flex h-12 items-center gap-1 rounded-xl border bg-muted px-4 focus-within:border-primary",
              settled && !check.available ? "border-danger" : "border-border",
            )}
          >
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              maxLength={SUBDOMAIN_MAX}
              aria-label="Web address"
              aria-invalid={settled && !check.available}
              aria-describedby="domain-status"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
            />
            <span className="text-sm text-muted-foreground">
              {DOMAIN_SUFFIX}
            </span>
            {available && (
              <Pill tone="success" icon={<TickCircle variant="Outline" aria-hidden />} className="ml-2">
                Available
              </Pill>
            )}
          </div>
          <p
            id="domain-status"
            role="status"
            className={cn(
              "min-h-5 pt-1.5 text-xs",
              settled && !check.available
                ? "text-danger"
                : "text-muted-foreground",
            )}
          >
            {!settled ? "Checking…" : (check.problem ?? "")}
          </p>
        </div>

        <hr className="h-px border-0 bg-border" />

        <div className="flex flex-col gap-3.5">
          <p className="text-[13px] font-semibold text-foreground">
            What you get
          </p>
          <ul className="flex flex-col gap-3.5">
            {PERKS.map((perk) => (
              <li key={perk.title} className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-[10px] bg-brand-soft text-brand [&_svg]:size-4">
                  {perk.icon}
                </span>
                <span className="flex flex-col">
                  <span className="text-[13px] leading-[18px] font-semibold text-foreground">
                    {perk.title}
                  </span>
                  <span className="text-xs leading-[18px] text-muted-foreground">
                    {perk.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Button type="submit" size="lg" loading={pending} disabled={!available}>
          {!pending && <Send2 variant="Outline" aria-hidden />} Use free address &amp; deploy
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock1 variant="Outline" aria-hidden className="size-3.5" /> {typed || "yourname"}
          {DOMAIN_SUFFIX}
        </p>
      </form>
    </>
  );
}
