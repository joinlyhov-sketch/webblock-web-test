import { Space_Grotesk, Space_Mono } from "next/font/google";
import { formatPrice } from "@/lib/format";
import type { CleanMonoContent } from "../types/clean-mono";
import { CleanMonoCatalog } from "./clean-mono-catalog";
import { CleanMonoContactForm } from "./clean-mono-contact-form";
import { CleanMonoHeader } from "./clean-mono-header";
import { telHref } from "@/lib/tel";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-cm-display", display: "swap" });
const mono = Space_Mono({ subsets: ["latin"], weight: "400", variable: "--font-cm-mono", display: "swap" });

const css = `
html{scroll-behavior:smooth}
.cm{--cm-ink:#111;--cm-muted:#6f6f6f;--cm-nav:#6b7280;--cm-soft:#f3f3f3;--cm-line:#e5e7eb;--cm-accent:#e53935;--cm-open-bg:#ebf7f0;--cm-open:#147345;--cm-map:#e8f0e5;
 background:#fff;color:var(--cm-ink);font-family:var(--font-dm-sans),system-ui,sans-serif;min-height:100vh}
.cm section[id],.cm footer[id]{scroll-margin-top:84px}
.cm-display{font-family:var(--font-cm-display),var(--font-dm-sans),sans-serif}
.cm-mono{font-family:var(--font-cm-mono),ui-monospace,monospace}
.cm-link{transition:color .15s}.cm-link:hover{color:var(--cm-ink)}
.cm-zoom{transition:transform .5s ease}.cm-card:hover .cm-zoom,.cm-zoom-host:hover .cm-zoom{transform:scale(1.05)}
.cm a:focus-visible,.cm button:focus-visible,.cm input:focus-visible,.cm textarea:focus-visible{outline:2px solid var(--cm-accent);outline-offset:2px}
.cm-ul{text-decoration:underline;text-underline-offset:3px;transition:opacity .15s}.cm-ul:hover{opacity:.65}
.cm-row{transition:background .15s,padding .15s}.cm-row:hover{background:var(--cm-soft)}
`;

function mapsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}


function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="cm-mono text-[12px] tracking-[0.06em] text-(--cm-muted)">{children}</p>;
}

export function CleanMonoSite({ content }: { content: CleanMonoContent }) {
  const { business, hero, popular, catalog, about, visit } = content;
  const directions = mapsUrl(business.address);
  const popularProducts = popular.productIds
    .map((id) => content.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const pad = "mx-auto w-full max-w-[1536px] px-5 sm:px-10 lg:px-24";

  return (
    <div id="top" className={`cm ${display.variable} ${mono.variable}`}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <CleanMonoHeader
        name={business.name}
        openNowLabel={content.openNowLabel}
        contactHref="#visit"
        links={[
          { label: "Home", href: "#top" },
          { label: "Shop", href: "#products" },
          { label: "Visit us", href: "#visit" },
        ]}
      />

      <main>
        {/* Hero */}
        <section className={pad}>
          <div className="flex flex-col gap-10 py-10 sm:py-14 lg:flex-row lg:items-center lg:gap-16 lg:py-[72px]">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-6 lg:gap-7">
              <div className="flex items-center gap-3">
                <span className="size-2 shrink-0 rounded-full bg-(--cm-accent)" aria-hidden />
                <p className="cm-mono text-[11px] tracking-[0.06em] text-(--cm-muted) sm:text-[12px]">{hero.eyebrow}</p>
              </div>
              <h1 className="cm-display text-[56px] leading-[0.92] font-bold tracking-[-0.04em] text-(--cm-ink) sm:text-[88px] xl:text-[112px]">
                {hero.titleLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>
              <p className="max-w-[520px] text-[16px] leading-[1.55] text-(--cm-muted) sm:text-[18px]">{hero.text}</p>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
                <a
                  href="#products"
                  className="inline-flex items-center justify-center bg-(--cm-ink) px-7 py-4 text-[16px] font-semibold text-white transition-opacity hover:opacity-85"
                >
                  {hero.primaryCta}
                </a>
                <a href="#visit" className="cm-ul text-[16px] font-medium text-(--cm-ink)">
                  {hero.secondaryCta}
                </a>
              </div>
              <ul className="cm-mono flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-[12px] tracking-[0.06em] text-(--cm-muted)">
                {hero.specs.map((s, i) => (
                  <li key={s} className="flex items-center gap-6">
                    {i > 0 && <span className="h-4 w-px bg-(--cm-line)" aria-hidden />}
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="cm-zoom-host relative aspect-square w-full shrink-0 overflow-hidden bg-(--cm-soft) lg:w-[min(640px,46vw)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.imageUrl} alt={hero.imageAlt} className="cm-zoom absolute inset-0 size-full object-cover" />
              <p className="cm-mono absolute top-6 left-6 text-[12px] tracking-[0.06em] text-(--cm-muted)">{hero.counter}</p>
              <p className="cm-mono absolute right-6 bottom-6 bg-(--cm-ink) px-3.5 py-2.5 text-[14px] text-white">
                {formatPrice(hero.price, hero.currency)}
              </p>
            </div>
          </div>
          <div className="h-px bg-(--cm-line)" />
        </section>

        {/* Popular */}
        <section className={`${pad} flex flex-col gap-10 py-14 lg:py-[88px]`}>
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-3.5">
              <Eyebrow>{popular.eyebrow}</Eyebrow>
              <h2 className="cm-display text-[34px] leading-[1.05] font-bold tracking-[-0.02em] text-(--cm-ink) sm:text-[44px] lg:text-[56px]">
                {popular.title}
              </h2>
            </div>
            <p className="cm-mono pb-3 text-[12px] tracking-[0.06em] whitespace-nowrap text-(--cm-muted)">
              {popularProducts.length} ITEMS
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-8 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {popularProducts.map((p, i) => (
              <li key={p.id} className="cm-card flex flex-col gap-4">
                <p className="cm-mono text-[12px] tracking-[0.06em] text-(--cm-muted)">{String(i + 1).padStart(2, "0")}</p>
                <div className="aspect-[4/3] overflow-hidden bg-(--cm-soft) lg:aspect-auto lg:h-[440px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt={p.name} className="cm-zoom size-full object-cover" />
                </div>
                <div className="h-px bg-(--cm-ink)" />
                <div className="flex items-baseline justify-between gap-3 text-(--cm-ink)">
                  <h3 className="cm-display text-[20px] font-medium lg:text-[22px]">{p.name}</h3>
                  <span className="cm-mono text-[15px] whitespace-nowrap">{formatPrice(p.price, p.currency)}</span>
                </div>
                {p.note && <p className="text-[14px] text-(--cm-muted)">{p.note}</p>}
              </li>
            ))}
          </ul>

          <a href="#products" className="cm-row group flex flex-col text-(--cm-ink)">
            <span className="h-px bg-(--cm-ink)" />
            <span className="cm-display flex items-center justify-between px-2 py-[22px] text-[18px] font-medium lg:text-[20px]">
              {popular.viewAllLabel}
              <span className="text-[24px] transition-transform group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </span>
            <span className="h-px bg-(--cm-ink)" />
          </a>
        </section>

        {/* All products */}
        <CleanMonoCatalog
          eyebrow={catalog.eyebrow}
          title={catalog.title}
          totalCount={catalog.totalCount}
          categories={catalog.categories}
          searchPlaceholder={catalog.searchPlaceholder}
          products={content.products}
        />

        {/* About */}
        <section id="about" className={`${pad} flex flex-col gap-10 pt-14 pb-16 lg:gap-12 lg:pt-[72px] lg:pb-24`}>
          <div className="h-px bg-(--cm-line)" />
          <Eyebrow>{about.eyebrow}</Eyebrow>
          <p className="cm-display max-w-[1180px] text-[28px] leading-[1.18] font-medium tracking-[-0.02em] text-(--cm-ink) sm:text-[40px] lg:text-[52px]">
            {about.statement}
          </p>
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {about.stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-3 border-t border-(--cm-ink) pt-5">
                <dt className="cm-display order-1 text-[40px] font-bold tracking-[-0.02em] text-(--cm-ink) lg:text-[48px]">{s.value}</dt>
                <dd className="order-2 text-[15px] text-(--cm-muted)">{s.label}</dd>
              </div>
            ))}
          </dl>
          <div className="cm-zoom-host h-[260px] overflow-hidden bg-(--cm-soft) sm:h-[360px] lg:h-[480px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={about.imageUrl} alt={about.imageAlt} loading="lazy" className="cm-zoom size-full object-cover" />
          </div>
          <p className="cm-mono text-right text-[11px] tracking-[0.06em] text-(--cm-muted) sm:text-[12px]">{about.caption}</p>
        </section>

        {/* Visit */}
        <section id="visit" className={`${pad} flex flex-col gap-10 pt-6 pb-16 lg:pb-24`}>
          <div className="flex flex-col items-center gap-3.5 text-center">
            <Eyebrow>{visit.eyebrow}</Eyebrow>
            <h2 className="cm-display text-[34px] leading-[1.05] font-bold tracking-[-0.02em] text-(--cm-ink) sm:text-[44px] lg:text-[56px]">
              {visit.title}
            </h2>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="relative min-w-0 flex-1 overflow-hidden border border-(--cm-ink) lg:h-[688px]">
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open in Google Maps"
                className="relative block h-[320px] overflow-hidden bg-(--cm-map) lg:absolute lg:inset-0 lg:h-auto"
              >
                <span className="absolute top-[150px] left-0 h-2.5 w-[2000px] bg-white" />
                <span className="absolute top-[290px] left-0 h-[7px] w-[2000px] bg-white" />
                <span className="absolute top-0 left-[420px] h-[1000px] w-2 bg-white" />
                <span className="absolute top-0 left-[700px] h-[1000px] w-1.5 bg-white" />
                <span className="absolute top-20 left-[-100px] h-1.5 w-[2000px] origin-left -rotate-14 bg-white" />
                <span className="absolute top-[-100px] left-[120px] h-[1000px] w-[7px] origin-top rotate-20 bg-white" />
                <span className="absolute top-[22%] left-1/2 block h-40 w-[220px] -translate-x-1/2 rounded-full bg-[#d8e6d3]" />
                <span className="absolute top-[30%] left-[calc(50%-90px)] flex items-center gap-2 lg:top-[32%]">
                  <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-(--cm-accent)/20">
                    <span className="size-[18px] rounded-full border-2 border-white bg-(--cm-accent)" />
                  </span>
                  <span className="flex flex-col gap-0.5 rounded-xl bg-white px-3.5 py-2.5 whitespace-nowrap shadow-[0_4px_12px_rgba(60,120,207,0.12)]">
                    <span className="text-[14px] font-semibold text-[#1c2b4a]">{visit.mapPinTitle}</span>
                    <span className="text-[12px] text-[#596680]">{visit.mapPinSubtitle}</span>
                  </span>
                </span>
                <span className="absolute right-5 bottom-5 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-[#2f6bc4] shadow-[0_4px_12px_rgba(60,120,207,0.12)]">
                  Open in Google Maps ↗
                </span>
              </a>

              <div className="flex flex-col gap-4 border-t border-(--cm-ink) bg-white p-6 sm:p-7 lg:absolute lg:bottom-6 lg:left-6 lg:w-[420px] lg:border">
                <div className="flex flex-col items-start gap-2">
                  <h3 className="cm-display text-[24px] font-bold text-(--cm-ink) lg:text-[26px]">{business.name}</h3>
                  <span className="cm-mono inline-flex items-center gap-1.5 border border-(--cm-ink) px-2.5 py-1 text-[11px] tracking-[0.04em] text-(--cm-ink)">
                    <span className="size-1.5 rounded-full bg-(--cm-open)" aria-hidden />
                    {content.openNowLabel.toUpperCase()}
                  </span>
                </div>
                <dl className="flex flex-col border-b border-(--cm-line)">
                  <InfoRow label="OPEN TODAY">{content.todayHours}</InfoRow>
                  <InfoRow label="FIND US">{visit.shortAddress}</InfoRow>
                  <InfoRow label="CALL">
                    <a href={telHref(business.phone)} className="cm-ul no-underline hover:underline">
                      {business.phone}
                    </a>
                  </InfoRow>
                  <InfoRow label="EMAIL">
                    <a href={`mailto:${business.email}`} className="break-all hover:underline">
                      {business.email}
                    </a>
                  </InfoRow>
                </dl>
                <a href={directions} target="_blank" rel="noopener noreferrer" className="cm-ul text-[16px] font-medium text-(--cm-ink)">
                  Get directions ↗
                </a>
              </div>
            </div>

            <CleanMonoContactForm
              title={visit.form.title}
              intro={visit.form.intro}
              topics={visit.form.topics}
              replyNote={visit.form.replyNote}
              toEmail={business.email}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`${pad} flex flex-col gap-9 pb-10`}>
        <div className="h-px bg-(--cm-ink)" />
        <div className="flex flex-col gap-10 pt-4 md:flex-row md:justify-between">
          <div className="flex flex-col gap-2.5">
            <p className="cm-display text-[24px] font-bold text-(--cm-ink)">▲ {business.name}</p>
            <p className="text-[14px] text-(--cm-muted)">Sorya Center, floor 2 · Phnom Penh</p>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 md:gap-x-16">
            <div className="flex flex-col gap-2.5 text-[14px] text-(--cm-ink)">
              <p className="cm-mono text-[12px] tracking-[0.06em] text-(--cm-muted)">HOURS</p>
              {business.hours.map((h) => (
                <div key={h.days} className="flex flex-col gap-2.5">
                  <span>{h.days}</span>
                  <span>{h.hours}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2.5 text-[14px] text-(--cm-ink)">
              <p className="cm-mono text-[12px] tracking-[0.06em] text-(--cm-muted)">CONTACT</p>
              <a href={`mailto:${business.email}`} className="break-all hover:underline">
                {business.email}
              </a>
              <a href={telHref(business.phone)} className="hover:underline">
                {business.phone}
              </a>
            </div>
            <div className="flex flex-col gap-2.5 text-[14px] text-(--cm-ink)">
              <p className="cm-mono text-[12px] tracking-[0.06em] text-(--cm-muted)">FOLLOW</p>
              {content.social.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="cm-mono flex flex-col gap-2 pt-6 text-[11px] tracking-[0.06em] text-(--cm-muted) sm:flex-row sm:justify-between">
          <p>© 2026 {business.name.toUpperCase()}</p>
          <p>{content.footerNote}</p>
        </div>
      </footer>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[72px] flex-col justify-between gap-1.5 border-t border-(--cm-line) py-3.5">
      <dt className="cm-mono text-[12px] tracking-[0.06em] text-(--cm-muted)">{label}</dt>
      <dd className="cm-display text-[18px] font-medium text-(--cm-ink)">{children}</dd>
    </div>
  );
}
