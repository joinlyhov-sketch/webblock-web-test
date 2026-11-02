"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/common/modal";
import { PlanBadge } from "@/components/common/plan-badge";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/actions/result";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { updatePlanAction } from "../actions";
import { planInput } from "../schemas";
import type { Plan } from "../types";
import { PLAN_LABEL, PLAN_SURFACE } from "./plan-styles";

type FieldName = keyof typeof planInput.shape;
const FIELDS = Object.keys(planInput.shape) as FieldName[];
const isField = (name: string): name is FieldName => name in planInput.shape;

/** "Edit Pro plan" popup. Opened with `?edit=<planId>`; saving or closing goes back to the plans. */
export function EditPlanDialog({
  plan,
  closeHref,
}: {
  plan: Plan;
  closeHref: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(updatePlanAction.bind(null, plan.id), null);
  const [price, setPrice] = useState(plan.priceMonthly);
  // Same rules as the server, checked as the admin types. A key that is present means
  // "checked in the browser" and replaces the server's error for that field.
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<FieldName, string[] | undefined>>
  >({});

  function checkField(name: FieldName, value: string) {
    const result = planInput.shape[name].safeParse(value);
    setClientErrors((prev) => ({
      ...prev,
      [name]: result.success ? undefined : [result.error.issues[0].message],
    }));
  }

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(`${plan.name} plan saved`, state.message);
      router.push(closeHref, { scroll: false });
    } else if (!state.fieldErrors) {
      toast.error("Couldn't save the plan", state.message);
    }
  }, [state, plan.name, closeHref, router]);

  const serverErrors = state?.ok === false ? state.fieldErrors : undefined;
  const errors = Object.fromEntries(
    FIELDS.map((name) => [
      name,
      name in clientErrors ? clientErrors[name] : serverErrors?.[name],
    ]),
  ) as Partial<Record<FieldName, string[]>>;
  const values = state?.ok === false ? state.values : undefined;
  const diff = Number(price) - Number(plan.priceMonthly);
  const priceChanged =
    price.trim() !== "" && !Number.isNaN(diff) && Math.abs(diff) >= 0.005;

  return (
    <Modal
      title={`Edit ${plan.name} plan`}
      hideTitle
      closeHref={closeHref}
      // Same plan colours as the plan's card (Figma "Edit Pro plan").
      className={cn("max-w-[420px] rounded-3xl", PLAN_SURFACE[plan.code])}
    >
      <div className="px-5 pt-5 pb-5">
        <div className="flex items-center gap-2 pr-12">
          <PlanBadge
            plan={plan.code}
            dot={false}
            className={cn(
              "h-6 px-2.5 text-xs font-semibold tracking-wide uppercase",
              PLAN_LABEL[plan.code],
            )}
          />
          {plan.mostPopular && (
            <span className="inline-flex h-6 items-center rounded-full bg-gold-strong px-2.5 text-xs font-medium text-primary-foreground">
              Most popular
            </span>
          )}
        </div>

        <h2 className="mt-3 text-lg leading-6 font-semibold tracking-[-0.2px] text-foreground">
          Edit {plan.name} plan
        </h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {plan.subscriberCount.toLocaleString("en-US")} subscribers
        </p>

        <form
          action={formAction}
          noValidate
          onBlur={(e) => {
            if (!(e.target instanceof HTMLInputElement)) return;
            const { name, value } = e.target;
            if (isField(name)) checkField(name, value);
          }}
          onChange={(e) => {
            // Re-check while typing only once the field was checked (no errors mid-first-entry).
            if (!(e.target instanceof HTMLInputElement)) return;
            const { name, value } = e.target;
            if (isField(name) && name in clientErrors) checkField(name, value);
          }}
          onSubmit={(e) => {
            const raw = Object.fromEntries(new FormData(e.currentTarget));
            const result = planInput.safeParse(raw);
            if (result.success) {
              setClientErrors({});
              return;
            }
            e.preventDefault();
            const next: Partial<Record<FieldName, string[] | undefined>> = {};
            for (const name of FIELDS) next[name] = undefined;
            for (const issue of result.error.issues) {
              const name = String(issue.path[0]);
              if (isField(name)) next[name] ??= [issue.message];
            }
            setClientErrors(next);
            const first = FIELDS.find((name) => next[name]);
            document.getElementById(`plan-${first}`)?.focus();
          }}
          className="mt-4 space-y-3 border-t border-border pt-4"
        >
          <Field
            label="Price per month"
            name="priceMonthly"
            errors={errors?.priceMonthly}
          >
            {(props) => (
              <div className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-foreground"
                >
                  $
                </span>
                <Input
                  {...props}
                  inputMode="decimal"
                  maxLength={7}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-9 rounded-lg pl-[22px] text-sm"
                />
              </div>
            )}
          </Field>
          {priceChanged && !errors?.priceMonthly && (
            <p className="-mt-2 text-xs text-brand" aria-live="polite">
              Unsaved · was {formatPrice(plan.priceMonthly, "USD")} (
              {diff > 0 ? "+" : "−"}
              {formatPrice(Math.abs(diff).toFixed(2), "USD")})
            </p>
          )}

          <Field
            label="Websites"
            name="websiteLimit"
            errors={errors?.websiteLimit}
          >
            {(props) => (
              <Input
                {...props}
                inputMode="numeric"
                maxLength={6}
                className="h-9 rounded-lg text-sm"
                defaultValue={values?.websiteLimit ?? plan.websiteLimit}
              />
            )}
          </Field>
          <Field
            label="Redeploys a month"
            name="redeploysPerMonth"
            errors={errors?.redeploysPerMonth}
          >
            {(props) => (
              <Input
                {...props}
                inputMode="numeric"
                maxLength={6}
                className="h-9 rounded-lg text-sm"
                defaultValue={
                  values?.redeploysPerMonth ?? plan.redeploysPerMonth
                }
              />
            )}
          </Field>
          <Field
            label="Products"
            name="productLimit"
            errors={errors?.productLimit}
          >
            {(props) => (
              <Input
                {...props}
                inputMode="numeric"
                maxLength={6}
                className="h-9 rounded-lg text-sm"
                defaultValue={values?.productLimit ?? plan.productLimit}
              />
            )}
          </Field>
          <Field
            label="Monitoring"
            name="monitoring"
            errors={errors?.monitoring}
          >
            {(props) => (
              <Input
                {...props}
                maxLength={60}
                className="h-9 rounded-lg text-sm"
                defaultValue={values?.monitoring ?? plan.monitoring}
              />
            )}
          </Field>

          <div className="flex justify-end gap-2 pt-1">
            <Button asChild variant="secondary" size="sm">
              <a
                href={closeHref}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(closeHref, { scroll: false });
                }}
              >
                Cancel
              </a>
            </Button>
            <Button type="submit" size="sm" loading={pending}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

type FieldProps = {
  id: string;
  name: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
};

function Field({
  label,
  name,
  errors,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  children: (props: FieldProps) => ReactNode;
}) {
  const id = `plan-${name}`;
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-[13px] font-semibold text-foreground"
      >
        {label}
      </label>
      {children({
        id,
        name,
        "aria-invalid": Boolean(errors?.length),
        "aria-describedby": errors?.length ? errorId : undefined,
      })}
      {errors?.length ? (
        <p id={errorId} className="text-[13px] text-danger">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
