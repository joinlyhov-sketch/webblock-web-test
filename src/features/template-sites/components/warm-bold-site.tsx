import { DM_Mono, Playfair_Display } from "next/font/google";
import { formatPrice } from "@/lib/format";
import type { SiteProduct } from "../types";
import type { WarmBoldContent } from "../types/warm-bold";
import { WarmBoldContactForm } from "./warm-bold-contact-form";
import { WarmBoldNav } from "./warm-bold-nav";
import { WarmBoldShop } from "./warm-bold-shop";
import { telHref } from "@/lib/tel";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-wb-display",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-wb-mono",
  display: "swap",
});

const css = `
.wb-root{
  --wb-bg:#271b15;--wb-dark:#1a110c;--wb-panel:#342419;--wb-line:#4a3528;
  --wb-cream:#f6ecdc;--wb-amber:#f2b544;--wb-muted:#b89e8a;--wb-nav-muted:#b59c86;
  background:var(--wb-bg);color:var(--wb-cream);
  font-family:var(--font-dm-sans),system-ui,sans-serif;
  min-height:100vh;overflow-x:clip;
}
html{scroll-behavior:smooth}
.wb-root .wb-display{font-family:var(--font-wb-display),Georgia,serif}
.wb-root .wb-mono{font-family:var(--font-wb-mono),ui-monospace,monospace}
.wb-root [id]{scroll-margin-top:72px}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
`;

const eyebrow = "wb-mono text-[11px] font-medium tracking-[1.32px] text-[var(--wb-amber)] lg:text-[13px] lg:tracking-[1.56px]";
const h2 = "wb-display text-[32px] leading-tight font-black tracking-[-0.32px] text-[var(--wb-cream)] md:text-[44px] lg:text-[60px] lg:tracking-[-0.6px]";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wb-amber)]";
const pad = "px-5 md:px-10 lg:px-24";

function mapsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className="size-[15px] shrink-0 lg:size-7">
      <circle cx="14" cy="14" r="11" stroke="#f2b544" strokeWidth="2" />
      <path d="M14 8v6l4 2.5" stroke="#f2b544" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className="size-[15px] shrink-0 lg:size-7">
      <path d="M14 25s8-7.2 8-13a8 8 0 1 0-16 0c0 5.8 8 13 8 13Z" stroke="#f2b544" strokeWidth="2" />
      <circle cx="14" cy="12" r="3" stroke="#f2b544" strokeWidth="2" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className="size-[15px] shrink-0 lg:size-7">
      <path
        d="M6 4h5l2 6-3 2c1.3 2.7 3.3 4.7 6 6l2-3 6 2v5a2 2 0 0 1-2 2C12.5 24 4 15.5 4 6a2 2 0 0 1 2-2Z"
        stroke="#f2b544"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stamp({ lines }: { lines: [string, string, string] }) {
  return (
    <div
      aria-hidden
      className="absolute top-9 right-3 flex size-[110px] rotate-12 flex-col items-center justify-center gap-0.5 rounded-full border border-[var(--wb-amber)] md:right-10 lg:top-auto lg:right-20 lg:bottom-[85px] lg:size-[170px] lg:gap-1"
    >
      <span className="absolute inset-[7px] rounded-full border border-[var(--wb-amber)]/60 lg:inset-3" />
      <span className="wb-mono text-[10px] font-medium tracking-[1.4px] text-[var(--wb-amber)] lg:text-sm lg:tracking-[2.24px]">{lines[0]}</span>
      <span className="wb-mono text-[10px] font-medium tracking-[1.4px] text-[var(--wb-amber)] lg:text-sm lg:tracking-[2.24px]">{lines[1]}</span>
      <span className="wb-mono text-[8px] tracking-[0.48px] text-[var(--wb-cream)] lg:text-[11px] lg:tracking-[0.88px]">{lines[2]}</span>
    </div>
  );
}

function ListItem({ product, index }: { product: SiteProduct; index: number }) {
  return (
    <a
      href="#shop"
      className={`group flex items-center gap-4 py-[18px] lg:gap-7 lg:py-9 ${focusRing} ${index === 0 ? "pt-0 lg:pt-0" : ""}`}
    >
      <div className="size-[110px] shrink-0 overflow-hidden rounded bg-[var(--wb-panel)] md:size-[160px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt={product.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 lg:gap-2.5">
        <span className="wb-mono text-[10px] font-medium tracking-[0.8px] text-[var(--wb-amber)] lg:text-[13px] lg:tracking-[1.04px]">
          {String(index + 2).padStart(2, "0")}
        </span>
        <span className="wb-display text-xl font-semibold text-[var(--wb-cream)] transition-colors group-hover:text-[var(--wb-amber)] md:text-[26px] lg:text-[28px]">
          {product.name}
        </span>
        {product.note ? <span className="text-[13px] text-[var(--wb-muted)] lg:text-base">{product.note}</span> : null}
        <span className="wb-mono text-[15px] font-medium text-[var(--wb-amber)] lg:text-xl">
          {formatPrice(product.price, product.currency)}
        </span>
      </div>
    </a>
  );
}

export function WarmBoldSite({ content }: { content: WarmBoldContent }) {
  const { business, hero, popular, shop, about, visit, contact } = content;
  const find = (id: string) => content.products.find((p) => p.id === id);
  const featured = find(popular.featuredProductId);
  const listed = popular.listProductIds.map(find).filter((p): p is SiteProduct => Boolean(p));
  const directions = mapsUrl(business.address);
  const todayHours = business.hours[0]?.hours ?? "";
  const [addrLine1, ...addrRest] = business.address.split(",");

  return (
    <div className={`wb-root ${playfair.variable} ${dmMono.variable}`}>
      <style>{css}</style>

      <WarmBoldNav
        brandName={content.brandName}
        links={[
          { label: "Home", href: "#home" },
          { label: "Shop", href: "#shop" },
          { label: "Visit us", href: "#visit" },
        ]}
        openNowLabel={content.openNowLabel}
        contactLabel="Contact"
        contactHref="#contact"
      />

      <main>
        {/* Hero */}
        <section id="home" className="relative flex h-[560px] items-end overflow-hidden md:h-[680px] lg:h-[760px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(39,27,21,0.2)] via-[rgba(39,27,21,0.45)] to-[rgba(39,27,21,0.97)]" />
          <Stamp lines={hero.stampLines} />
          <div className={`relative flex w-full flex-col items-start gap-3.5 pb-10 md:pb-16 lg:gap-[22px] lg:pb-[90px] ${pad}`}>
            <p className="wb-mono text-[11px] font-medium tracking-[1.32px] text-[var(--wb-amber)] lg:text-[13px] lg:tracking-[1.56px]">{hero.eyebrow}</p>
            <h1 className="wb-display text-[44px] leading-none font-black tracking-[-0.44px] text-[var(--wb-cream)] md:text-[72px] lg:text-[104px] lg:leading-[0.96] lg:tracking-[-2.08px]">
              {hero.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="max-w-[340px] text-[15px] leading-normal text-[rgba(246,236,220,0.85)] md:max-w-[480px] lg:max-w-[560px] lg:text-[19px]">{hero.subtitle}</p>
            <div className="flex flex-wrap gap-2.5 pt-1 lg:gap-3 lg:pt-1.5">
              <a href="#shop" className={`rounded bg-[var(--wb-amber)] px-5 py-3 text-sm font-semibold text-[var(--wb-bg)] transition-colors hover:bg-[#ffc968] lg:px-[26px] lg:py-3.5 lg:text-base ${focusRing}`}>
                {hero.primaryCta}
              </a>
              <a href="#visit" className={`rounded border-[1.5px] border-[rgba(246,236,220,0.7)] px-5 py-3 text-sm font-semibold text-[var(--wb-cream)] transition-colors hover:border-[var(--wb-amber)] hover:text-[var(--wb-amber)] lg:px-[26px] lg:py-3.5 lg:text-base ${focusRing}`}>
                {hero.secondaryCta}
              </a>
            </div>
          </div>
        </section>

        {/* Facts */}
        <section className={`flex flex-col gap-2.5 bg-[var(--wb-dark)] py-4 md:flex-row md:gap-0 lg:py-[22px] ${pad}`}>
          {content.facts.map((fact, i) => (
            <div
              key={fact}
              className={`flex flex-1 items-center gap-3 lg:gap-3.5 ${i > 0 ? "md:border-l md:border-[var(--wb-line)] md:pl-8" : ""}`}
            >
              <span className="wb-mono text-[11px] font-medium text-[var(--wb-amber)] lg:text-[13px]">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[13px] text-[rgba(246,236,220,0.85)] lg:text-[15px]">{fact}</span>
            </div>
          ))}
        </section>

        {/* Popular */}
        <section id="popular" className={`flex flex-col gap-6 pt-11 pb-10 md:pt-16 lg:gap-11 lg:pt-24 lg:pb-[88px] ${pad}`}>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2.5 lg:gap-3.5">
              <p className={eyebrow}>{popular.eyebrow}</p>
              <h2 className={h2}>{popular.title}</h2>
            </div>
            <a href="#shop" className={`hidden pb-2.5 text-base font-medium whitespace-nowrap text-[var(--wb-amber)] underline underline-offset-4 transition-opacity hover:opacity-80 md:block ${focusRing}`}>
              {popular.viewAllLabel}
            </a>
          </div>
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
            {featured ? (
              <a href="#shop" className={`group relative block h-[360px] overflow-hidden rounded-md bg-[var(--wb-panel)] md:h-[480px] lg:h-[600px] ${focusRing}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured.imageUrl} alt={featured.name} className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(26,17,12,0)] via-[rgba(26,17,12,0.25)] to-[rgba(26,17,12,0.92)]" />
                <div className="absolute bottom-5 left-5 flex flex-col gap-1.5 md:bottom-8 md:left-8 lg:bottom-10 lg:left-10 lg:gap-2">
                  <span className="wb-mono text-[10px] font-medium tracking-[1.2px] text-[var(--wb-amber)] lg:text-xs lg:tracking-[1.44px]">{popular.featuredLabel}</span>
                  <span className="wb-display text-[26px] font-semibold text-[var(--wb-cream)] lg:text-[40px]">{featured.name}</span>
                  {featured.note ? <span className="text-sm text-[rgba(246,236,220,0.8)] lg:text-base">{featured.note}</span> : null}
                  <span className="wb-mono text-lg font-medium text-[var(--wb-amber)] lg:text-[22px]">{formatPrice(featured.price, featured.currency)}</span>
                </div>
              </a>
            ) : null}
            <div className="flex flex-col justify-center divide-y divide-[var(--wb-line)]">
              {listed.map((p, i) => (
                <ListItem key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
          <a href="#shop" className={`text-[15px] font-medium text-[var(--wb-amber)] underline underline-offset-4 md:hidden ${focusRing}`}>
            {popular.viewAllLabel}
          </a>
        </section>

        {/* All products */}
        <section id="shop" className={`flex flex-col gap-5 pb-10 lg:gap-9 lg:pt-2 lg:pb-24 ${pad}`}>
          <div className="flex flex-col gap-2.5 lg:gap-3.5">
            <p className={eyebrow}>{shop.eyebrow}</p>
            <h2 className={h2}>{shop.title}</h2>
          </div>
          <WarmBoldShop
            products={content.products}
            categories={shop.categories}
            searchPlaceholder={shop.searchPlaceholder}
            totalItems={shop.totalItems}
          />
        </section>

        {/* About */}
        <section id="about" className={`flex flex-col gap-4 bg-[var(--wb-panel)] py-10 lg:flex-row lg:items-center lg:gap-24 lg:py-24 ${pad}`}>
          <div className="flex flex-1 flex-col items-start gap-4 lg:gap-5">
            <p className={eyebrow}>{about.eyebrow}</p>
            <p aria-hidden className="wb-display h-[58px] text-[96px] leading-[0.6] font-black text-[var(--wb-amber)] lg:h-[84px] lg:text-[140px]">
              “
            </p>
            <blockquote className="wb-display text-2xl leading-[1.35] text-[var(--wb-cream)] italic md:text-[32px] lg:text-[34px] lg:leading-[1.3]">
              {about.quote}
            </blockquote>
            <div className="flex items-center gap-3 pt-3 lg:gap-4">
              <span className="h-px w-8 bg-[var(--wb-amber)] lg:w-12" />
              <span className="wb-mono text-[11px] tracking-[0.66px] text-[var(--wb-muted)] lg:text-[13px] lg:tracking-[0.78px]">{about.author}</span>
            </div>
          </div>
          <div className="relative mt-3 aspect-[560/640] w-full max-w-[420px] shrink-0 self-start lg:mt-0 lg:w-[440px] lg:max-w-none lg:self-auto">
            <div className="absolute top-[6.25%] left-[7.14%] h-[93.75%] w-[92.86%] border-2 border-[var(--wb-amber)]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={about.imageUrl} alt="" className="absolute top-0 left-0 h-[93.75%] w-[92.86%] object-cover" />
          </div>
        </section>

        {/* Visit us */}
        <section id="visit" className={`flex flex-col gap-5 py-10 lg:gap-10 lg:py-24 ${pad}`}>
          <div className="flex flex-col gap-2.5 lg:items-center lg:gap-3.5 lg:text-center">
            <p className={eyebrow}>{visit.eyebrow}</p>
            <h2 className={h2}>{visit.title}</h2>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
            <div className="relative flex flex-col gap-5 lg:min-h-[640px] lg:flex-1 lg:gap-0">
              {/* Map */}
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={visit.mapLabel}
                className={`group relative block h-[240px] overflow-hidden rounded-md bg-[#e8f0e5] md:h-[340px] lg:absolute lg:inset-0 lg:h-auto lg:rounded-lg ${focusRing}`}
              >
                <span className="absolute top-[150px] left-0 h-2.5 w-[2000px] bg-white" />
                <span className="absolute top-[290px] left-0 h-[7px] w-[2000px] bg-white" />
                <span className="absolute top-0 left-[420px] h-[1000px] w-2 bg-white" />
                <span className="absolute top-0 left-[700px] h-[1000px] w-1.5 bg-white" />
                <span className="absolute top-[40px] left-0 h-1.5 w-[2000px] origin-left -rotate-[14deg] bg-white" />
                <span className="absolute top-0 left-[40px] h-[1000px] w-[7px] origin-top rotate-[20deg] bg-white" />
                <span className="absolute top-[8%] left-[42%] h-[160px] w-[220px] rounded-[50%] bg-[#cfe3c8]/80" />
                <span className="absolute top-[22%] left-[10%] lg:top-[8%] lg:left-[16%]">
                  <span className="relative block size-11 rounded-full bg-[#2f6bc4]/25">
                    <span className="absolute top-[13px] left-[13px] size-[18px] rounded-full border-[3px] border-white bg-[#2f6bc4]" />
                  </span>
                  <span className="absolute top-[-6px] left-[50px] flex flex-col rounded-xl bg-white px-3.5 py-2.5 whitespace-nowrap shadow-[0_4px_12px_rgba(60,120,207,0.12)]">
                    <span className="text-sm font-semibold text-[#1c2b4a]">{business.name}</span>
                    <span className="text-xs text-[#596680]">{business.address}</span>
                  </span>
                </span>
                <span className="absolute right-3 bottom-4 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-[#2f6bc4] shadow-[0_4px_12px_rgba(60,120,207,0.12)] transition-transform group-hover:-translate-y-0.5 lg:right-5 lg:bottom-5">
                  {visit.mapLabel}
                </span>
              </a>

              {/* Info card */}
              <div className="relative flex flex-col rounded-md border border-[var(--wb-line)] bg-[var(--wb-dark)] p-5 lg:m-6 lg:mt-auto lg:w-[360px] lg:bg-[var(--wb-bg)] lg:p-8 lg:shadow-[0_16px_20px_rgba(0,0,0,0.3)]">
                <div className="hidden flex-col gap-2.5 pb-5 lg:flex">
                  <p className="wb-display text-[28px] font-black text-[var(--wb-cream)]">{business.name}</p>
                  <span className="wb-mono inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--wb-line)] px-2.5 py-[5px] text-[11px] tracking-[0.66px] text-[var(--wb-amber)]">
                    <span className="size-1.5 rounded-full bg-[#2fb36b]" aria-hidden />
                    {content.openNowLabel.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-3.5 pb-3.5 lg:gap-[18px] lg:pb-5">
                  <ClockIcon />
                  <div className="flex flex-col gap-1 lg:gap-1.5">
                    <span className="wb-mono text-[10px] tracking-[1px] text-[var(--wb-muted)] lg:text-[11px] lg:tracking-[1.1px]">OPEN TODAY</span>
                    <span className="wb-display text-lg font-semibold text-[var(--wb-cream)] lg:text-2xl">{todayHours}</span>
                  </div>
                </div>
                <div className="h-px bg-[var(--wb-line)]" />
                <a href={directions} target="_blank" rel="noopener noreferrer" className={`group flex items-center gap-3.5 py-3.5 lg:gap-[18px] lg:py-5 ${focusRing}`}>
                  <PinIcon />
                  <div className="flex min-w-0 flex-col gap-1 lg:gap-1.5">
                    <span className="wb-mono text-[10px] tracking-[1px] text-[var(--wb-muted)] lg:text-[11px] lg:tracking-[1.1px]">FIND US</span>
                    <span className="wb-display text-lg font-semibold text-[var(--wb-cream)] transition-colors group-hover:text-[var(--wb-amber)] lg:text-xl">
                      {addrLine1}
                      {addrRest.length ? `,${addrRest.join(",")}` : ""}
                    </span>
                  </div>
                </a>
                <div className="h-px bg-[var(--wb-line)]" />
                <a href={telHref(business.phone)} className={`group flex items-center gap-3.5 pt-3.5 lg:gap-[18px] lg:pt-5 ${focusRing}`}>
                  <PhoneIcon />
                  <div className="flex flex-col gap-1 lg:gap-1.5">
                    <span className="wb-mono text-[10px] tracking-[1px] text-[var(--wb-muted)] lg:text-[11px] lg:tracking-[1.1px]">CALL</span>
                    <span className="wb-display text-lg font-semibold text-[var(--wb-cream)] transition-colors group-hover:text-[var(--wb-amber)] lg:text-2xl">{business.phone}</span>
                  </div>
                </a>
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-5 flex items-center justify-center rounded bg-[var(--wb-amber)] px-[22px] py-3 text-[15px] font-semibold text-[var(--wb-bg)] transition-colors hover:bg-[#ffc968] ${focusRing}`}
                >
                  Get directions ↗
                </a>
              </div>
            </div>

            <div id="contact" className="lg:w-[400px] lg:shrink-0">
              <WarmBoldContactForm
                title={contact.title}
                subtitle={contact.subtitle}
                topics={contact.topics}
                replyNote={contact.replyNote}
                toEmail={business.email}
                brandName={content.brandName}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`flex flex-col gap-6 bg-[var(--wb-dark)] pt-10 pb-7 lg:gap-10 lg:pt-[72px] lg:pb-10 ${pad}`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 lg:gap-3">
            <p className="wb-display text-[26px] font-black text-[var(--wb-cream)] lg:text-4xl">◉ {content.brandName}</p>
            <p className="text-[13px] text-[var(--wb-muted)] lg:text-[15px]">{content.footerTagline}</p>
          </div>
          <div className="flex flex-wrap gap-7 lg:gap-[72px]">
            <div className="flex flex-col gap-2 text-[13px] text-[rgba(246,236,220,0.85)] lg:gap-3 lg:text-[15px]">
              <span className="wb-mono text-[10px] font-medium tracking-[1.2px] text-[var(--wb-amber)] lg:text-xs lg:tracking-[1.44px]">VISIT</span>
              <a href={directions} target="_blank" rel="noopener noreferrer" className={`transition-colors hover:text-[var(--wb-amber)] ${focusRing}`}>
                {addrLine1}
                <br />
                {addrRest.join(",").trim()}
              </a>
            </div>
            <div className="flex flex-col gap-2 text-[13px] text-[rgba(246,236,220,0.85)] lg:gap-3 lg:text-[15px]">
              <span className="wb-mono text-[10px] font-medium tracking-[1.2px] text-[var(--wb-amber)] lg:text-xs lg:tracking-[1.44px]">HOURS</span>
              {business.hours.map((h) => (
                <span key={h.days} className="flex flex-col gap-2 lg:gap-3">
                  <span>{h.days}</span>
                  <span>{h.hours}</span>
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-2 text-[13px] text-[rgba(246,236,220,0.85)] lg:gap-3 lg:text-[15px]">
              <span className="wb-mono text-[10px] font-medium tracking-[1.2px] text-[var(--wb-amber)] lg:text-xs lg:tracking-[1.44px]">FOLLOW</span>
              {content.social.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className={`transition-colors hover:text-[var(--wb-amber)] ${focusRing}`}>
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="h-px bg-[var(--wb-line)]" />
        <div className="wb-mono flex flex-col gap-1 text-[11px] text-[var(--wb-muted)] lg:flex-row lg:justify-between lg:text-xs">
          <span>
            <a href={`mailto:${business.email}`} className={`transition-colors hover:text-[var(--wb-amber)] ${focusRing}`}>
              {business.email}
            </a>
            {" · "}
            <a href={telHref(business.phone)} className={`transition-colors hover:text-[var(--wb-amber)] ${focusRing}`}>
              {business.phone}
            </a>
          </span>
          <span>Made with WebBlock</span>
        </div>
      </footer>
    </div>
  );
}
