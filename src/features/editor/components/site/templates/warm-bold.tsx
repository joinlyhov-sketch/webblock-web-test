"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeft2, ArrowRight2, Call, Clock, HamburgerMenu, Location, SearchNormal1, Send2, Sms } from "iconsax-reactjs";
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
import { SiteMap } from "../site-map";
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
import { useProductBrowser } from "../use-product-browser";
import type { BlockRenderProps, TemplateDesign } from "./types";
import { SiteLogo } from "../site-logo";

// "Warm & bold" (Kiln Coffee): dark espresso page, one gold accent, Playfair headings,
// DM Mono eyebrows/prices. Figma desktop is 1728 wide; scaled here to a 1280 container.

const WRAP = "mx-auto w-full max-w-[1440px] px-5 @3xl:px-10 @5xl:px-16";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";

const BUTTON_BASE = cn(
  "inline-flex max-w-full items-center justify-center gap-2 rounded-site-button px-5 py-3 text-center text-[14px] font-semibold transition-colors",
  "@3xl:px-[22px] @3xl:text-[15px] @5xl:px-[26px] @5xl:py-[14px] @5xl:text-[16px]",
  FOCUS,
);
const BUTTON_PRIMARY = cn(BUTTON_BASE, "bg-site-accent text-site-accent-fg hover:bg-site-accent/85");
const BUTTON_OUTLINE = cn(BUTTON_BASE, "border-[1.5px] border-site-ink/70 text-site-ink hover:bg-site-ink/10");

/** Two-digit index: 1 → "01". */
const pad = (n: number) => String(n).padStart(2, "0");

// ─── Shared pieces ──────────────────────────────────────────────────────────

function Eyebrow({ children, className }: { children: string; className?: string }) {
  if (!children) return null;
  return (
    <p
      className={cn(
        "font-site-display text-[11px] font-medium tracking-[0.12em] text-site-accent uppercase @5xl:text-[13px]",
        className,
      )}
    >
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: string }) {
  if (!children) return null;
  return (
    <h2 className="font-site-heading text-[32px] leading-[1.15] font-black tracking-[-0.01em] text-site-ink @3xl:text-[40px] @5xl:text-[48px]">
      {children}
    </h2>
  );
}

function SectionHeader({ eyebrow, heading, className }: { eyebrow: string; heading: string; className?: string }) {
  if (!eyebrow && !heading) return null;
  return (
    <div className={cn("flex flex-col gap-2.5 @5xl:gap-3.5", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <SectionTitle>{heading}</SectionTitle>
    </div>
  );
}

function CtaLink({ label, action, variant }: { label: string; action: CtaAction; variant: "primary" | "outline" }) {
  const site = useSite();
  if (!label) return null;
  return (
    <a {...linkProps(ctaHref(action, site))} className={variant === "primary" ? BUTTON_PRIMARY : BUTTON_OUTLINE}>
      {label}
    </a>
  );
}

function StatusPill({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full bg-site-success-soft px-3 py-1.5 text-[12px] font-medium text-site-success @5xl:py-2 @5xl:text-[13px]",
        className,
      )}
    >
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-site-success" />
      <span className="truncate">{text}</span>
    </span>
  );
}

function Hairline({ className }: { className?: string }) {
  return <div aria-hidden className={cn("h-px w-full bg-site-border", className)} />;
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-site-card border border-dashed border-site-border px-6 py-12 text-center text-[15px] text-site-muted">
      {children}
    </p>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home", href: `#${SECTION_ID.top}` },
  { label: "Shop", href: `#${SECTION_ID.shop}` },
  { label: "Visit us", href: `#${SECTION_ID.visit}` },
];

function Brand({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("block min-w-0 truncate font-site-heading font-black text-site-ink", className)}>
      <SiteLogo fallback={<span aria-hidden>◉ </span>} className="mr-[0.35em] size-[1.4em] align-[-0.4em]" />
      {name}
    </span>
  );
}

function ContactButton() {
  return (
    <ContactDialog
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          className={cn(
            "inline-flex items-center justify-center rounded-site-button bg-site-accent px-3.5 py-2 text-[13px] font-semibold text-site-accent-fg transition-colors hover:bg-site-accent/85",
            "@3xl:px-[18px] @3xl:py-2.5 @3xl:text-[14px] @5xl:h-11 @5xl:px-7 @5xl:text-[15px]",
            FOCUS,
          )}
        >
          Contact
        </button>
      )}
    />
  );
}

function Header() {
  const site = useSite();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header id={SECTION_ID.top} className="relative border-site-border bg-site-bg @5xl:border-b">
      <div className={cn(WRAP, "flex items-center justify-between gap-4 py-[18px] @3xl:py-5 @5xl:py-[22px]")}>
        <a href={`#${SECTION_ID.top}`} className={cn("rounded-sm", FOCUS)}>
          <Brand name={site.businessName} className="text-[20px] @3xl:text-[22px]" />
        </a>

        <div className="flex items-center gap-2 @3xl:gap-[22px] @5xl:gap-6">
          <nav aria-label="Main" className="hidden items-center gap-[22px] @3xl:flex @5xl:gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-sm text-[14px] font-medium text-site-ink transition-colors hover:text-site-accent @5xl:text-[15px] @5xl:font-normal @5xl:text-site-muted",
                  FOCUS,
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <StatusPill text={site.statusText} className="hidden @3xl:inline-flex" />
          <ContactButton />
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="warm-bold-mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
            className={cn("rounded-sm p-1 text-site-ink @3xl:hidden", FOCUS)}
          >
            <HamburgerMenu variant="Outline" aria-hidden className="size-6" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="warm-bold-mobile-nav"
          aria-label="Main"
          className="absolute inset-x-0 top-full z-20 border-y border-site-border bg-site-bg px-5 pt-2 pb-4 @3xl:hidden"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn("block py-2.5 text-[15px] font-medium text-site-ink", FOCUS)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <StatusPill text={site.statusText} className="mt-2" />
        </nav>
      )}
    </header>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

/** "SMALL BATCH · 2× WEEKLY" → gold words stacked, then the small cream line. */
function Stamp({ text }: { text: string }) {
  const [main, ...rest] = text.split("·").map((part) => part.trim());
  const sub = rest.join(" · ");
  return (
    <div
      aria-hidden
      className={cn(
        "absolute top-9 right-3 flex size-[110px] rotate-12 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-site-accent text-center",
        "@3xl:top-auto @3xl:right-8 @3xl:bottom-14 @3xl:size-[130px] @3xl:gap-1",
        "@5xl:right-16 @5xl:bottom-16 @5xl:size-[150px]",
        // inner ring (desktop only, like Figma)
        "@5xl:after:absolute @5xl:after:inset-[10px] @5xl:after:rounded-full @5xl:after:border @5xl:after:border-site-accent/50",
      )}
    >
      {main.split(/\s+/).map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="max-w-[80%] font-site-display text-[10px] leading-tight font-medium tracking-[0.14em] break-words text-site-accent uppercase @3xl:text-[12px] @5xl:text-[13px]"
        >
          {word}
        </span>
      ))}
      {sub && (
        <span className="mt-0.5 max-w-[80%] font-site-display text-[8px] tracking-[0.06em] text-site-ink uppercase @3xl:text-[9px] @5xl:text-[11px]">
          {sub}
        </span>
      )}
    </div>
  );
}

function FactsStrip({ items }: { items: HeroProps["highlights"] }) {
  const facts = items.filter((item) => item.text);
  if (facts.length === 0) return null;
  return (
    <div className="bg-site-tint-1">
      <ul
        className={cn(
          WRAP,
          "flex flex-col gap-2.5 py-4 @3xl:flex-row @3xl:items-center @3xl:gap-0 @5xl:py-[22px]",
        )}
      >
        {facts.map((fact, i) => (
          <li
            key={`${fact.text}-${i}`}
            className={cn(
              "flex items-center gap-3 @3xl:flex-1 @3xl:gap-2.5 @5xl:gap-3.5",
              i > 0 && "@3xl:border-l @3xl:border-site-border @3xl:pl-5 @5xl:pl-8",
            )}
          >
            <span className="font-site-display text-[11px] font-medium text-site-accent @5xl:text-[13px]">{pad(i + 1)}</span>
            <span className="text-[13px] text-site-ink/85 @5xl:text-[15px]">{fact.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Hero(props: BlockRenderProps<HeroProps>) {
  const { eyebrow, heading, description, primaryLabel, primaryAction, secondaryLabel, secondaryAction, imageUrl } = props;
  return (
    <section style={spacingStyle(props.spacing)} aria-label={heading || "Welcome"}>
      <div className="relative isolate flex min-h-[560px] flex-col justify-end overflow-hidden @5xl:min-h-[680px]">
        <SiteImage src={imageUrl} alt="" sizes="100vw" priority className="-z-20" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-b from-site-bg/20 via-site-bg/45 to-site-bg/[0.97] @3xl:from-site-bg/15"
        />
        {props.badge && <Stamp text={props.badge} />}

        <div className={cn(WRAP, "pt-[calc(160px*var(--site-space))] pb-[calc(44px*var(--site-space))] @5xl:pb-[calc(72px*var(--site-space))]")}>
          <div className={cn("flex flex-col gap-3.5 @3xl:gap-4 @5xl:gap-[22px]", ALIGN_CLASS[props.align])}>
            <Eyebrow className="@3xl:text-[12px] @5xl:text-[13px]">{eyebrow}</Eyebrow>
            {heading && (
              <h1 className="font-site-heading text-[44px] leading-none font-black tracking-[-0.01em] whitespace-pre-line text-site-ink @3xl:text-[64px] @3xl:leading-[0.96] @3xl:tracking-[-0.02em] @5xl:text-[84px]">
                {heading}
              </h1>
            )}
            {description && (
              <p className="max-w-[340px] text-[15px] leading-[1.5] text-site-ink/85 @3xl:max-w-[440px] @3xl:text-[16px] @5xl:max-w-[520px] @5xl:text-[18px]">
                {description}
              </p>
            )}
            {(primaryLabel || secondaryLabel) && (
              <div className={cn("flex flex-wrap gap-2.5 pt-1 @5xl:gap-3 @5xl:pt-1.5", JUSTIFY_CLASS[props.align])}>
                <CtaLink label={primaryLabel} action={primaryAction} variant="primary" />
                <CtaLink label={secondaryLabel} action={secondaryAction} variant="outline" />
              </div>
            )}
          </div>
        </div>
      </div>
      <FactsStrip items={props.highlights} />
    </section>
  );
}

// ─── Product cards (popular: feature card + list) ──────────────────────────

function ViewAllLink({ label, className }: { label: string; className?: string }) {
  if (!label) return null;
  return (
    <a
      href={`#${SECTION_ID.shop}`}
      className={cn(
        "rounded-sm text-[15px] font-medium text-site-accent underline underline-offset-4 hover:no-underline @5xl:text-[16px]",
        FOCUS,
        className,
      )}
    >
      {label}
    </a>
  );
}

function FeatureCard({ product }: { product: Product }) {
  const site = useSite();
  return (
    <article className="relative isolate aspect-[35/36] overflow-hidden rounded-site-card @3xl:aspect-[10/11] @5xl:aspect-[19/15]">
      <SiteImage src={product.imageUrl} alt={product.name} sizes="(min-width: 1024px) 50vw, (min-width: 768px) 55vw, 100vw" className="-z-20" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-site-tint-1/0 via-site-tint-1/25 to-site-tint-1/[0.92]" />
      <div className="absolute inset-x-5 bottom-6 flex flex-col gap-1.5 @3xl:inset-x-6 @5xl:inset-x-8 @5xl:bottom-8 @5xl:gap-2">
        <p className="font-site-display text-[10px] font-medium tracking-[0.12em] text-site-accent uppercase @5xl:text-[12px]">
          Best seller
        </p>
        <h3 className="font-site-heading text-[26px] leading-tight font-semibold text-site-ink @3xl:text-[28px] @5xl:text-[34px]">
          {product.name}
        </h3>
        {product.description && <p className="text-[14px] text-site-ink/80 @5xl:text-[16px]">{product.description}</p>}
        <p className="font-site-display text-[18px] font-medium text-site-accent @5xl:text-[20px]">
          {formatPrice(product.price, site.currency)}
        </p>
      </div>
    </article>
  );
}

function PopularRow({ product, index }: { product: Product; index: number }) {
  const site = useSite();
  return (
    <article className="flex items-center gap-4 py-[18px] first:pt-0 @3xl:py-6 @5xl:gap-7 @5xl:py-8">
      <div className="relative size-[110px] shrink-0 overflow-hidden rounded-site-image @3xl:size-[130px] @5xl:size-[170px]">
        <SiteImage src={product.imageUrl} alt={product.name} sizes="170px" />
      </div>
      <div className="flex min-w-0 flex-col gap-1 @3xl:gap-1.5 @5xl:gap-2.5">
        <span className="font-site-display text-[10px] font-medium tracking-[0.08em] text-site-accent @3xl:text-[11px] @5xl:text-[13px]">
          {pad(index)}
        </span>
        <h3 className="font-site-heading text-[20px] leading-tight font-semibold text-site-ink @3xl:text-[22px] @5xl:text-[28px]">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-[13px] text-site-muted @5xl:text-[15px]">{product.description}</p>
        )}
        <p className="font-site-display text-[15px] font-medium text-site-accent @3xl:text-[16px] @5xl:text-[18px]">
          {formatPrice(product.price, site.currency)}
        </p>
      </div>
    </article>
  );
}

function ProductCards(props: BlockRenderProps<ProductCardsProps>) {
  const [feature, ...rest] = props.products;
  return (
    <section
      style={spacingStyle(props.spacing)}
      className="pt-[calc(44px*var(--site-space))] pb-[calc(40px*var(--site-space))] @3xl:pt-[calc(56px*var(--site-space))] @3xl:pb-[calc(48px*var(--site-space))] @5xl:pt-[calc(96px*var(--site-space))] @5xl:pb-[calc(88px*var(--site-space))]"
    >
      <div className={cn(WRAP, "flex flex-col gap-6 @3xl:gap-7 @5xl:gap-11")}>
        <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between @3xl:gap-8">
          <SectionHeader eyebrow={props.eyebrow} heading={props.heading} className={cn("flex-1", ALIGN_CLASS[props.align])} />
          <ViewAllLink label={props.viewAllLabel} className="hidden pb-2 @3xl:inline" />
        </div>

        {!feature ? (
          <EmptyNote>No products to show yet. Check back soon.</EmptyNote>
        ) : (
          <div
            className={cn(
              "grid gap-6 @5xl:gap-10",
              rest.length > 0 && "@3xl:grid-cols-[400fr_316fr] @5xl:grid-cols-[760fr_736fr]",
            )}
          >
            <FeatureCard product={feature} />
            {rest.length > 0 && (
              <div className="flex flex-col divide-y divide-site-border">
                {rest.map((product, i) => (
                  <PopularRow key={`${product.name}-${i}`} product={product} index={i + 2} />
                ))}
              </div>
            )}
          </div>
        )}

        <ViewAllLink label={props.viewAllLabel} className={cn("self-start @3xl:hidden", !feature && "hidden")} />
      </div>
    </section>
  );
}

// ─── All products ───────────────────────────────────────────────────────────

function ProductTile({ product }: { product: Product }) {
  const site = useSite();
  return (
    <article className="flex flex-col gap-2.5 @3xl:gap-3 @5xl:gap-3.5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-site-image">
        <SiteImage src={product.imageUrl} alt={product.name} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
      </div>
      <div className="flex items-end gap-2.5 @5xl:gap-3">
        <h3 className="min-w-0 font-site-heading text-[13px] leading-snug font-semibold break-words text-site-ink @3xl:text-[17px] @5xl:text-[20px]">
          {product.name}
        </h3>
        <span aria-hidden className="mb-[5px] min-w-3 flex-1 border-b border-dotted border-site-muted/60" />
        <p className="shrink-0 font-site-display text-[12px] font-medium text-site-accent @3xl:text-[15px] @5xl:text-[16px]">
          {formatPrice(product.price, site.currency)}
        </p>
      </div>
      {product.description && (
        <p className="text-[11px] text-site-muted @3xl:text-[13px] @5xl:text-[14px]">{product.description}</p>
      )}
    </article>
  );
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex w-full items-center gap-2.5 border-b border-site-ink/50 pb-2.5 focus-within:border-site-accent @3xl:w-[240px] @5xl:w-[320px] @5xl:gap-3">
      <span className="sr-only">Search products</span>
      <SearchNormal1 variant="Outline" aria-hidden className="size-[18px] shrink-0 text-site-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 bg-transparent text-[14px] text-site-ink outline-none placeholder:text-site-muted @5xl:text-[15px]"
      />
    </label>
  );
}

function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  const arrow = cn("rounded-sm px-1 text-site-muted transition-colors hover:text-site-ink disabled:opacity-40 disabled:hover:text-site-muted", FOCUS);
  return (
    <nav aria-label="Product pages" className="flex items-center gap-[18px] font-site-display text-[13px] font-medium @3xl:gap-[22px] @5xl:text-[14px]">
      <button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => onPage(page - 1)} className={arrow}>
        <ArrowLeft2 variant="Outline" aria-hidden className="size-3.5" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Page ${i + 1}`}
          aria-current={i === page ? "page" : undefined}
          onClick={() => onPage(i)}
          className={cn(
            "rounded-sm transition-colors",
            i === page ? "text-site-accent underline underline-offset-4" : "text-site-muted hover:text-site-ink",
            FOCUS,
          )}
        >
          {pad(i + 1)}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages - 1}
        onClick={() => onPage(page + 1)}
        className={arrow}
      >
        <ArrowRight2 variant="Outline" aria-hidden className="size-3.5" />
      </button>
    </nav>
  );
}

function AllProducts(props: BlockRenderProps<AllProductsProps>) {
  const browser = useProductBrowser(props.products, props.categories, props.pageSize);
  return (
    <section
      id={SECTION_ID.shop}
      style={spacingStyle(props.spacing)}
      className="scroll-mt-4 pt-[calc(8px*var(--site-space))] pb-[calc(40px*var(--site-space))] @3xl:pb-[calc(56px*var(--site-space))] @5xl:pb-[calc(96px*var(--site-space))]"
    >
      <div className={cn(WRAP, "flex flex-col gap-5 @3xl:gap-6 @5xl:gap-9")}>
        <div className="flex flex-col gap-5 @3xl:flex-row @3xl:items-end @3xl:justify-between @3xl:gap-8">
          <SectionHeader eyebrow={props.eyebrow} heading={props.heading} className={cn("flex-1", ALIGN_CLASS[props.align])} />
          {props.products.length > 0 && (
            <SearchField value={browser.query} onChange={browser.setQuery} placeholder={props.searchPlaceholder} />
          )}
        </div>

        {props.products.length === 0 ? (
          <EmptyNote>No products yet. Check back soon.</EmptyNote>
        ) : (
          <>
            {browser.chips.length > 1 && (
              <div className="relative">
                <Hairline className="absolute inset-x-0 bottom-0" />
                <div role="group" aria-label="Categories" className="relative flex gap-[22px] overflow-x-auto @3xl:gap-7 @5xl:gap-9">
                  {browser.chips.map((chip) => {
                    const active = chip === browser.category;
                    return (
                      <button
                        key={chip}
                        type="button"
                        aria-pressed={active}
                        onClick={() => browser.setCategory(chip)}
                        className={cn(
                          "shrink-0 border-b-2 pb-2 text-[14px] font-medium whitespace-nowrap transition-colors @3xl:pb-2.5 @3xl:text-[15px] @5xl:pb-3 @5xl:text-[16px]",
                          active ? "border-site-accent text-site-ink" : "border-transparent text-site-muted hover:text-site-ink",
                          FOCUS,
                        )}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {browser.items.length === 0 ? (
              <EmptyNote>
                {browser.query ? <>No products match “{browser.query.trim()}”.</> : <>Nothing in this category yet.</>}
              </EmptyNote>
            ) : (
              <div
                className={cn(
                  "grid grid-cols-2 gap-x-3 gap-y-5 @3xl:grid-cols-3 @3xl:gap-x-6 @3xl:gap-y-8 @5xl:gap-x-7 @5xl:gap-y-10",
                  DESKTOP_COLUMNS_CLASS[props.columns],
                )}
              >
                {browser.items.map((product, i) => (
                  <ProductTile key={`${product.name}-${i}`} product={product} />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 @3xl:gap-3.5 @5xl:gap-5">
              <Hairline />
              <div className="flex items-center justify-between gap-4">
                <p aria-live="polite" className="font-site-display text-[11px] tracking-[0.06em] text-site-muted uppercase @5xl:text-[12px] @5xl:tracking-[0.08em]">
                  Showing {browser.items.length} of {browser.total} items
                </p>
                {browser.totalPages > 1 && (
                  <Pager page={browser.page} totalPages={browser.totalPages} onPage={browser.setPage} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ─── About ──────────────────────────────────────────────────────────────────

function About(props: BlockRenderProps<AboutProps>) {
  const { eyebrow, heading, body, caption, imageUrl } = props;
  return (
    <section
      style={spacingStyle(props.spacing)}
      className="bg-site-alt py-[calc(40px*var(--site-space))] @3xl:py-[calc(56px*var(--site-space))] @5xl:py-[calc(96px*var(--site-space))]"
    >
      <div className={cn(WRAP, "flex flex-col gap-7 @3xl:flex-row @3xl:items-center @3xl:gap-10 @5xl:gap-20")}>
        <div className={cn("flex min-w-0 flex-1 flex-col gap-4 @3xl:gap-3.5 @5xl:gap-5", ALIGN_CLASS[props.align])}>
          {heading ? <Eyebrow>{eyebrow}</Eyebrow> : eyebrow && (
            <h2 className="font-site-display text-[11px] font-medium tracking-[0.12em] text-site-accent uppercase @5xl:text-[13px]">
              {eyebrow}
            </h2>
          )}
          {heading && <SectionTitle>{heading}</SectionTitle>}
          {body && (
            <figure className={cn("flex flex-col gap-4 @3xl:gap-3.5 @5xl:gap-5", ALIGN_CLASS[props.align])}>
              <span aria-hidden className="mt-3 block h-[0.45em] font-site-heading text-[96px] leading-[0.6] font-black text-site-accent @3xl:text-[100px] @5xl:text-[120px]">
                “
              </span>
              <blockquote className="font-site-heading text-[24px] leading-[1.35] font-normal text-site-ink italic @3xl:text-[26px] @5xl:text-[34px] @5xl:leading-[1.3]">
                {body}
              </blockquote>
              {caption && (
                <figcaption className={cn("flex items-center gap-3 pt-0 @3xl:pt-2 @5xl:gap-4 @5xl:pt-3", JUSTIFY_CLASS[props.align])}>
                  <span aria-hidden className="h-px w-8 bg-site-accent @3xl:w-9 @5xl:w-12" />
                  <span className="font-site-display text-[11px] tracking-[0.06em] text-site-muted @5xl:text-[13px]">{caption}</span>
                </figcaption>
              )}
            </figure>
          )}
        </div>

        <div className="relative w-full shrink-0 pt-0 pr-6 pb-6 @3xl:w-[320px] @5xl:w-[440px] @5xl:pr-8 @5xl:pb-8">
          <div aria-hidden className="absolute top-6 right-0 bottom-0 left-6 border-2 border-site-accent @5xl:top-8 @5xl:left-8" />
          <div className="relative aspect-[326/316] overflow-hidden @3xl:aspect-[296/376] @5xl:aspect-[13/15]">
            <SiteImage src={imageUrl} alt={heading || eyebrow || "About us"} sizes="(min-width: 1024px) 440px, (min-width: 768px) 320px, 100vw" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Visit us ───────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <li className="flex items-center gap-3.5 py-3.5 first:pt-0 @5xl:gap-[18px] @5xl:py-4">
      <Icon variant="Outline" aria-hidden className="size-5 shrink-0 text-site-ink @5xl:size-6" />
      <div className="flex min-w-0 flex-col gap-1 @5xl:gap-1.5">
        <span className="font-site-display text-[10px] tracking-[0.1em] text-site-muted uppercase @5xl:text-[11px]">{label}</span>
        <span className="font-site-heading text-[18px] leading-snug font-semibold break-words text-site-ink @3xl:text-[19px] @5xl:text-[22px]">
          {value}
        </span>
      </div>
    </li>
  );
}

function ContactRow({ href, icon: Icon, label }: { href: string; icon: typeof Call; label: string }) {
  return (
    <a
      {...linkProps(href)}
      className={cn(
        "flex items-center gap-3 rounded-site-button border border-site-border px-4 py-3 text-[15px] font-medium text-site-ink transition-colors hover:border-site-accent hover:text-site-accent",
        FOCUS,
      )}
    >
      <Icon variant="Outline" aria-hidden className="size-5 shrink-0" />
      <span className="flex-1">{label}</span>
      <span aria-hidden>{href.startsWith("https://") ? "↗" : "→"}</span>
    </a>
  );
}

/** Replaces Figma's "Send us a message" form (websites may not post forms): hours, address, phone + contact links. */
function VisitPanel() {
  const site = useSite();
  const phone = site.phones[0]?.number;
  return (
    <div className="flex flex-col gap-5 rounded-site-card border border-site-border bg-site-bg p-5 @3xl:p-6 @5xl:w-[400px] @5xl:shrink-0 @5xl:gap-[22px] @5xl:p-8">
      <div className="flex flex-col gap-2.5">
        <h3 className="font-site-heading text-[24px] leading-tight font-semibold text-site-ink @5xl:text-[28px]">Get in touch</h3>
        <p className="text-[14px] text-site-muted @5xl:text-[15px]">Call, write or drop by. We usually reply within a day.</p>
        <StatusPill text={site.statusText} className="self-start" />
      </div>

      <div className="flex flex-col gap-5 @3xl:grid @3xl:grid-cols-2 @3xl:gap-8 @5xl:flex @5xl:gap-5">
        <ul className="flex flex-col divide-y divide-site-border">
          {site.hours && <InfoRow icon={Clock} label="Open today" value={site.hours} />}
          {site.address && <InfoRow icon={Location} label="Find us" value={site.address} />}
          {phone && <InfoRow icon={Call} label="Call" value={phone} />}
        </ul>

        <div className="flex flex-col gap-2.5">
          {phone && (
            <a href={telHref(phone)} className={cn(BUTTON_PRIMARY, "w-full")}>
              <Call variant="Outline" aria-hidden className="size-[18px]" />
              Call us
            </a>
          )}
          {site.email && <ContactRow href={mailtoHref(site.email)} icon={Sms} label="Email us" />}
          {site.telegram && <ContactRow href={telegramHref(site.telegram)} icon={Send2} label="Message on Telegram" />}
          {site.address && <ContactRow href={directionsHref(site.address)} icon={Location} label="Get directions" />}
        </div>
      </div>
    </div>
  );
}

function VisitUs(props: BlockRenderProps<VisitUsProps>) {
  return (
    <section
      id={SECTION_ID.visit}
      style={spacingStyle(props.spacing)}
      className="scroll-mt-4 py-[calc(40px*var(--site-space))] @3xl:py-[calc(56px*var(--site-space))] @5xl:py-[calc(96px*var(--site-space))]"
    >
      <div className={cn(WRAP, "flex flex-col gap-5 @3xl:gap-7 @5xl:gap-10")}>
        <SectionHeader eyebrow={props.eyebrow} heading={props.heading} className={cn("w-full", ALIGN_CLASS[props.align])} />
        <div className="flex flex-col gap-5 @3xl:gap-6 @5xl:flex-row @5xl:items-stretch @5xl:gap-8">
          <SiteMap className="h-60 rounded-site-card @3xl:h-[380px] @5xl:h-auto @5xl:min-h-[520px] @5xl:flex-1" />
          <VisitPanel />
        </div>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 @5xl:gap-3">
      <h3 className="font-site-display text-[10px] font-medium tracking-[0.12em] text-site-accent uppercase @5xl:text-[12px]">{title}</h3>
      {children}
    </div>
  );
}

const FOOTER_ITEM = "text-[13px] text-site-ink/85 @5xl:text-[15px]";

function Footer(props: BlockRenderProps<FooterProps>) {
  const site = useSite();
  const socials = socialLinks(site);
  const phone = site.phones[0]?.number;
  const hoursLines = (site.hoursDetail || site.hours).split("·").map((s) => s.trim()).filter(Boolean);
  return (
    <footer
      style={spacingStyle(props.spacing)}
      className="bg-site-tint-1 pt-[calc(40px*var(--site-space))] pb-[calc(28px*var(--site-space))] @3xl:pt-[calc(48px*var(--site-space))] @3xl:pb-[calc(32px*var(--site-space))] @5xl:pt-[calc(72px*var(--site-space))] @5xl:pb-[calc(40px*var(--site-space))]"
    >
      <div className={cn(WRAP, "flex flex-col gap-6 @3xl:gap-7 @5xl:gap-10")}>
        <div className="flex flex-col gap-6 @3xl:flex-row @3xl:items-start @3xl:justify-between @3xl:gap-10">
          <div className={cn("flex flex-col gap-2 @5xl:gap-3", ALIGN_CLASS[props.align])}>
            <Brand name={site.businessName} className="text-[26px] @3xl:text-[28px] @5xl:text-[32px]" />
            {props.tagline && <p className="text-[13px] text-site-muted @5xl:text-[15px]">{props.tagline}</p>}
          </div>

          <div className="flex flex-wrap gap-x-7 gap-y-5 @3xl:gap-10 @5xl:gap-[72px]">
            {site.address && (
              <FooterColumn title="Visit">
                <p className={cn(FOOTER_ITEM, "max-w-[160px]")}>{site.address}</p>
              </FooterColumn>
            )}
            {hoursLines.length > 0 && (
              <FooterColumn title="Hours">
                {hoursLines.map((line) => (
                  <p key={line} className={FOOTER_ITEM}>
                    {line}
                  </p>
                ))}
              </FooterColumn>
            )}
            {socials.length > 0 && (
              <FooterColumn title="Follow">
                {socials.map((link) => (
                  <a key={link.href} href={link.href} {...EXTERNAL_LINK} className={cn(FOOTER_ITEM, "rounded-sm hover:text-site-accent", FOCUS)}>
                    {link.label} ↗
                  </a>
                ))}
              </FooterColumn>
            )}
          </div>
        </div>

        <Hairline />

        <div className="flex flex-col gap-1 font-site-display text-[11px] leading-[1.6] text-site-muted @3xl:flex-row @3xl:items-start @3xl:justify-between @5xl:text-[12px]">
          <p>
            {site.email && (
              <a href={mailtoHref(site.email)} className={cn("rounded-sm hover:text-site-accent", FOCUS)}>
                {site.email}
              </a>
            )}
            {site.email && phone && " · "}
            {phone && (
              <a href={telHref(phone)} className={cn("rounded-sm hover:text-site-accent", FOCUS)}>
                {phone}
              </a>
            )}
          </p>
          <p>Made with WebBlock</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Text (not in Figma: eyebrow + heading + paragraph in this template's style) ─

function Text(props: BlockRenderProps<TextProps>) {
  return (
    <section
      style={spacingStyle(props.spacing)}
      className="py-[calc(40px*var(--site-space))] @3xl:py-[calc(56px*var(--site-space))] @5xl:py-[calc(88px*var(--site-space))]"
    >
      <div className={WRAP}>
        <div
          className={cn(
            "flex max-w-[760px] flex-col gap-3 @5xl:gap-4",
            ALIGN_CLASS[props.align],
            props.align === "center" && "mx-auto",
            props.align === "right" && "ml-auto",
          )}
        >
          <Eyebrow>{props.eyebrow}</Eyebrow>
          <SectionTitle>{props.heading}</SectionTitle>
          {props.body && (
            <p className="text-[15px] leading-[1.6] whitespace-pre-line text-site-ink/85 @5xl:text-[17px]">{props.body}</p>
          )}
        </div>
      </div>
    </section>
  );
}

export const warmBold: TemplateDesign = { Header, Hero, ProductCards, AllProducts, About, VisitUs, Footer, Text };
