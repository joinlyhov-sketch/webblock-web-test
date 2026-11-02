"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Call,
  CloseCircle,
  Export,
  Layer,
  Location,
  Sms,
  TickCircle,
} from "iconsax-reactjs";
import { createWebsiteFromTemplateAction } from "@/features/websites/actions";
import { FormField } from "@/components/common/form-field";
import { Modal } from "@/components/common/modal";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/common/select-field";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatClock } from "@/lib/format";
import { checkImage, LOGO_RULE } from "@/lib/image-rules";
import { EMAIL_MAX, type FieldErrors } from "@/lib/validation/fields";
import {
  BUSINESS_LIMITS,
  defaultOpeningHours,
  TIME_OPTIONS,
  validateBusinessContact,
  validateBusinessDetails,
  WEEKDAYS,
} from "@/features/websites/schemas";
import { cn } from "@/lib/utils";
import type { OpeningHour } from "@/features/websites/types";
import type { Template } from "../types";

type BusinessInfoModalProps = {
  /** The template being used, or `null` while the modal is closed. */
  template: Template | null;
  businessTypes: string[];
  onClose: () => void;
};

const labelClass = "text-[13px] leading-[19.5px]";
const fieldClass = "h-[46px] rounded-xl px-3.5 text-sm";
const iconFieldClass = "pl-[41px]";
const fieldIconClass = "left-3.5 text-foreground [&_svg]:size-[17px]";

/** "Tell us about your business": two steps, then the new draft opens in the editor. */
export function BusinessInfoModal({ template, businessTypes, onClose }: BusinessInfoModalProps) {
  return (
    <Modal
      open={template !== null}
      onClose={onClose}
      label="Tell us about your business"
      className="max-w-[880px] rounded-[20px] border border-background/70 shadow-wizard backdrop:bg-overlay backdrop:backdrop-blur-[7px]"
    >
      {template && <BusinessInfoForm template={template} businessTypes={businessTypes} onClose={onClose} />}
    </Modal>
  );
}

function BusinessInfoForm({
  template,
  businessTypes,
  onClose,
}: {
  template: Template;
  businessTypes: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const logoInput = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [logo, setLogo] = useState<File | null>(null);
  const [values, setValues] = useState({
    businessName: "",
    businessType: "",
    description: "",
    phone: "",
    email: "",
    address: "",
  });
  const [hours, setHours] = useState<OpeningHour[]>(defaultOpeningHours);

  const logoUrl = useMemo(() => (logo ? URL.createObjectURL(logo) : null), [logo]);
  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  const set = (field: keyof typeof values) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  function updateHour(day: OpeningHour["day"], change: Partial<OpeningHour>) {
    setHours((current) => current.map((h) => (h.day === day ? { ...h, ...change } : h)));
    setErrors((current) => ({ ...current, hours: undefined }));
  }

  function chooseLogo(file: File | undefined) {
    if (!file) return;
    const problem = checkImage(file, LOGO_RULE);
    setErrors((current) => ({ ...current, logo: problem ? [problem] : undefined }));
    setLogo(problem ? null : file);
  }

  function next() {
    const result = validateBusinessDetails(values);
    if (!result.ok) return setErrors(result.fieldErrors);
    setErrors({});
    setStep(2);
  }

  function submit() {
    const contact = validateBusinessContact({ ...values, hours });
    if (!contact.ok) return setErrors(contact.fieldErrors);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value));
    formData.set("hours", JSON.stringify(hours));
    if (logo) formData.set("logo", logo);

    startTransition(async () => {
      const result = await createWebsiteFromTemplateAction(template.id, formData);
      if (result.ok) {
        toast.success(result.message ?? "Website created");
        router.push(`/websites/${result.data.id}/edit`);
        return;
      }
      toast.error("Could not create the website", result.message);
      if (result.fieldErrors) {
        setErrors(result.fieldErrors);
        if (result.fieldErrors.businessName || result.fieldErrors.businessType || result.fieldErrors.description) {
          setStep(1);
        }
      } else if (result.message.includes("business name")) {
        setErrors({ businessName: [result.message] });
        setStep(1);
      }
    });
  }

  const err = (field: string) => errors[field]?.[0];
  const desktop = template.previews.desktop;

  return (
    <div className="flex h-[690px] max-h-[calc(100dvh-2rem)] flex-col md:flex-row">
      <aside className="relative hidden w-[300px] shrink-0 flex-col gap-[18px] overflow-clip bg-linear-to-b from-wizard-from to-wizard-to p-7 md:flex">
        <div aria-hidden className="bg-dots absolute inset-0 opacity-60" />
        <Image
          src="/images/wizard/glow.svg"
          alt=""
          width={440}
          height={400}
          unoptimized
          aria-hidden
          className="pointer-events-none absolute top-[-10px] left-[-70px] max-w-none"
        />
        <Image
          src="/images/wizard/wave-top-left.svg"
          alt=""
          width={91}
          height={82.6}
          unoptimized
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 -scale-x-100"
        />
        <Image
          src="/images/wizard/wave-bottom-right.svg"
          alt=""
          width={133}
          height={147}
          unoptimized
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0"
        />
        <span className="relative inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-full bg-background px-2.5 text-xs leading-[18px] font-semibold text-primary shadow-[0_4px_5px_rgb(60_120_207/0.12)]">
          <Layer variant="Outline" aria-hidden className="size-[13px]" />
          {template.name} template
        </span>
        <div className="relative h-[336px] w-full shrink-0">
          <div className="absolute top-2 left-[-15.58px] flex h-[348.31px] w-[261.25px] items-center justify-center">
            <div className="h-[336px] w-[244px] rotate-3 overflow-clip rounded-2xl border-[6px] border-background bg-background shadow-[0_24px_48px_rgb(60_120_207/0.2),0_6px_14px_rgb(60_120_207/0.1)]">
              <Image
                src={desktop.url}
                sizes="(max-width: 639px) 100vw, 440px"
                alt={`${template.name} template preview`}
                width={desktop.width}
                height={desktop.height}
                unoptimized
                className="block h-auto w-full"
              />
            </div>
          </div>
        </div>
        <div className="relative mt-auto">
          <h3 className="w-[244px] text-lg leading-6 font-semibold tracking-[-0.17px] text-heading">
            We’ll fill your website with these details
          </h3>
          <p className="w-[244px] pt-1.5 text-[13px] leading-[19.5px] text-muted-foreground">
            Your name, hours and contact info appear on the right blocks automatically. You can change everything
            later in the editor.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <div className="flex items-start justify-between px-[15px] pt-[25px]">
          <div>
            <h2 className="text-2xl leading-[26.4px] font-semibold tracking-[-0.33px] text-heading">
              Tell us about your business
            </h2>
            <p className="pt-1 text-[13px] leading-[19.5px] text-muted-foreground">
              Fields marked optional can be skipped.
            </p>
          </div>
          <Button variant="ghost" size="icon-lg" aria-label="Close" className="size-9 [&_svg]:size-[18px]" onClick={onClose}>
            <CloseCircle variant="Outline" />
          </Button>
        </div>

        <ol aria-label="Progress" className="flex items-center gap-3 overflow-clip px-[15px] pt-[18px]">
          <Step number={1} label="Business details" state={step === 1 ? "current" : "done"} />
          <span
            aria-hidden
            className={cn(
              "h-[3px] min-w-px flex-1 rounded-[1px]",
              step === 2
                ? "bg-primary"
                : "bg-linear-to-r from-primary from-50% to-step-line to-[50.1%]",
            )}
          />
          <Step number={2} label="Contact & hours" state={step === 2 ? "current" : "todo"} />
        </ol>

        {step === 1 ? (
          <div className="flex flex-1 flex-col gap-[15px] overflow-y-auto px-[15px] py-6">
            <div className="grid gap-[15px] sm:grid-cols-2">
              <FormField
                id="businessName"
                label="Business name"
                labelClassName={labelClass}
                className="space-y-[7px]"
                error={err("businessName")}
              >
                <Input
                  id="businessName"
                  value={values.businessName}
                  maxLength={BUSINESS_LIMITS.businessName}
                  onChange={(e) => set("businessName")(e.target.value)}
                  placeholder="e.g. Petal & Stem"
                  className={fieldClass}
                  aria-invalid={!!err("businessName")}
                  aria-describedby={err("businessName") ? "businessName-hint" : undefined}
                  autoFocus
                />
              </FormField>
              <FormField
                id="businessType"
                label="Business type"
                labelClassName={labelClass}
                className="space-y-[7px]"
                error={err("businessType")}
              >
                <SelectField
                  id="businessType"
                  value={values.businessType}
                  onValueChange={set("businessType")}
                  placeholder="Choose a type"
                  className={fieldClass}
                  aria-invalid={!!err("businessType")}
                  options={businessTypes.map((type) => ({ value: type, label: type }))}
                />
              </FormField>
            </div>
            <FormField
              id="description"
              label="Business description"
              labelClassName={labelClass}
              error={err("description")}
            >
              <Textarea
                id="description"
                value={values.description}
                maxLength={BUSINESS_LIMITS.description}
                onChange={(e) => set("description")(e.target.value)}
                placeholder="Tell visitors what you do, in a sentence or two."
                className="min-h-24 rounded-[14px] px-3.5 py-3 text-sm leading-[21.7px] shadow-[0_1px_1px_rgb(60_120_207/0.04)]"
                aria-invalid={!!err("description")}
                aria-describedby={err("description") ? "description-hint" : undefined}
              />
            </FormField>
            <div className="flex flex-col gap-2">
              <label htmlFor="logo" className={cn(labelClass, "font-semibold text-ink")}>
                Logo <span className="font-normal text-optional">(optional)</span>
              </label>
              {logo && logoUrl ? (
                <div className="flex items-center gap-3.5 rounded-[14px] border border-border bg-background p-3.5">
                  <span className="relative size-16 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview of the chosen file */}
                    <img src={logoUrl} alt="" className="size-16 rounded-full bg-danger-soft object-cover" />
                    <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border-2 border-background bg-success text-primary-foreground">
                      <TickCircle variant="Outline" aria-hidden className="size-4" />
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] leading-[22.5px] font-medium text-foreground">{logo.name}</p>
                    <p className="text-[13px] leading-[19.5px] text-muted-foreground">
                      {logo.type.replace("image/", "").toUpperCase()} · {Math.max(1, Math.round(logo.size / 1024))} KB
                      {" • "}
                      <span className="font-medium text-success">Uploaded</span>
                    </p>
                    <p className="text-xs leading-[18px] text-muted-foreground">Shown in your website header.</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => logoInput.current?.click()}>
                    Replace
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setLogo(null)}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-[14px] border-[1.2px] border-dashed border-dropzone-border bg-dropzone px-3.5 py-3">
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-[0_3px_4px_rgb(60_120_207/0.12)]"
                  >
                    <Export variant="Outline" className="size-[19px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-[19.5px] font-semibold text-foreground">Upload your logo</p>
                    <p className="text-xs leading-[18px] text-muted-foreground">{LOGO_RULE.label}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => logoInput.current?.click()}>
                    Choose file
                  </Button>
                </div>
              )}
              <input
                ref={logoInput}
                id="logo"
                type="file"
                accept={LOGO_RULE.types.join(",")}
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => {
                  chooseLogo(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              {err("logo") && (
                <p role="alert" className="text-[13px] text-danger">
                  {err("logo")}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-[15px] py-5">
            <div className="grid gap-[15px] sm:grid-cols-2">
              <FormField
                id="phone"
                label="Phone number"
                labelClassName={labelClass}
                className="space-y-[7px]"
                error={err("phone")}
              >
                <Input
                  id="phone"
                  type="tel"
                  icon={<Call variant="Outline" />}
                  iconClassName={fieldIconClass}
                  className={cn(fieldClass, iconFieldClass)}
                  value={values.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  placeholder="012 345 678"
                  aria-invalid={!!err("phone")}
                />
              </FormField>
              <FormField
                id="email"
                label="Email"
                labelClassName={labelClass}
                className="space-y-[7px]"
                error={err("email")}
              >
                <Input
                  id="email"
                  type="email"
                  icon={<Sms variant="Outline" />}
                  iconClassName={fieldIconClass}
                  className={cn(fieldClass, iconFieldClass)}
                  value={values.email}
                  maxLength={EMAIL_MAX}
                  onChange={(e) => set("email")(e.target.value)}
                  placeholder="hello@yourbusiness.com"
                  aria-invalid={!!err("email")}
                />
              </FormField>
            </div>
            <FormField
              id="address"
              label="Address"
              labelClassName={labelClass}
              className="space-y-[7px]"
              error={err("address")}
            >
              <Input
                id="address"
                icon={<Location variant="Outline" />}
                iconClassName={fieldIconClass}
                className={cn(fieldClass, iconFieldClass)}
                value={values.address}
                maxLength={BUSINESS_LIMITS.address}
                onChange={(e) => set("address")(e.target.value)}
                placeholder="18 Garden Lane, Phnom Penh"
                aria-invalid={!!err("address")}
              />
            </FormField>

            <fieldset className="flex flex-col gap-2">
              <legend className={cn(labelClass, "mb-2 font-semibold")}>Opening hours</legend>
              <p className="text-xs leading-[17px] text-muted-foreground">
                Turn on the days you open, then set the opening and closing time.
              </p>
              <div className="flex items-center gap-2 border-b border-border pt-1.5 pb-2 pl-0.5 text-xs font-medium tracking-[0.24px] text-muted-foreground">
                <span>Day</span>
                <span className="min-w-px flex-1" />
                <span className="hidden w-[132px] pl-3 sm:block">Opens</span>
                <span className="hidden w-[132px] pl-3 sm:block">Closes</span>
              </div>
              <ul>
                {WEEKDAYS.map(({ day, label }) => {
                  const hour = hours.find((h) => h.day === day)!;
                  return (
                    <li key={day} className="flex h-14 items-center gap-3 border-b border-border pl-0.5">
                      <span className="w-[92px] text-sm font-medium text-foreground">{label}</span>
                      <Switch
                        checked={hour.open}
                        onCheckedChange={(open) => updateHour(day, { open })}
                        aria-label={`${label} open`}
                      />
                      <span className="min-w-px flex-1" />
                      {hour.open ? (
                        <div className="flex items-center gap-2">
                          <HourSelect
                            label={`${label} opens`}
                            value={hour.opensAt}
                            onChange={(opensAt) => updateHour(day, { opensAt })}
                          />
                          <HourSelect
                            label={`${label} closes`}
                            value={hour.closesAt}
                            onChange={(closesAt) => updateHour(day, { closesAt })}
                          />
                        </div>
                      ) : (
                        <span className="text-[13px] text-muted-foreground">Closed all day</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {err("hours") && (
                <p role="alert" className="text-[13px] text-danger">
                  {err("hours")}
                </p>
              )}
            </fieldset>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 border-t border-border bg-wizard-footer px-7 py-[18px]">
          <p className="min-w-px flex-1 text-xs leading-[18px] text-muted-foreground">
            {step === 1 ? "Step 1 of 2 · Next: contact & hours" : "Step 2 of 2 · Then you’ll go to the editor"}
          </p>
          {step === 1 ? (
            <>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={next}>
                Next <ArrowRight variant="Outline" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(1)} disabled={pending}>
                <ArrowLeft variant="Outline" /> Back
              </Button>
              <Button onClick={submit} loading={pending}>
                Continue to editor <ArrowRight variant="Outline" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({ number, label, state }: { number: number; label: string; state: "done" | "current" | "todo" }) {
  return (
    <li className="flex shrink-0 items-center gap-2" aria-current={state === "current" ? "step" : undefined}>
      <span
        aria-hidden
        className={cn(
          "flex size-[26px] items-center justify-center rounded-[13px] border text-xs font-semibold",
          state === "current" &&
            "border-primary bg-primary text-primary-foreground shadow-[0_4px_10px_rgb(47_107_196/0.35)]",
          state === "done" && "border-dropzone-border bg-brand-soft text-primary",
          state === "todo" && "border-violet-border bg-primary-soft text-primary",
        )}
      >
        {state === "done" ? <TickCircle variant="Outline" className="size-[13px]" /> : number}
      </span>
      <span className={cn("text-[13px] font-semibold", state === "todo" ? "text-muted-foreground" : "text-foreground")}>
        {label}
      </span>
    </li>
  );
}

function HourSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <SelectField
      aria-label={label}
      value={value}
      onValueChange={onChange}
      className="h-[38px] w-[132px] rounded-lg border-transparent bg-picker px-3 text-sm font-medium"
      contentClassName="max-h-64"
      options={TIME_OPTIONS.map((time) => ({ value: time, label: formatClock(time) }))}
    />
  );
}
