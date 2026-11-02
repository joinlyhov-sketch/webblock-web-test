import Image from "next/image";
import type { ReactNode } from "react";
import { Check, Clock, Crown, Global, Lock1, Refresh2, ShieldTick } from "iconsax-reactjs";
import { formatDayMonthYear, formatDayMonthYearTime, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PaidPlanCode, PaymentOrder } from "../types";
import { RedirectAfterPaid } from "./redirect-after-paid";
import { RegenerateCodeButton } from "./regenerate-code-button";

const PLAN_BADGE: Record<PaidPlanCode, string> = {
  PLUS: "bg-brand-soft text-brand",
  PRO: "bg-tier-pro-soft text-tier-pro",
  ULTRA: "bg-tier-ultra-soft text-tier-ultra",
};

/** Top row of the payment card: plan badge and name on the left, status pill (`aside`) on the right. */
export function PaymentCardHeader({ order, aside }: { order: PaymentOrder; aside: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-background px-5 pt-[22px] pb-[18px] sm:px-8">
      <div className="flex items-center gap-3.5">
        <span
          className={cn(
            "rounded-full px-3 py-[5px] text-lg font-bold tracking-[1.28px] uppercase",
            PLAN_BADGE[order.plan],
          )}
        >
          {order.planName}
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-lg leading-[24px] font-semibold text-foreground">{order.planName} plan · monthly</p>
          <p className="text-[15px] leading-[20px] text-muted-foreground">Billed monthly · cancel anytime</p>
        </div>
      </div>
      {aside}
    </div>
  );
}

type PillTone = "brand" | "warning" | "danger" | "success";

const PILL_TONE: Record<PillTone, string> = {
  brand: "bg-brand-soft text-brand",
  warning: "bg-status-suspended-soft text-status-suspended",
  danger: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
};

/** Clock pill in the card header: "Code expires in 09:42", "Code expired" or "Paid". */
export function StatePill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-2 pr-3.5 pl-3 text-[15px] leading-[20px] font-medium whitespace-nowrap",
        PILL_TONE[tone],
      )}
    >
      <Clock aria-hidden className="size-4" />
      {children}
    </span>
  );
}

/** Thin bar under the header. Pending: time left. Paid: full green. */
export function PaymentProgress({ percent, paid }: { percent: number; paid?: boolean }) {
  return (
    <div className="px-5 sm:px-8">
      <div
        role="progressbar"
        aria-label={paid ? "Payment complete" : "Time left on the code"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        className="h-1 overflow-hidden rounded-full bg-border"
      >
        <div
          className={cn(
            "h-1 rounded-full motion-safe:transition-[width] motion-safe:duration-1000 motion-safe:ease-linear",
            paid ? "bg-success" : "bg-muted",
          )}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}

export type KhqrState = "waiting" | "expiring" | "expired";

/** KHQR panel. It only shows the image the API returned and the state the API reports. */
export function KhqrPanel({ order, state }: { order: PaymentOrder; state: KhqrState }) {
  const expired = state === "expired";
  return (
    <div className="flex w-full shrink-0 flex-col self-stretch rounded-3xl px-4 py-3 motion-safe:animate-fade-up sm:px-8 lg:w-[500px]">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl p-[22px]">
        <div className="flex h-[237.094px] w-[200px] flex-col overflow-hidden rounded-[20px] border border-border bg-background">
          <div className={cn("bg-khqr px-3.5 py-2", expired && "opacity-40")}>
            <p className="text-base leading-[23px] font-bold text-primary-foreground">KHQR</p>
          </div>
          <div className={cn("relative size-[198px] shrink-0", expired && "opacity-18")}>
            <Image src={order.qrImageUrl} alt="KHQR code" fill sizes="198px" className="object-contain" priority />
          </div>
        </div>
        <p className="text-base leading-[23px] font-bold text-foreground">
          {expired ? "This code is no longer valid" : "Scan with your banking app"}
        </p>
        {state === "waiting" && (
          <p className="text-[15px] leading-[21.5px] text-hint-strong">ABA, ACLEDA, Wing or any KHQR app</p>
        )}
        {state === "expiring" && (
          <p className="text-[15px] leading-[21.5px] font-semibold text-status-suspended">Pay now or get a new code</p>
        )}
        {expired ? (
          <>
            <p className="text-[15px] leading-[21.5px] text-hint-strong">
              No payment was taken. Generate a new code to continue.
            </p>
            <RegenerateCodeButton orderId={order.id} />
          </>
        ) : (
          <p className="flex items-center gap-2 text-[14px] leading-[20px] text-muted-foreground">
            <Refresh2 aria-hidden className="size-3.5 motion-safe:animate-spin" /> Waiting for payment…
          </p>
        )}
      </div>
    </div>
  );
}

function Pill({ tone, children }: { tone: "brand" | "success"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-[3px] text-[14px] font-medium",
        tone === "brand" ? "bg-sent-from text-primary" : "bg-success-soft text-success",
      )}
    >
      {children}
    </span>
  );
}

function LineItem({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2.5 text-base leading-[23px] text-foreground">
        <span className="flex size-[30px] items-center justify-center rounded-[9px] border border-border bg-background text-brand [&_svg]:size-[15px]">
          {icon}
        </span>
        {label}
      </span>
      {value}
    </li>
  );
}

/** The last step only promises a deploy when the payment belongs to one (`order.websiteId`). */
const steps = (deploys: boolean) => [
  "Open your banking app",
  "Scan the QR code on the left",
  deploys ? "Confirm — your website deploys automatically" : "Confirm — your plan starts right away",
];

const LINE_COPY: Record<PaymentOrder["kind"], [label: string, pill: string]> = {
  SUBSCRIBE: ["Free trial", "Ended"],
  CHANGE: ["Plan change", "Starts today"],
  RENEW: ["Plan renewal", "Adds 30 days"],
};

/** Right-hand summary: website, line items, total and (until paid) the "How to pay" steps. */
export function PaymentSummary({ order, trialDaysLeft }: { order: PaymentOrder; trialDaysLeft: number | null }) {
  const paid = order.status === "PAID";
  const price = formatPrice(order.amount, "USD");
  const [lineLabel, defaultPill] = LINE_COPY[order.kind];
  // Before paying, the trial line shows the same days the sidebar shows, not a made-up "ends today".
  // Once paid the trial did not run out: the plan replaced it, so say that instead of "Ended".
  const linePill =
    order.kind !== "SUBSCRIBE"
      ? defaultPill
      : paid
        ? "Upgraded"
        : trialDaysLeft
          ? `${trialDaysLeft} ${trialDaysLeft === 1 ? "day" : "days"} left`
          : defaultPill;
  return (
    <div className="flex w-full flex-1 flex-col gap-5 rounded-3xl bg-muted p-5 motion-safe:animate-fade-up sm:p-6">
      <div className="flex items-center gap-3 rounded-[18px] bg-background p-3">
        <div className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded-xl">
          <Image src={order.websiteImageUrl} alt="" fill sizes="72px" className="object-cover" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-base leading-[21.5px] font-bold text-foreground">{order.websiteName}</p>
          <p className="flex items-center gap-[5px] text-[14px] leading-[20px] text-muted-foreground">
            <Global aria-hidden className="size-3" /> {order.websiteDomain}
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-3.5">
        <LineItem
          icon={<Crown aria-hidden />}
          label={`${order.planName} plan · monthly`}
          value={<span className="text-base leading-[23px] font-medium text-foreground">{price} / mo</span>}
        />
        <LineItem
          icon={<Clock aria-hidden />}
          label={lineLabel}
          value={<Pill tone="brand">{linePill}</Pill>}
        />
        <LineItem icon={<ShieldTick aria-hidden />} label="SSL certificate" value={<Pill tone="success">Free</Pill>} />
      </ul>

      <div className="border-t border-dashed border-dashed-line/60" />

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[17px] leading-[23px] font-bold text-foreground">{paid ? "Paid today" : "Due today"}</p>
          <p className="text-[14px] leading-[20px] text-muted-foreground">
            Then {price} every month from {formatDayMonthYear(order.nextPaymentAt)}.
          </p>
        </div>
        <p className="font-heading text-[30px] leading-[35px] font-bold text-foreground">{price}</p>
      </div>

      {!paid && (
        <div className="flex flex-col gap-2.5 rounded-[20px] bg-background px-[18px] py-4">
          <p className="text-[15px] leading-[20px] font-semibold text-foreground">How to pay</p>
          <ol className="flex flex-col gap-2.5">
            {steps(order.websiteId !== null).map((step, index) => (
              <li key={step} className="flex items-center gap-2.5 text-[15px] leading-[20px] text-muted-foreground">
                <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-brand-soft text-[13px] leading-[16px] font-bold text-brand">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/** Left side once the bank confirmed the payment. */
export function PaymentSuccessPanel({ order, next }: { order: PaymentOrder; next: { href: string; label: string } }) {
  const rows: [string, string][] = [
    ["Reference", order.reference],
    ["Plan", `${order.planName} · monthly`],
    ["Next payment", formatDayMonthYear(order.nextPaymentAt)],
  ];
  return (
    <div className="flex w-full shrink-0 flex-col justify-center gap-[18px] self-stretch rounded-3xl px-2 py-4 motion-safe:animate-fade-up sm:px-7 sm:py-6 lg:w-[500px]">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted p-[22px] shadow-card motion-safe:animate-float-soft">
        <div className="flex items-center gap-3.5">
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-success motion-safe:animate-check-pop">
            <span aria-hidden className="absolute inset-0 rounded-full bg-success-soft motion-safe:animate-halo-ripple" />
            <Check aria-hidden className="relative size-[18px]" />
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="text-[24px] leading-[21.5px] font-semibold text-foreground">
              {formatPrice(order.amount, "USD")}
            </p>
            <p className="pt-1 text-[15px] leading-[23px] text-muted-foreground">
              Paid via KHQR · {order.paidAt ? formatDayMonthYearTime(order.paidAt) : ""}
            </p>
          </div>
        </div>
        <hr className="h-px border-0 bg-border" />
        <dl className="flex flex-col gap-2.5 text-[15px]">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="flex items-center gap-2 text-[14px] leading-[20px] text-success">
          <Check aria-hidden className="size-3.5" /> Payment confirmed · {next.label}
        </p>
        <RedirectAfterPaid href={next.href} />
      </div>
      <p className="flex items-center gap-2.5 rounded-[20px] px-3.5 py-3 text-[14px] leading-[20px] text-muted-foreground">
        <Lock1 aria-hidden className="size-[14px] shrink-0" />
        A receipt has been sent to your email. You can also download it any time from Settings › Billing.
      </p>
    </div>
  );
}
