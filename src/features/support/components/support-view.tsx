import { ArrowRight2, Headphone, Lamp, Sms } from "iconsax-reactjs";
import { Accordion } from "@/components/common/accordion";
import { PageHeader } from "@/components/common/page-header";
import { siteConfig } from "@/config/site";
import type { SupportView as SupportData } from "../service";
import { EnvelopeArt } from "./envelope-art";
import { SupportForm } from "./support-form";

/** "Contact Support": hero and email form on the left, FAQ and "Still need help?" on the right. */
export function SupportView({ data }: { data: SupportData }) {
  return (
    <>
      <div className="grid items-start gap-x-14 gap-y-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-5">
          <section className="bg-dots relative flex min-h-[196px] items-center gap-2 overflow-clip rounded-[20px] border border-border bg-linear-[157deg] from-hero-from from-0% to-hero-to to-[76.923%] py-[18px] pr-10 pl-9 shadow-support">
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-r from-hero-fade from-0% via-hero-fade/90 via-45% to-hero-fade/0 to-70%"
            />
            <PageHeader
              size="hero"
              tone="heading"
              className="relative mb-0 min-w-0 flex-1"
              eyebrow="Contact support"
              title={
                <>
                  How can we <span className="text-primary">help?</span>
                </>
              }
              description="Write to the WebBlock team. A real person usually replies within one working day."
            />
            <EnvelopeArt className="relative hidden h-[187.5px] w-[380px] shrink-0 lg:block" />
          </section>

          <SupportForm view={data} />
        </div>

        <aside className="flex flex-col gap-5">
          <section className="rounded-[20px] border border-border bg-background p-5 shadow-panel-sm">
            <h2 className="flex h-[23px] items-center gap-2.5 text-lg leading-[22.1px] font-semibold tracking-[-0.17px] text-foreground">
              <Lamp aria-hidden className="size-[22px] text-primary" /> Quick answers
            </h2>
            <Accordion items={data.faq} defaultOpenId={data.faq[0]?.id} />
          </section>

          <section className="flex flex-col gap-4 overflow-clip rounded-[20px] border border-border bg-linear-[134deg] from-help-from from-0% to-help-to to-[76.923%] p-5">
            <div className="flex items-start gap-3.5">
              <span className="flex shrink-0 rounded-full bg-help-icon p-3 text-primary">
                <Headphone aria-hidden className="size-[26px]" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2 className="text-lg font-semibold text-foreground">Still need help?</h2>
                <p className="text-[13px] leading-normal text-muted-foreground">
                  Our support team is available Monday – Saturday, 8:00 – 20:00.
                </p>
              </div>
            </div>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="flex items-center gap-3 overflow-clip rounded-xl border border-border bg-background p-3.5 outline-none transition-colors hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <Sms aria-hidden className="size-[18px] shrink-0 text-primary" />
              <span className="min-w-0 flex-1 font-heading text-sm font-semibold text-primary">
                {siteConfig.supportEmail}
              </span>
              <ArrowRight2 aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            </a>
          </section>
        </aside>
      </div>
    </>
  );
}
