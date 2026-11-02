"use client";

// Sweet pastel (Figma "Template site · Sweet pastel", demo "Sugar & Crumb").
// Cream page, pink hero with a scalloped edge, rounded pastel cards, Fredoka headings and
// Caveat script labels. Colours, fonts and radii come only from the `site-*` theme tokens.

import type { ReactNode } from "react";
import { ArrowLeft2, ArrowRight2, Call, Clock, Location, Routing, SearchNormal1, Send2, Sms } from "iconsax-reactjs";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  AboutProps,
  AllProductsProps,
  CtaAction,
  FooterProps,
  HeroProps,
  Product,
  ProductCardsProps,
  TextProps,
  VisitUsProps,
} from "../../../types";
import { ContactDialog } from "../contact-dialog";
import { ALIGN_CLASS, DESKTOP_COLUMNS_CLASS, JUSTIFY_CLASS, spacingStyle, useSite } from "../site-context";
import { SiteImage } from "../site-image";
import {
  ctaHref,
  directionsHref,
  EXTERNAL_LINK,
  linkProps,
  mailtoHref,
  SECTION_ID,
  socialLinks,
  telegramHref,
  telHref,
} from "../site-links";
import { SiteMap } from "../site-map";
import { useProductBrowser } from "../use-product-browser";
import type { BlockRenderProps, TemplateDesign } from "./types";
import { SiteLogo } from "../site-logo";

/* ------------------------------------------------------------------ shared pieces */

/** Content column: 1280 container → 1152 content with 64px gutters (Figma 1728 → 1536 with 96px). */
const WRAP = "mx-auto w-full max-w-[1280px] px-4 @3xl:px-10 @5xl:px-16";

/** Pastel rotation used by cards, chips and stickers (butter, mint, lilac, pink). */
const TINTS = ["bg-site-tint-1", "bg-site-tint-2", "bg-site-tint-3", "bg-site-tint-4"] as const;
const tint = (index: number) => TINTS[index % TINTS.length];

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";

const BUTTON_BASE = cn(
  "inline-flex max-w-full items-center justify-center gap-2 rounded-site-button text-center font-site-body font-semibold transition-transform hover:-translate-y-px",
  "px-5 py-3 text-[14px] @3xl:px-6 @3xl:text-[15px] @5xl:px-[26px] @5xl:py-[14px] @5xl:text-[16px]",
  FOCUS,
);
const BUTTON_PRIMARY = cn(BUTTON_BASE, "bg-site-accent text-site-accent-fg");
const BUTTON_OUTLINE = cn(BUTTON_BASE, "border-2 border-site-ink text-site-ink hover:bg-site-ink/5");

function CtaLink({ label, action, variant }: { label: string; action: CtaAction; variant: "primary" | "outline" }) {
  const site = useSite();
  return (
    <a {...linkProps(ctaHref(action, site))} className={variant === "primary" ? BUTTON_PRIMARY : BUTTON_OUTLINE}>
      {label}
    </a>
  );
}

/** Caveat script label above headings ("popular this week"). */
function Eyebrow({ children, className }: { children: string; className?: string }) {
  if (!children) return null;
  return <p className={cn("font-site-display font-bold text-site-accent", className)}>{children}</p>;
}

function SectionHeader({
  eyebrow,
  heading,
  className,
}: {
  eyebrow: string;
  heading: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Eyebrow className="text-[22px] @3xl:text-[24px] @5xl:text-[28px]">{eyebrow}</Eyebrow>
      <h2 className="font-site-heading text-[28px] leading-tight font-bold tracking-[-0.01em] text-balance text-site-ink @3xl:text-[40px] @5xl:text-[46px]">
        {heading}
      </h2>
    </div>
  );
}

function PricePill({ price, className }: { price: string; className?: string }) {
  const site = useSite();
  return (
    <span className={cn("shrink-0 rounded-full bg-site-surface font-site-body font-bold text-site-accent", className)}>
      {formatPrice(price, site.currency)}
    </span>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-site-card bg-site-surface px-6 py-10 text-center font-site-body text-[15px] text-site-muted">
      {children}
    </p>
  );
}

/** The cream scallop strip along the bottom of the pink hero. */
function ScallopEdge() {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-x-0 bottom-0 bg-repeat-x",
        "bg-[radial-gradient(circle_farthest-side_at_50%_100%,var(--site-bg)_97%,transparent_100%)]",
        "h-6 bg-size-[48px_24px] bg-position-[24px_0] @3xl:h-8 @3xl:bg-size-[64px_32px] @3xl:bg-position-[32px_0] @5xl:h-10 @5xl:bg-size-[80px_40px] @5xl:bg-position-[40px_0]",
      )}
    />
  );
}

/* ------------------------------------------------------------------ Header */

function Header() {
  const site = useSite();
  const nav = [
    { label: "Home", href: `#${SECTION_ID.top}` },
    { label: "Shop", href: `#${SECTION_ID.shop}` },
    { label: "Visit us", href: `#${SECTION_ID.visit}` },
  ];
  return (
    <header id={SECTION_ID.top} className="border-b border-site-border bg-site-bg">
      <div className={cn(WRAP, "flex items-center justify-between gap-4 py-[18px] @5xl:py-[22px]")}>
        <a href={`#${SECTION_ID.top}`} className={cn("min-w-0 font-site-heading text-[17px] font-bold text-site-ink @3xl:text-[18px] @5xl:text-[22px]", FOCUS)}>
          <SiteLogo fallback={<span aria-hidden>✧ </span>} className="mr-[0.35em] size-[1.4em] align-[-0.4em]" />
          <span className="truncate">{site.businessName}</span>
        </a>
        <div className="flex shrink-0 items-center gap-6">
          <nav aria-label="Main" className="hidden items-center gap-6 @3xl:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn("font-site-body text-[14px] text-site-subtle transition-colors hover:text-site-ink @5xl:text-[15px]", FOCUS)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          {site.statusText && (
            <span className="hidden items-center gap-2 rounded-full bg-site-success-soft py-1.5 pr-3.5 pl-3 font-site-body text-[13px] font-medium text-site-success @3xl:inline-flex">
              <span aria-hidden className="size-2 rounded-full bg-site-success" />
              {site.statusText}
            </span>
          )}
          <ContactDialog
            trigger={(open) => (
              <button
                type="button"
                onClick={open}
                className={cn(
                  "rounded-site-button bg-site-accent font-site-body font-semibold text-site-accent-fg transition-transform hover:-translate-y-px",
                  "px-3.5 py-2 text-[13px] @3xl:px-[18px] @3xl:py-2.5 @3xl:text-[14px] @5xl:h-11 @5xl:px-8 @5xl:text-[15px]",
                  FOCUS,
                )}
              >
                Contact
              </button>
            )}
          />
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ Hero */

const STICKER_STYLE = ["-rotate-8", "rotate-6", "-rotate-4"] as const;

function Sticker({ text, index, className }: { text: string; index: number; className?: string }) {
  return (
    <span
      className={cn(
        "absolute z-10 rounded-full px-3.5 py-1.5 font-site-display text-[20px] font-bold whitespace-nowrap text-site-ink shadow-md @3xl:text-[22px] @5xl:px-[18px] @5xl:py-2 @5xl:text-[26px]",
        tint(index),
        STICKER_STYLE[index % STICKER_STYLE.length],
        className,
      )}
    >
      {text}
    </span>
  );
}

function CirclePhoto({ src, alt, sizes, className, priority }: { src: string | null; alt: string; sizes: string; className: string; priority?: boolean }) {
  return (
    <div className={cn("relative aspect-square shrink-0 overflow-hidden rounded-full", className)}>
      <SiteImage src={src} alt={alt} sizes={sizes} priority={priority} />
    </div>
  );
}

function Hero(props: BlockRenderProps<HeroProps>) {
  const left = props.sideImages[0];
  const right = props.sideImages[1];
  const [first, second, third] = props.highlights.filter((h) => h.text);
  return (
    <section style={spacingStyle(props.spacing)} className="relative overflow-hidden bg-site-alt">
      <div
        className={cn(
          WRAP,
          "flex flex-col items-center gap-6 pt-[calc(36px*var(--site-space))] pb-[calc(56px*var(--site-space))] @3xl:gap-8 @3xl:pt-[calc(48px*var(--site-space))] @3xl:pb-[calc(72px*var(--site-space))] @5xl:pt-[calc(64px*var(--site-space))] @5xl:pb-[calc(88px*var(--site-space))]",
        )}
      >
        <div className={cn("flex w-full flex-col gap-4 @5xl:gap-[18px]", ALIGN_CLASS[props.align])}>
          <Eyebrow className="text-[24px] @3xl:text-[26px] @5xl:text-[30px]">{props.eyebrow}</Eyebrow>
          <h1 className="max-w-[16ch] font-site-heading text-[44px] leading-none font-bold tracking-[-0.02em] whitespace-pre-line text-site-ink @3xl:text-[60px] @5xl:text-[72px]">
            {props.heading}
          </h1>
          {props.description && (
            <p className="max-w-[320px] font-site-body text-[15px] leading-[1.5] text-site-muted @3xl:max-w-[480px] @3xl:text-[16px] @5xl:max-w-[540px] @5xl:text-[18px]">
              {props.description}
            </p>
          )}
          <div className={cn("flex w-full flex-wrap gap-2.5 pt-2 @5xl:gap-3", JUSTIFY_CLASS[props.align])}>
            {props.primaryLabel && <CtaLink label={props.primaryLabel} action={props.primaryAction} variant="primary" />}
            {props.secondaryLabel && <CtaLink label={props.secondaryLabel} action={props.secondaryAction} variant="outline" />}
          </div>
        </div>

        <div className="relative flex items-end justify-center gap-4 pt-3 @3xl:gap-6 @5xl:gap-7">
          {left && (
            <CirclePhoto
              src={left.imageUrl}
              alt=""
              sizes="(min-width: 1024px) 180px, 150px"
              className="mb-10 w-[110px] @3xl:mb-[60px] @3xl:w-[150px] @5xl:mb-[72px] @5xl:w-[180px]"
            />
          )}
          <div className="relative">
            <CirclePhoto
              src={props.imageUrl}
              alt={props.heading.replace(/\s+/g, " ")}
              sizes="(min-width: 1024px) 330px, (min-width: 768px) 300px, 220px"
              className="w-[220px] @3xl:w-[300px] @5xl:w-[330px]"
              priority
            />
            {first && <Sticker text={first.text} index={0} className="-top-3 -right-3 @3xl:-top-2 @3xl:right-auto @3xl:-left-6" />}
          </div>
          {right && (
            <div className="relative mb-6 hidden @3xl:block">
              <CirclePhoto src={right.imageUrl} alt="" sizes="(min-width: 1024px) 230px, 190px" className="w-[190px] @5xl:w-[230px]" />
              {second && <Sticker text={second.text} index={1} className="bottom-6 -left-16" />}
            </div>
          )}
          {left && third && <Sticker text={third.text} index={2} className="hidden @5xl:inline-block @5xl:top-auto @5xl:bottom-[45%] @5xl:left-[18%]" />}
        </div>
      </div>
      <ScallopEdge />
    </section>
  );
}

/* ------------------------------------------------------------------ Product cards (popular) */

function staggered(index: number, columns: ProductCardsProps["columns"]) {
  return columns === "3" ? index % 3 === 1 : index % 2 === 1;
}

function PopularCard({ product, index, stagger }: { product: Product; index: number; stagger: boolean }) {
  return (
    <article
      className={cn(
        "flex w-[240px] shrink-0 snap-start flex-col items-center gap-2.5 rounded-site-card p-5 text-center @3xl:w-auto @3xl:gap-3 @5xl:gap-4 @5xl:rounded-[calc(var(--site-radius-card)*1.5)] @5xl:p-7",
        tint(index),
        stagger && "@3xl:mt-9 @5xl:mt-12",
      )}
    >
      <div className="relative aspect-square w-[160px] overflow-hidden rounded-full @3xl:w-[78%] @5xl:w-[72%]">
        <SiteImage src={product.imageUrl} alt={product.name} sizes="(min-width: 1024px) 260px, 170px" />
      </div>
      <h3 className="font-site-heading text-[17px] leading-snug font-semibold text-site-ink @3xl:text-[18px] @5xl:text-[23px]">
        {product.name}
      </h3>
      {product.description && (
        <p className="font-site-body text-[13px] text-site-muted @5xl:text-[15px]">{product.description}</p>
      )}
      <PricePill price={product.price} className="px-3 py-1.5 text-[14px] @5xl:px-4 @5xl:py-2 @5xl:text-[16px]" />
    </article>
  );
}

function ProductCards(props: BlockRenderProps<ProductCardsProps>) {
  return (
    <section
      style={spacingStyle(props.spacing)}
      className="py-[calc(48px*var(--site-space))] @3xl:py-[calc(64px*var(--site-space))] @5xl:py-[calc(88px*var(--site-space))]"
    >
      <div className={cn(WRAP, "flex flex-col gap-6 @3xl:gap-8 @5xl:gap-10")}>
        <SectionHeader eyebrow={props.eyebrow} heading={props.heading} className={ALIGN_CLASS[props.align]} />
        {props.products.length === 0 ? (
          <EmptyNote>No favourites to show yet. Add products to this section.</EmptyNote>
        ) : (
          <div
            className={cn(
              "-mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 @3xl:mx-0 @3xl:grid @3xl:items-start @3xl:gap-5 @3xl:overflow-visible @3xl:px-0 @3xl:pb-0 @5xl:gap-6",
              "@3xl:grid-cols-3",
              DESKTOP_COLUMNS_CLASS[props.columns],
            )}
          >
            {props.products.map((product, index) => (
              <PopularCard
                key={`${product.name}-${index}`}
                product={product}
                index={index}
                stagger={staggered(index, props.columns)}
              />
            ))}
          </div>
        )}
        {props.viewAllLabel && (
          <div className={cn("flex", JUSTIFY_CLASS[props.align])}>
            <a href={`#${SECTION_ID.shop}`} className={BUTTON_OUTLINE}>
              {props.viewAllLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ All products */

function GridCard({ product, index }: { product: Product; index: number }) {
  return (
    <article
      className={cn(
        "flex flex-col gap-2.5 rounded-site-card px-3 pt-3 pb-4 @3xl:px-3.5 @3xl:pt-3.5 @5xl:gap-3 @5xl:px-4 @5xl:pt-4 @5xl:pb-5",
        tint(index),
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-site-image">
        <SiteImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(min-width: 1024px) 260px, (min-width: 768px) 30vw, 45vw"
        />
      </div>
      <div className="flex items-start justify-between gap-2 px-1">
        <h3 className="min-w-0 font-site-heading text-[13px] leading-snug font-semibold text-site-ink @3xl:text-[15px] @5xl:text-[19px]">
          {product.name}
        </h3>
        <PricePill price={product.price} className="px-2.5 py-1 text-[12px] @3xl:text-[13px] @5xl:px-3 @5xl:py-1.5 @5xl:text-[14px]" />
      </div>
      {product.description && (
        <p className="px-1 font-site-body text-[11px] text-site-muted @3xl:text-[12px] @5xl:text-[14px]">{product.description}</p>
      )}
    </article>
  );
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  const circle = cn(
    "flex size-10 items-center justify-center rounded-full font-site-body text-[14px] font-medium transition-colors @5xl:size-11 @5xl:text-[15px]",
    FOCUS,
  );
  const idle = "border border-site-border bg-site-bg text-site-ink hover:bg-site-surface disabled:opacity-40";
  return (
    <nav aria-label="Product pages" className="flex flex-wrap justify-center gap-2 @5xl:gap-2.5">
      <button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => onPage(page - 1)} className={cn(circle, idle)}>
        <ArrowLeft2 variant="Outline" aria-hidden className="size-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Page ${i + 1}`}
          aria-current={i === page ? "page" : undefined}
          onClick={() => onPage(i)}
          className={cn(circle, i === page ? "bg-site-accent text-site-accent-fg" : idle)}
        >
          {i + 1}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages - 1}
        onClick={() => onPage(page + 1)}
        className={cn(circle, idle)}
      >
        <ArrowRight2 variant="Outline" aria-hidden className="size-4" />
      </button>
    </nav>
  );
}

function AllProducts(props: BlockRenderProps<AllProductsProps>) {
  const browser = useProductBrowser(props.products, props.categories, props.pageSize);
  const searchId = `${props.id}-search`;
  return (
    <section
      id={SECTION_ID.shop}
      style={spacingStyle(props.spacing)}
      className="scroll-mt-4 py-[calc(24px*var(--site-space))] @5xl:py-[calc(40px*var(--site-space))]"
    >
      <div className={WRAP}>
        <div className="flex flex-col gap-[18px] rounded-site-card bg-site-surface px-5 py-7 @3xl:gap-6 @3xl:rounded-[calc(var(--site-radius-card)*1.25)] @3xl:px-8 @3xl:py-10 @5xl:gap-8 @5xl:rounded-[calc(var(--site-radius-card)*1.75)] @5xl:p-14">
          <div className="flex flex-col gap-[18px] @3xl:flex-row @3xl:items-end @3xl:justify-between @3xl:gap-8">
            <SectionHeader eyebrow={props.eyebrow} heading={props.heading} className={cn("min-w-0 flex-1", ALIGN_CLASS[props.align])} />
            <div className="relative w-full @3xl:w-[260px] @5xl:w-[340px]">
              <label htmlFor={searchId} className="sr-only">
                Search products
              </label>
              <SearchNormal1 variant="Outline" aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-site-subtle @5xl:left-5" />
              <input
                id={searchId}
                type="search"
                value={browser.query}
                onChange={(e) => browser.setQuery(e.target.value)}
                placeholder={props.searchPlaceholder}
                className="w-full rounded-full border border-site-border bg-site-bg py-3 pr-4 pl-11 font-site-body text-[14px] text-site-ink placeholder:text-site-muted focus-visible:outline-2 focus-visible:outline-site-accent @5xl:pl-12 @5xl:text-[15px]"
              />
            </div>
          </div>

          {browser.chips.length > 1 && (
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 @3xl:mx-0 @3xl:flex-wrap @3xl:overflow-visible @3xl:px-0 @5xl:gap-2.5">
              {browser.chips.map((chip, i) => {
                const active = chip === browser.category;
                return (
                  <button
                    key={chip}
                    type="button"
                    aria-pressed={active}
                    onClick={() => browser.setCategory(chip)}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-2 font-site-body text-[13px] font-medium whitespace-nowrap transition-transform hover:-translate-y-px @3xl:px-4 @3xl:text-[14px] @5xl:px-[18px] @5xl:py-2.5 @5xl:text-[15px]",
                      active ? "bg-site-accent text-site-accent-fg" : cn(tint(Math.max(0, i - 1)), "text-site-ink"),
                      FOCUS,
                    )}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          )}

          {props.products.length === 0 ? (
            <EmptyNote>No products yet. Add your first product to show it here.</EmptyNote>
          ) : browser.total === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-site-card bg-site-bg px-6 py-10 text-center font-site-body">
              <p className="text-[15px] text-site-muted">
                {browser.query ? `Nothing matches “${browser.query.trim()}”.` : "Nothing in this category yet."}
              </p>
              <button
                type="button"
                onClick={() => {
                  browser.setQuery("");
                  browser.setCategory("All");
                }}
                className={cn("text-[14px] font-semibold text-site-accent hover:underline", FOCUS)}
              >
                Show all products
              </button>
            </div>
          ) : (
            <div className={cn("grid grid-cols-2 gap-3 @3xl:grid-cols-3 @3xl:gap-5 @5xl:gap-6", DESKTOP_COLUMNS_CLASS[props.columns])}>
              {browser.items.map((product, index) => (
                <GridCard key={`${product.name}-${index}`} product={product} index={index} />
              ))}
            </div>
          )}

          {browser.total > 0 && (
            <div className="flex flex-col items-center gap-2.5 @5xl:gap-3.5">
              {browser.totalPages > 1 && <Pagination page={browser.page} totalPages={browser.totalPages} onPage={browser.setPage} />}
              <p className="font-site-body text-[13px] text-site-muted @5xl:text-[14px]">
                Showing {browser.items.length} of {browser.total} items
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ About */

/** Stat circles follow Figma: butter, mint, pink. */
const STAT_TINTS = ["bg-site-tint-1", "bg-site-tint-2", "bg-site-tint-4"] as const;

function About(props: BlockRenderProps<AboutProps>) {
  const stats = props.stats.filter((s) => s.value || s.label);
  return (
    <section
      style={spacingStyle(props.spacing)}
      className="py-[calc(40px*var(--site-space))] @3xl:py-[calc(56px*var(--site-space))] @5xl:py-[calc(72px*var(--site-space))]"
    >
      <div className={cn(WRAP, "flex flex-col gap-4 @3xl:flex-row @3xl:items-center @3xl:gap-9 @5xl:gap-16")}>
        <div className="relative aspect-[358/260] w-full shrink-0 overflow-hidden rounded-t-full rounded-b-[28px] @3xl:aspect-[320/380] @3xl:w-[320px] @5xl:aspect-[600/560] @5xl:w-[480px] @5xl:rounded-b-[36px]">
          <SiteImage src={props.imageUrl} alt={props.heading} sizes="(min-width: 1024px) 480px, (min-width: 768px) 320px, 100vw" />
        </div>
        <div className={cn("flex min-w-0 flex-1 flex-col gap-4 @5xl:gap-5", ALIGN_CLASS[props.align])}>
          <Eyebrow className="text-[22px] @5xl:text-[28px]">{props.eyebrow}</Eyebrow>
          <h2 className="font-site-heading text-[30px] leading-tight font-bold tracking-[-0.01em] text-site-ink @3xl:text-[34px] @5xl:text-[44px]">
            {props.heading}
          </h2>
          {props.body && (
            <p className="font-site-body text-[15px] leading-[1.55] whitespace-pre-line text-site-muted @3xl:text-[16px] @5xl:text-[18px] @5xl:leading-[1.6]">
              {props.body}
            </p>
          )}
          {stats.length > 0 && (
            <ul className="flex flex-wrap gap-2.5 pt-1 @5xl:gap-4">
              {stats.map((stat, i) => (
                <li
                  key={`${stat.value}-${i}`}
                  className={cn(
                    "flex size-[104px] flex-col items-center justify-center gap-0.5 rounded-full text-center @5xl:size-[136px]",
                    STAT_TINTS[i % STAT_TINTS.length],
                  )}
                >
                  <span className="font-site-heading text-[20px] font-bold text-site-ink @5xl:text-[28px]">{stat.value}</span>
                  <span className="px-2 font-site-body text-[11px] leading-tight text-site-muted @5xl:text-[13px]">{stat.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Visit us */

function InfoRows({ circleClass }: { circleClass: string }) {
  const site = useSite();
  const phone = site.phones[0]?.number;
  const rows = [
    site.hours && { icon: Clock, label: "Open today", value: site.hours },
    site.address && { icon: Location, label: "Find us", value: site.address, href: directionsHref(site.address) },
    phone && { icon: Call, label: "Call", value: phone, href: telHref(phone) },
  ].filter((row): row is { icon: typeof Clock; label: string; value: string; href?: string } => Boolean(row));

  if (rows.length === 0) return null;
  return (
    <ul className="flex flex-col gap-3.5 @5xl:gap-4">
      {rows.map((row) => {
        const content = (
          <>
            <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full text-site-ink", circleClass)}>
              <row.icon variant="Outline" aria-hidden className="size-[18px] @5xl:size-[22px]" />
            </span>
            <span className="min-w-0">
              <span className="block font-site-body text-[11px] font-medium tracking-[0.08em] text-site-muted uppercase @5xl:text-[13px]">
                {row.label}
              </span>
              <span className="block font-site-heading text-[17px] font-semibold text-site-ink @5xl:text-[18px]">{row.value}</span>
            </span>
          </>
        );
        return (
          <li key={row.label}>
            {row.href ? (
              <a {...linkProps(row.href)} className={cn("flex items-center gap-3 rounded-site-card @5xl:gap-4", FOCUS)}>
                {content}
              </a>
            ) : (
              <div className="flex items-center gap-3 @5xl:gap-4">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Replaces the Figma contact form (websites never post forms): same card, direct contact buttons. */
function GetInTouchPanel() {
  const site = useSite();
  const phone = site.phones[0]?.number;
  const actions = [
    phone && { icon: Call, label: "Call us", detail: phone, href: telHref(phone) },
    site.email && { icon: Sms, label: "Email us", detail: site.email, href: mailtoHref(site.email) },
    site.telegram && { icon: Send2, label: "Message on Telegram", detail: `@${site.telegram}`, href: telegramHref(site.telegram) },
    site.address && { icon: Routing, label: "Get directions", detail: site.address, href: directionsHref(site.address) },
  ].filter((a): a is { icon: typeof Call; label: string; detail: string; href: string } => Boolean(a));

  return (
    <div className="flex flex-col gap-4 rounded-site-card bg-site-surface p-6 @5xl:w-[384px] @5xl:shrink-0 @5xl:gap-5 @5xl:p-8">
      <div className="flex flex-col gap-2">
        <h3 className="font-site-heading text-[24px] font-bold text-site-ink @5xl:text-[28px]">Get in touch</h3>
        <p className="font-site-body text-[14px] text-site-muted @5xl:text-[15px]">
          Questions, special requests or just a quick hello. Pick whatever is easiest for you.
        </p>
      </div>
      <ul className="flex flex-col gap-2.5">
        {actions.map((action, i) => (
          <li key={action.label}>
            <a
              {...linkProps(action.href)}
              className={cn(
                "flex items-center gap-3 rounded-site-button px-4 py-3 transition-transform hover:-translate-y-px @5xl:px-5 @5xl:py-3.5",
                i === 0 ? "bg-site-accent text-site-accent-fg" : cn(tint(i - 1), "text-site-ink"),
                FOCUS,
              )}
            >
              <action.icon variant="Outline" aria-hidden className="size-5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block font-site-body text-[15px] font-semibold @5xl:text-[16px]">{action.label}</span>
                <span className={cn("block truncate font-site-body text-[12px]", i === 0 ? "text-site-accent-fg/85" : "text-site-muted")}>
                  {action.detail}
                </span>
              </span>
              <ArrowRight2 variant="Outline" aria-hidden className="size-4 shrink-0" />
            </a>
          </li>
        ))}
      </ul>
      <p className="text-center font-site-body text-[13px] text-site-muted">We usually reply within a day.</p>
    </div>
  );
}

function VisitUs(props: BlockRenderProps<VisitUsProps>) {
  const site = useSite();
  return (
    <section
      id={SECTION_ID.visit}
      style={spacingStyle(props.spacing)}
      className="scroll-mt-4 py-[calc(40px*var(--site-space))] @3xl:py-[calc(56px*var(--site-space))] @5xl:py-[calc(72px*var(--site-space))]"
    >
      <div className={cn(WRAP, "flex flex-col gap-5 @3xl:gap-6 @5xl:gap-8")}>
        <SectionHeader eyebrow={props.eyebrow} heading={props.heading} className={ALIGN_CLASS[props.align]} />
        <div className="flex flex-col gap-5 rounded-site-card bg-site-tint-3 p-5 @3xl:gap-7 @3xl:rounded-[calc(var(--site-radius-card)*1.25)] @3xl:p-7 @5xl:flex-row @5xl:items-stretch @5xl:gap-8 @5xl:rounded-[calc(var(--site-radius-card)*1.75)] @5xl:p-8">
          {/* Mobile + tablet: info rows on the lilac panel next to/above the map (Figma tablet/mobile). */}
          <div className="flex flex-col gap-5 @3xl:grid @3xl:grid-cols-[240px_1fr] @3xl:items-center @3xl:gap-7 @5xl:hidden">
            <InfoRows circleClass="bg-site-surface" />
            <SiteMap className="h-[200px] rounded-site-image @3xl:h-[300px]" />
          </div>
          {/* Desktop: map with the white visit card overlaid bottom-left. */}
          <SiteMap pin="end" className="hidden min-h-[540px] flex-1 rounded-site-card @5xl:block">
            <div className="absolute bottom-5 left-5 z-10 flex w-[320px] flex-col gap-5 rounded-site-image bg-site-surface p-6 shadow-xl">
              <div className="flex flex-col items-start gap-2">
                <p className="font-site-heading text-[24px] font-bold text-site-ink">{site.businessName}</p>
                {site.statusText && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-site-success-soft px-2.5 py-1 font-site-body text-[12px] font-medium text-site-success">
                    <span aria-hidden className="size-1.5 rounded-full bg-site-success" />
                    {site.statusText}
                  </span>
                )}
              </div>
              <InfoRows circleClass="bg-site-bg" />
              {site.address && (
                <a
                  href={directionsHref(site.address)}
                  {...EXTERNAL_LINK}
                  className={cn(BUTTON_PRIMARY, "w-full py-3 @5xl:py-3 @5xl:text-[15px]")}
                >
                  Get directions ↗
                </a>
              )}
            </div>
          </SiteMap>
          <GetInTouchPanel />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Footer */

function Footer(props: BlockRenderProps<FooterProps>) {
  const site = useSite();
  const links = socialLinks(site);
  const phones = site.phones.map((p) => p.number).filter(Boolean);
  return (
    <footer
      style={spacingStyle(props.spacing)}
      className="rounded-t-[calc(var(--site-radius-card)*1)] bg-site-alt pt-[calc(36px*var(--site-space))] pb-[calc(28px*var(--site-space))] @3xl:rounded-t-[calc(var(--site-radius-card)*1.25)] @3xl:pt-[calc(44px*var(--site-space))] @3xl:pb-[calc(32px*var(--site-space))] @5xl:rounded-t-[calc(var(--site-radius-card)*1.75)] @5xl:pt-[calc(56px*var(--site-space))] @5xl:pb-[calc(40px*var(--site-space))]"
    >
      <div className={cn(WRAP, "flex flex-col gap-3.5 @5xl:gap-5", ALIGN_CLASS[props.align])}>
        <p className="font-site-heading text-[20px] font-bold text-site-ink @3xl:text-[22px] @5xl:text-[28px]">
          <SiteLogo fallback={<span aria-hidden>✧ </span>} className="mr-[0.35em] size-[1.4em] align-[-0.4em]" />
          {site.businessName}
        </p>
        {props.tagline && <p className="font-site-display text-[20px] font-bold text-site-accent @5xl:text-[24px]">{props.tagline}</p>}
        {links.length > 0 && (
          <ul className={cn("flex flex-wrap gap-2 @5xl:gap-2.5", JUSTIFY_CLASS[props.align])}>
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  {...EXTERNAL_LINK}
                  className={cn(
                    "inline-block rounded-site-button bg-site-surface px-3.5 py-2 font-site-body text-[12px] font-medium text-site-ink transition-transform hover:-translate-y-px @3xl:text-[13px] @5xl:px-[18px] @5xl:py-2.5 @5xl:text-[14px]",
                    FOCUS,
                  )}
                >
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="font-site-body text-[13px] leading-relaxed text-site-muted @5xl:text-[15px]">
          {[
            site.email && (
              <a key="email" href={mailtoHref(site.email)} className={cn("hover:text-site-ink", FOCUS)}>
                {site.email}
              </a>
            ),
            ...phones.map((phone) => (
              <a key={phone} href={telHref(phone)} className={cn("hover:text-site-ink", FOCUS)}>
                {phone}
              </a>
            )),
            site.address && <span key="address">{site.address}</span>,
          ]
            .filter(Boolean)
            .map((item, i) => (
              <span key={i}>
                {i > 0 && " · "}
                {item}
              </span>
            ))}
        </p>
        {site.hoursDetail && <p className="font-site-body text-[13px] text-site-muted @5xl:text-[15px]">{site.hoursDetail}</p>}
        <p className="font-site-body text-[12px] text-site-muted @5xl:text-[13px]">Made with WebBlock</p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ Text (not in Figma) */

function Text(props: BlockRenderProps<TextProps>) {
  return (
    <section
      style={spacingStyle(props.spacing)}
      className="py-[calc(40px*var(--site-space))] @3xl:py-[calc(56px*var(--site-space))] @5xl:py-[calc(72px*var(--site-space))]"
    >
      <div className={WRAP}>
        <div
          className={cn(
            "flex flex-col gap-3 @5xl:gap-4",
            ALIGN_CLASS[props.align],
            props.align === "center" && "mx-auto",
            props.align === "right" && "ml-auto",
            "max-w-[720px]",
          )}
        >
          <Eyebrow className="text-[22px] @5xl:text-[28px]">{props.eyebrow}</Eyebrow>
          <h2 className="font-site-heading text-[28px] leading-tight font-bold tracking-[-0.01em] text-balance text-site-ink @3xl:text-[36px] @5xl:text-[44px]">
            {props.heading}
          </h2>
          {props.body && (
            <p className="font-site-body text-[15px] leading-[1.6] whitespace-pre-line text-site-muted @5xl:text-[18px]">{props.body}</p>
          )}
        </div>
      </div>
    </section>
  );
}

export const sweetPastel: TemplateDesign = { Header, Hero, ProductCards, AllProducts, About, VisitUs, Footer, Text };
