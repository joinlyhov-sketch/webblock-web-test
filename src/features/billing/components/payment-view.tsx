import { PaymentSummary, PaymentCardHeader, PaymentProgress, KhqrPanel, PaymentSuccessPanel, StatePill } from "./payment-parts";
import { Lock1 } from "iconsax-reactjs";
import { BillingBackdrop, BillingContent, BillingScreen, BillingTitle, BillingTopBar } from "./billing-shell";
import { PendingPayment } from "./pending-payment";
import type { PaymentView as PaymentData } from "../service";

/** Payment screen: waiting for payment, paid, or code expired. The API decides which. */
export function PaymentView({ view }: { view: PaymentData }) {
  const { order } = view;
  return (
    <BillingScreen>
      <BillingTopBar backHref={view.backHref} backLabel={view.backLabel} />
      <BillingBackdrop variant="payment" />
      <BillingContent>
        <BillingTitle eyebrow="Secure payment" icon={<Lock1 variant="Outline" aria-hidden />} title="Payment" subtitle={view.subtitle} />
        <div className="mt-2 w-[960px] max-w-full overflow-hidden rounded-[24px] border border-border bg-background shadow-payment-card motion-safe:animate-fade-up sm:mt-3 sm:rounded-[32px]">
          {order.status === "PENDING" ? (
            <PendingPayment order={order} remainingMs={view.remainingMs} totalMs={view.totalMs}>
              <PaymentSummary order={order} trialDaysLeft={view.trialDaysLeft} />
            </PendingPayment>
          ) : order.status === "PAID" ? (
            <>
              <PaymentCardHeader order={order} aside={<StatePill tone="success">Paid</StatePill>} />
              <PaymentProgress percent={100} paid />
              <div className="flex flex-col items-stretch gap-4 bg-background p-4 sm:p-5 lg:flex-row lg:items-start lg:gap-5">
                <PaymentSuccessPanel order={order} next={view.next} />
                <PaymentSummary order={order} trialDaysLeft={view.trialDaysLeft} />
              </div>
            </>
          ) : (
            <>
              <PaymentCardHeader order={order} aside={<StatePill tone="danger">Code expired</StatePill>} />
              <PaymentProgress percent={0} />
              <div className="flex flex-col items-stretch gap-4 bg-background p-4 sm:p-5 lg:flex-row lg:items-start lg:gap-5">
                <KhqrPanel order={order} state="expired" />
                <PaymentSummary order={order} trialDaysLeft={view.trialDaysLeft} />
              </div>
            </>
          )}
        </div>
        <p className="flex items-center justify-center gap-1.5 px-4 pt-5 text-center text-[15px] leading-[21.5px] text-muted-foreground">
          <Lock1 variant="Outline" aria-hidden className="size-3.5" /> Payments are confirmed by your bank. We never see your banking details.
        </p>
      </BillingContent>
    </BillingScreen>
  );
}
