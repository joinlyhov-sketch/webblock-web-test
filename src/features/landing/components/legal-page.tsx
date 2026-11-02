import Link from "next/link";
import { ArrowRight } from "iconsax-reactjs";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/format";
import type { LegalDocument } from "../legal";
import { LegalToc } from "./legal-toc";

const linkClass = "text-brand-strong underline underline-offset-2 hover:text-brand-dark";

/**
 * /privacy and /terms: title, date and summary, then the numbered sections with an "On this page"
 * list that stays in view from lg up. The fixed landing header floats over the top padding.
 */
export function LegalPage({ doc }: { doc: LegalDocument }) {
  const sections = [...doc.sections, { id: "contact", heading: "Contact us" }];

  return (
    <div className="mx-auto max-w-[1080px] px-4 pt-32 pb-20 sm:px-6 sm:pt-40 lg:pb-28">
      <header className="flex max-w-[720px] flex-col gap-4 border-b border-border pb-10">
        <p className="text-sm leading-5 font-semibold tracking-[0.08em] text-brand-strong uppercase">Legal</p>
        <h1 className="text-[clamp(2.25rem,1.6rem+2.4vw,3.25rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-primary">
          {doc.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated <time dateTime={doc.updatedAt}>{formatDate(doc.updatedAt)}</time>
        </p>
        <p className="text-base leading-7 text-foreground-soft sm:text-lg">{doc.summary}</p>
      </header>

      <div className="mt-10 lg:grid lg:grid-cols-[200px_minmax(0,720px)] lg:gap-16">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-32 flex flex-col gap-3">
            <p className="px-3 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">On this page</p>
            <LegalToc sections={sections.map(({ id, heading }) => ({ id, heading }))} />
          </div>
        </nav>

        <article className="flex flex-col gap-10">
          {doc.sections.map((section, i) => (
            <section key={section.id} aria-labelledby={section.id} className="flex flex-col gap-3">
              <h2 id={section.id} className="text-xl font-semibold text-foreground sm:text-2xl">
                <span className="mr-2 text-brand-strong">{i + 1}.</span>
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-base leading-7 text-foreground-soft">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="flex list-disc flex-col gap-2 pl-5 text-base leading-7 text-foreground-soft marker:text-brand">
                  {section.items.map((item) => (
                    <li key={item.text}>
                      {item.label && <span className="font-semibold text-foreground">{item.label}: </span>}
                      {item.text}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section aria-labelledby="contact" className="flex flex-col gap-3 rounded-[20px] border border-border bg-muted p-6">
            <h2 id="contact" className="text-xl font-semibold text-foreground sm:text-2xl">
              Contact us
            </h2>
            <p className="text-base leading-7 text-foreground-soft">
              Questions about this page? Email us at{" "}
              <a href={`mailto:${siteConfig.supportEmail}`} className={linkClass}>
                {siteConfig.supportEmail}
              </a>
              . WebBlock, Phnom Penh, Cambodia.
            </p>
          </section>

          <Link
            href={doc.related.href}
            className="inline-flex items-center gap-1.5 self-start text-base font-medium text-brand-strong hover:text-brand-dark"
          >
            Read our {doc.related.label.toLowerCase()} <ArrowRight variant="Outline" aria-hidden className="size-4" />
          </Link>
        </article>
      </div>
    </div>
  );
}
