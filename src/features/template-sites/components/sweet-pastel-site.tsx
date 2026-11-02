import type { CSSProperties } from "react";
import { Caveat, Fredoka } from "next/font/google";
import { formatPrice } from "@/lib/format";
import type { SweetPastelContent } from "../types/sweet-pastel";
import { SweetPastelCatalog } from "./sweet-pastel-catalog";
import { SweetPastelContact } from "./sweet-pastel-contact";
import { SweetPastelNav } from "./sweet-pastel-nav";
import { telHref } from "@/lib/tel";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["500", "600", "700"] });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", weight: ["700"] });

const palette = {
  "--sp-cream": "#fff8f3",
  "--sp-pink": "#e25c85",
  "--sp-pink-dark": "#cf4a74",
  "--sp-pink-soft": "#ffe1ea",
  "--sp-pink-tint": "#f9c9d8",
  "--sp-ink": "#4a2b36",
  "--sp-muted": "#9a7a86",
  "--sp-muted-2": "#8a6b76",
  "--sp-butter": "#fff1b8",
  "--sp-mint": "#d8f0e3",
  "--sp-lilac": "#e6dcf7",
  "--sp-mint-soft": "#ebf7f0",
  "--sp-green": "#147345",
  "--sp-green-dot": "#2fb26b",
  "--sp-line": "#f3cbd8",
  "--sp-border": "#f1dde4",
  "--sp-map": "#e8f0e5",
  "--sp-blue": "#2f6bc4",
} as CSSProperties;

const css = `
.sp-root{scroll-behavior:smooth}
.sp-root section[id]{scroll-margin-top:84px}
.sp-scallop{height:48px;background:radial-gradient(circle 48px at 48px 48px,var(--sp-cream) 47.5px,transparent 48px) 0 0/96px 48px repeat-x}
`;

const TINTS = ["bg-(--sp-butter)", "bg-(--sp-mint)", "bg-(--sp-lilac)", "bg-(--sp-pink-soft)"];
const ghostBtn =
  "inline-flex items-center justify-center rounded-full border-2 border-(--sp-ink) px-[26px] py-3.5 text-[16px] font-semibold text-(--sp-ink) transition-colors hover:bg-(--sp-ink) hover:text-white focus-visible:ring-2 focus-visible:ring-(--sp-pink) focus-visible:ring-offset-2 focus-visible:outline-none";
const solidBtn =
  "inline-flex items-center justify-center rounded-full bg-(--sp-pink) px-[26px] py-3.5 text-[16px] font-semibold text-white border-2 border-(--sp-pink) transition-colors hover:bg-(--sp-pink-dark) hover:border-(--sp-pink-dark) focus-visible:ring-2 focus-visible:ring-(--sp-ink) focus-visible:ring-offset-2 focus-visible:outline-none";


export function SweetPastelSite({ content }: { content: SweetPastelContent }) {
  const { business, hero, popular, catalog, about, visit, products, socials } = content;
  const mapsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address)}`;
  const popularProducts = popular.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const street = business.address.split(",")[0];
  const [sideA, center, sideB] = hero.images;

  return (
    <div
      className={`sp-root ${fredoka.variable} ${caveat.variable} min-h-screen bg-(--sp-cream) font-(family-name:--font-dm-sans) text-(--sp-ink)`}
      style={palette}
    >
      <style>{css}</style>
      <SweetPastelNav
        brand={business.name}
        openNote={content.openNote}
        links={[
          { label: "Home", href: "#home" },
          { label: "Shop", href: "#shop" },
          { label: "Visit us", href: "#visit" },
        ]}
        contactHref="#contact"
      />

      <section id="home" className="relative flex flex-col items-center gap-9 bg-(--sp-pink-soft) px-5 pt-12 pb-24 md:px-12 md:pt-16 md:pb-28 xl:px-24">
        <div className="flex flex-col items-center gap-[18px] text-center">
          <p className="font-(family-name:--font-caveat) text-[24px] font-bold text-(--sp-pink) md:text-[32px]">{hero.kicker}</p>
          <h1 className="font-(family-name:--font-fredoka) text-[44px] leading-none font-bold tracking-[-0.02em] text-(--sp-ink) md:text-[64px] xl:text-[80px]">
            {hero.titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="max-w-[560px] text-[16px] leading-normal text-(--sp-muted-2) md:text-[18px]">{hero.subtitle}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#popular" className={solidBtn}>
              {hero.primaryCta}
            </a>
            <a href="#visit" className={ghostBtn}>
              {hero.secondaryCta}
            </a>
          </div>
        </div>

        <div className="relative flex items-end justify-center gap-3 md:gap-8">
          <div className="pb-8 md:pb-[90px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sideA} alt="" width={220} height={220} className="size-[84px] rounded-full object-cover sm:size-[140px] lg:size-[220px]" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={center} alt="" width={400} height={400} className="size-[180px] rounded-full object-cover sm:size-[300px] lg:size-[400px]" />
          <div className="pb-4 md:pb-[30px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sideB} alt="" width={280} height={280} className="size-[100px] rounded-full object-cover sm:size-[180px] lg:size-[280px]" />
          </div>
          <span className="absolute top-0 left-[8%] -rotate-[8deg] rounded-full bg-(--sp-butter) px-3 py-1 font-(family-name:--font-caveat) text-[18px] font-bold whitespace-nowrap text-(--sp-ink) shadow-[0_6px_8px_rgba(60,120,207,0.18)] sm:left-[22%] md:px-[18px] md:py-2 md:text-[28px] lg:left-[26%]">
            {hero.stickerOne}
          </span>
          <span className="absolute right-[2%] bottom-[8%] rotate-6 rounded-full bg-(--sp-mint) px-3 py-1 font-(family-name:--font-caveat) text-[18px] font-bold whitespace-nowrap text-(--sp-ink) shadow-[0_6px_8px_rgba(60,120,207,0.18)] md:px-[18px] md:py-2 md:text-[28px] lg:right-[6%]">
            {hero.stickerTwo}
          </span>
        </div>
        <div className="sp-scallop absolute inset-x-0 bottom-0" aria-hidden />
      </section>

      <section id="popular" className="flex flex-col items-center gap-11 px-5 pt-16 pb-16 md:px-12 md:pt-24 md:pb-[88px] xl:px-24">
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="font-(family-name:--font-caveat) text-[24px] font-bold text-(--sp-pink) md:text-[30px]">{popular.kicker}</p>
          <h2 className="font-(family-name:--font-fredoka) text-[36px] font-bold tracking-[-0.01em] text-(--sp-ink) md:text-[48px] xl:text-[56px]">
            {popular.title}
          </h2>
        </div>
        <ul className="flex w-full max-w-[1550px] flex-col items-stretch gap-8 md:flex-row md:justify-center">
          {popularProducts.map((p, i) => (
            <li key={p.id} className={`flex flex-1 flex-col md:max-w-[480px] ${i === 1 ? "md:pt-14" : ""}`}>
              <a
                href="#shop"
                className={`group flex flex-col items-center gap-4 rounded-[48px] p-6 text-center transition-transform hover:-translate-y-1.5 focus-visible:ring-2 focus-visible:ring-(--sp-pink) focus-visible:outline-none lg:p-8 ${TINTS[i % 4]}`}
              >
                <div className="aspect-square w-full max-w-[300px] overflow-hidden rounded-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt={p.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="font-(family-name:--font-fredoka) text-[22px] font-semibold text-(--sp-ink) lg:text-[26px]">{p.name}</h3>
                {p.note && <p className="text-[15px] text-(--sp-muted-2)">{p.note}</p>}
                <span className="rounded-full bg-white px-4 py-2 text-[16px] font-bold text-(--sp-pink)">{formatPrice(p.price, p.currency)}</span>
              </a>
            </li>
          ))}
        </ul>
        <a href="#shop" className={ghostBtn}>
          {popular.viewAll}
        </a>
      </section>

      <section id="shop" className="px-5 pb-16 md:px-12 md:pb-24 xl:px-24">
        <SweetPastelCatalog
          kicker={catalog.kicker}
          title={catalog.title}
          searchPlaceholder={catalog.searchPlaceholder}
          categories={catalog.categories}
          pageSize={catalog.pageSize}
          products={products}
        />
      </section>

      <section id="about" className="flex flex-col items-center gap-10 px-5 pb-16 md:px-12 md:pb-24 lg:flex-row lg:gap-20 xl:px-24">
        <div className="h-[380px] w-full max-w-[600px] overflow-hidden rounded-t-[300px] rounded-b-[40px] md:h-[560px] lg:w-[45%] lg:shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={about.imageUrl} alt="" className="size-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[22px]">
          <p className="font-(family-name:--font-caveat) text-[24px] font-bold text-(--sp-pink) md:text-[30px]">{about.kicker}</p>
          <h2 className="font-(family-name:--font-fredoka) text-[36px] font-bold tracking-[-0.01em] text-(--sp-ink) md:text-[52px]">{about.title}</h2>
          <p className="text-[16px] leading-[1.6] text-(--sp-muted-2) md:text-[18px]">{about.body}</p>
          <div className="flex flex-wrap gap-4">
            {about.stats.map((s, i) => (
              <div key={s.label} className={`flex size-[110px] flex-col items-center justify-center gap-0.5 rounded-full sm:size-[150px] ${TINTS[[0, 1, 3][i % 3]]}`}>
                <span className="font-(family-name:--font-fredoka) text-[24px] font-bold text-(--sp-ink) sm:text-[30px]">{s.value}</span>
                <span className="text-[12px] text-(--sp-muted-2) sm:text-[13px]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="visit" className="flex flex-col items-center gap-9 px-5 pb-16 md:px-12 md:pb-24 xl:px-24">
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="font-(family-name:--font-caveat) text-[24px] font-bold text-(--sp-pink) md:text-[30px]">{visit.kicker}</p>
          <h2 className="font-(family-name:--font-fredoka) text-[36px] font-bold tracking-[-0.01em] text-(--sp-ink) md:text-[52px]">{visit.title}</h2>
        </div>
        <div className="flex w-full flex-col gap-6 rounded-[32px] bg-(--sp-lilac) p-4 md:gap-10 md:rounded-[56px] md:p-10 lg:flex-row">
          <div className="relative flex min-h-[640px] flex-1 flex-col justify-end gap-4 overflow-hidden rounded-[32px] bg-(--sp-map) p-4 md:p-6 lg:min-h-[678px]">
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" aria-label="Open map in Google Maps" className="absolute inset-0 z-0">
              <span className="absolute top-[150px] left-0 h-2.5 w-[2000px] bg-white" />
              <span className="absolute top-[290px] left-0 h-[7px] w-[2000px] bg-white" />
              <span className="absolute top-0 left-[22%] h-[1000px] w-2 bg-white" />
              <span className="absolute top-0 left-[62%] h-[1000px] w-1.5 bg-white" />
              <span className="absolute top-[40px] -left-10 h-1.5 w-[2000px] origin-left -rotate-[14deg] bg-white" />
              <span className="absolute top-0 left-[8%] h-[1000px] w-[7px] origin-top rotate-[20deg] bg-white" />
              <span className="absolute top-[124px] left-[34%] h-[160px] w-[220px] rounded-full bg-(--sp-pink)/20 sm:left-[38%]" />
              <span className="absolute top-[222px] left-[calc(34%+88px)] size-11 rounded-full bg-(--sp-pink)/40 sm:left-[calc(38%+88px)]" />
              <span className="absolute top-[235px] left-[calc(34%+101px)] size-[18px] rounded-full border-[3px] border-white bg-(--sp-pink) sm:left-[calc(38%+101px)]" />
              <span className="absolute top-[216px] left-[calc(34%+140px)] flex flex-col gap-0.5 rounded-xl bg-white px-3.5 py-2.5 shadow-[0_4px_12px_rgba(60,120,207,0.12)] sm:left-[calc(38%+140px)]">
                <span className="text-[14px] font-semibold whitespace-nowrap text-(--sp-ink)">{business.name}</span>
                <span className="text-[12px] whitespace-nowrap text-(--sp-muted-2)">{business.address}</span>
              </span>
            </a>
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 z-10 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-(--sp-blue) shadow-[0_4px_12px_rgba(60,120,207,0.12)] transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-(--sp-pink) focus-visible:outline-none sm:top-auto sm:bottom-5 sm:right-5"
            >
              Open in Google Maps ↗
            </a>
            <div className="relative z-10 flex w-full flex-col gap-5 rounded-[28px] bg-white p-6 shadow-[0_12px_32px_rgba(60,120,207,0.14)] sm:w-[380px]">
              <div className="flex flex-col items-start gap-2">
                <p className="font-(family-name:--font-fredoka) text-[26px] font-bold text-(--sp-ink)">{business.name}</p>
                <span className="flex items-center gap-1.5 rounded-full bg-(--sp-mint) px-2.5 py-[5px] text-[12px] font-medium text-(--sp-green)">
                  <span className="size-1.5 rounded-full bg-(--sp-green-dot)" />
                  {content.openNote}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <InfoRow icon="icon-clock.svg" label={visit.todayLabel} value={visit.todayHours} />
                <InfoRow icon="icon-pin.svg" label="Find us" value={street} href={mapsHref} external />
                <InfoRow icon="icon-phone.svg" label="Call" value={business.phone} href={telHref(business.phone)} />
              </div>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-full bg-(--sp-pink) px-[22px] py-3 text-[15px] font-semibold text-white transition-colors hover:bg-(--sp-pink-dark) focus-visible:ring-2 focus-visible:ring-(--sp-ink) focus-visible:outline-none"
              >
                Get directions ↗
              </a>
            </div>
          </div>
          <SweetPastelContact
            email={business.email}
            title={visit.formTitle}
            intro={visit.formIntro}
            topics={visit.topics}
            replyNote={visit.replyNote}
          />
        </div>
      </section>

      <footer className="flex flex-col items-center gap-5 rounded-t-[40px] bg-(--sp-pink-soft) px-5 pt-14 pb-10 text-center md:rounded-t-[56px] md:px-12 xl:px-24">
        <a href="#home" className="font-(family-name:--font-fredoka) text-[28px] font-bold text-(--sp-ink)">
          ✧ {business.name}
        </a>
        <div className="flex flex-wrap justify-center gap-2.5">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-[18px] py-2.5 text-[14px] font-medium text-(--sp-ink) transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-(--sp-pink) focus-visible:outline-none"
            >
              {s.label} ↗
            </a>
          ))}
        </div>
        <p className="text-[15px] text-(--sp-muted-2)">
          <a href={`mailto:${business.email}`} className="hover:text-(--sp-pink)">
            {business.email}
          </a>
          {" · "}
          <a href={telHref(business.phone)} className="hover:text-(--sp-pink)">
            {business.phone}
          </a>
          {" · "}
          <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="hover:text-(--sp-pink)">
            {street}
          </a>
        </p>
        <p className="text-[15px] text-(--sp-muted-2)">{content.hoursSummary}</p>
        <p className="text-[13px] text-(--sp-muted-2)">Made with WebBlock</p>
      </footer>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--sp-cream)">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/mock/template-sites/sweet-pastel/${icon}`} alt="" width={22} height={22} />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium tracking-[0.08em] text-(--sp-muted-2) uppercase">{label}</span>
        <span className="font-(family-name:--font-fredoka) text-[18px] font-semibold text-(--sp-ink)">{value}</span>
      </span>
    </>
  );
  const cls = "flex items-center gap-4";
  if (!href) return <div className={cls}>{inner}</div>;
  return (
    <a
      href={href}
      className={`${cls} rounded-2xl transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-(--sp-pink) focus-visible:outline-none`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {inner}
    </a>
  );
}
