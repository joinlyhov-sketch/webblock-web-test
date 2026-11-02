"use client";

import type { ReactNode } from "react";
import { Call, Clock, Location, Send2 } from "iconsax-reactjs";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  AboutProps,
  AllProductsProps,
  FooterProps,
  HeroProps,
  Product,
  ProductCardsProps,
  SiteRootProps,
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

/*
 * "Jackets" (a small jacket shop). Dark page, cream cards with hard offset shadows in blue and yellow,
 * Anton display type with outlined lines, and a tilted ticker band. Cards are cream (`tint-2`) with
 * near-black (`tint-3`) text; the page itself is dark with cream text (`ink`).
 */

const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 @3xl:px-10 @5xl:px-16";
const DISPLAY = "font-site-heading uppercase";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";
/** Hard offset shadow of a cream card (blue) and of a blue panel (yellow). */
const CARD_SHADOW = "shadow-[5px_5px_0_var(--site-tint-4)] @5xl:shadow-[8px_8px_0_var(--site-tint-4)]";
const PANEL_SHADOW = "shadow-[6px_6px_0_var(--site-tint-1)] @5xl:shadow-[10px_10px_0_var(--site-tint-1)]";
/** Outlined display text: transparent fill, cream stroke. */
const OUTLINE = "text-transparent [-webkit-text-stroke:2px_var(--site-ink)] @5xl:[-webkit-text-stroke:3px_var(--site-ink)]";

/* ------------------------------------------------------------------ shared pieces */

/** "Our products" → the second half of the words in blue. */
function TwoToneHeading({ text, className }: { text: string; className?: string }) {
  const words = text.trim().split(/\s+/);
  const blue = Math.max(1, Math.floor(words.length / 2));
  const split = words.length - blue;
  return (
    <h2 className={cn(DISPLAY, "leading-[0.95] tracking-[-0.01em] text-site-ink", className)}>
      {words.slice(0, split).join(" ")}
      {split > 0 && " "}
      <span className="text-site-accent">{words.slice(split).join(" ")}</span>
    </h2>
  );
}

function Tag({ children, tone = "yellow", className }: { children: ReactNode; tone?: "yellow" | "dark"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.04em] uppercase @5xl:text-[12px]",
        tone === "yellow" ? "bg-site-tint-1 text-site-tint-3" : "bg-site-tint-3 text-site-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A cream pill button with a hard offset shadow. */
function PillLink({ tone, className, ...rest }: { tone: "blue" | "cream" | "dark"; className?: string } & React.ComponentProps<"a">) {
  return (
    <a
      {...rest}
      className={cn(
        "inline-flex items-center justify-center rounded-site-button px-5 py-2.5 text-[12px] font-bold tracking-[0.04em] whitespace-nowrap uppercase transition-transform hover:-translate-y-px @5xl:px-6 @5xl:py-3 @5xl:text-[13px]",
        tone === "blue" && "bg-site-accent text-site-tint-3 shadow-[3px_3px_0_var(--site-tint-1)]",
        tone === "cream" && "bg-site-tint-2 text-site-tint-3 shadow-[3px_3px_0_var(--site-tint-1)]",
        tone === "dark" && "bg-site-tint-3 text-site-ink",
        FOCUS,
        className,
      )}
    />
  );
}

function BrandMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-site-tint-3 bg-site-accent text-site-tint-3", className)}>
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor">
        <path d="M8 3 3 7l1.5 4L7 10v11h10V10l2.5 1L21 7l-5-4-1.5 2h-5z" />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ Header */

function Header() {
  const site = useSite();
  const links = [
    { label: "Home", href: `#${SECTION_ID.top}` },
    { label: "Products", href: `#${SECTION_ID.shop}` },
    { label: "About", href: "#about" },
    { label: "Visit", href: `#${SECTION_ID.visit}` },
  ];
  return (
    <header id={SECTION_ID.top} className="bg-site-bg px-3 pt-3 @3xl:px-8 @3xl:pt-5 @5xl:px-12">
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 rounded-full border-2 border-site-tint-3 bg-site-tint-2 py-2 pr-2 pl-3 text-site-tint-3 @3xl:py-2.5 @3xl:pl-4",
          "shadow-[3px_3px_0_var(--site-tint-4)] @5xl:shadow-[4px_4px_0_var(--site-tint-4)]",
        )}
      >
        <a href={`#${SECTION_ID.top}`} className={cn("flex min-w-0 items-center gap-2.5 rounded-full", FOCUS)}>
          <SiteLogo fallback={<BrandMark />} className="size-8" />
          <span className={cn(DISPLAY, "truncate text-[18px] tracking-[0.02em] @5xl:text-[20px]")}>{site.businessName}</span>
        </a>
        <nav aria-label="Main" className="hidden @3xl:block">
          <ul className="flex items-center gap-7">
            {links.map((link) => (
              <li key={link.label}>
                <a href={link.href} className={cn("rounded text-[12px] font-bold hover:underline @5xl:text-[13px]", FOCUS)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <ContactDialog
          trigger={(open) => (
            <button
              type="button"
              onClick={open}
              className={cn(
                "rounded-site-button bg-site-tint-3 px-4 py-2 text-[12px] font-bold text-site-ink transition-opacity hover:opacity-85 @5xl:px-5 @5xl:py-2.5 @5xl:text-[13px]",
                FOCUS,
              )}
            >
              Contact
            </button>
          )}
        />
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ Hero */

/** The rotating-badge circle ("NEW ARRIVALS • JACKETS •"). */
function RoundBadge({ text }: { text: string }) {
  const label = `${text.toUpperCase()} • `.repeat(3);
  return (
    <div className="absolute right-0 bottom-[6%] size-[86px] rounded-full border-2 border-site-tint-3 bg-site-tint-1 @3xl:size-[104px] @5xl:size-[120px]">
      <svg viewBox="0 0 120 120" aria-hidden className="size-full">
        <defs>
          <path id="jackets-badge-circle" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
        </defs>
        <text className="fill-site-tint-3 font-site-heading" fontSize="12" letterSpacing="1.5">
          <textPath href="#jackets-badge-circle">{label.slice(0, 44)}</textPath>
        </text>
        <path d="M60 46v26m-9-9 9 9 9-9" stroke="currentColor" className="text-site-tint-3" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Hero(props: BlockRenderProps<HeroProps>) {
  const site = useSite();
  const lines = props.heading.split("\n").filter(Boolean);
  // Outline the second half of the lines ("JACKETS / FOR" solid, "EVERYDAY / LIFE." outlined).
  const solidCount = lines.length > 1 ? Math.ceil(lines.length / 2) : lines.length;
  // First line of the description is the "Picked with care." tag, the rest is the paragraph.
  const [tag, ...rest] = props.description.split("\n");
  const paragraph = rest.length > 0 ? rest.join(" ") : props.description;
  const showTag = rest.length > 0 && tag.trim() !== "";
  const ticker = props.highlights.filter((h) => h.text);
  const side = props.sideImages;

  return (
    <section style={spacingStyle(props.spacing)} className="overflow-hidden bg-site-bg">
      <div className={cn(CONTAINER, "pt-[calc(28px*var(--site-space))] pb-[calc(40px*var(--site-space))] @5xl:pt-[calc(36px*var(--site-space))] @5xl:pb-[calc(56px*var(--site-space))]")}>
        <div className="grid gap-8 @3xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] @3xl:items-center @5xl:gap-14">
          <div className={cn("flex flex-col gap-4 @5xl:gap-5", ALIGN_CLASS[props.align])}>
            {props.eyebrow && (
              <Tag className="gap-2">
                <span aria-hidden className="size-2 rounded-full bg-site-success ring-2 ring-site-success/30" />
                {props.eyebrow}
              </Tag>
            )}
            <h1 className={cn(DISPLAY, "text-[64px] leading-[0.88] tracking-[-0.01em] @3xl:text-[84px] @5xl:text-[132px]")}>
              {lines.map((line, i) => (
                <span key={`${line}-${i}`} className={cn("block", i < solidCount ? "text-site-ink" : OUTLINE)}>
                  {line}
                </span>
              ))}
            </h1>
            {showTag && (
              <p className={cn(DISPLAY, "w-fit -rotate-1 bg-site-accent px-3 py-1 text-[22px] text-site-tint-3 shadow-[3px_3px_0_var(--site-tint-1)] @5xl:text-[28px]")}>
                {tag}
              </p>
            )}
            {paragraph && <p className="max-w-[420px] text-[13px] leading-[1.6] text-site-muted @5xl:text-[14px]">{paragraph}</p>}
            {(props.primaryLabel || props.secondaryLabel) && (
              <div className={cn("flex flex-wrap items-center gap-3 pt-1", JUSTIFY_CLASS[props.align])}>
                {props.primaryLabel && (
                  <PillLink tone="blue" {...linkProps(ctaHref(props.primaryAction, site))}>
                    {props.primaryLabel}
                  </PillLink>
                )}
                {props.secondaryLabel && (
                  <PillLink tone="cream" {...linkProps(ctaHref(props.secondaryAction, site))}>
                    {props.secondaryLabel}
                  </PillLink>
                )}
              </div>
            )}
          </div>

          {/* Three tilted photo cards on a blue half circle. */}
          <div className="relative mx-auto aspect-[1.04] w-full max-w-[520px] @3xl:max-w-none">
            <div aria-hidden className="absolute bottom-0 left-[16%] h-[48%] w-[68%] rounded-t-full bg-site-accent" />
            {side[0] && (
              <div className="absolute top-[14%] left-0 aspect-square w-[40%] -rotate-[8deg] overflow-hidden rounded-site-image border-2 border-site-tint-3 bg-site-tint-2 shadow-[4px_4px_0_var(--site-tint-1)]">
                <SiteImage src={side[0].imageUrl} alt="" sizes="(min-width: 1024px) 220px, 35vw" />
              </div>
            )}
            {side[1] && (
              <div className="absolute top-[30%] right-0 aspect-square w-[40%] rotate-[8deg] overflow-hidden rounded-site-image border-2 border-site-tint-3 bg-site-tint-2 shadow-[4px_4px_0_var(--site-tint-1)]">
                <SiteImage src={side[1].imageUrl} alt="" sizes="(min-width: 1024px) 220px, 35vw" />
              </div>
            )}
            <div className="absolute top-0 left-[22%] aspect-square w-[56%] overflow-hidden rounded-site-image border-2 border-site-tint-3 bg-site-tint-2 shadow-[5px_5px_0_var(--site-tint-1)] @5xl:shadow-[8px_8px_0_var(--site-tint-1)]">
              <SiteImage src={props.imageUrl} alt={props.heading.replace(/\n/g, " ")} sizes="(min-width: 1024px) 300px, 55vw" priority />
            </div>
            {props.badge && <RoundBadge text={props.badge} />}
          </div>
        </div>
      </div>

      {ticker.length > 0 && <Ticker items={ticker.map((h) => h.text)} />}
    </section>
  );
}

/** The tilted blue band of repeated words. */
function Ticker({ items }: { items: string[] }) {
  const row = Array.from({ length: 4 }, () => items).flat();
  return (
    <div aria-hidden className="-mx-2 -rotate-[1.5deg] overflow-hidden bg-site-accent py-2.5 @5xl:py-4">
      <p className={cn(DISPLAY, "flex w-max items-center gap-5 pl-2 text-[24px] whitespace-nowrap text-site-tint-3 @3xl:text-[30px] @5xl:gap-8 @5xl:text-[38px]")}>
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-5 @5xl:gap-8">
            {item}
            <span>+</span>
          </span>
        ))}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ Products */

function SectionTitle({ heading, aside, align }: { heading: string; aside?: string; align: HeroProps["align"] }) {
  return (
    <div className="flex items-end gap-4 @5xl:gap-6">
      <TwoToneHeading text={heading} className={cn("shrink-0 text-[40px] @3xl:text-[52px] @5xl:text-[72px]", align === "center" && "mx-auto")} />
      <span aria-hidden className="mb-2 hidden h-px flex-1 bg-site-ink/70 @3xl:block @5xl:mb-3" />
      {aside && <p className="mb-1 hidden shrink-0 text-[11px] text-site-muted @3xl:block @5xl:mb-2">{aside}</p>}
    </div>
  );
}

function ProductCard({ product, currency }: { product: Product; currency: SiteRootProps["currency"] }) {
  return (
    <article className={cn("flex h-full flex-col gap-3 rounded-[22px] border-2 border-site-tint-3 bg-site-tint-2 p-2.5 text-site-tint-3 @5xl:gap-4 @5xl:rounded-[28px] @5xl:p-3.5", CARD_SHADOW)}>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[14px] border-2 border-site-tint-3 bg-white @5xl:rounded-[18px]">
        <SiteImage src={product.imageUrl} alt={product.name} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 33vw, 80vw" />
      </div>
      <div className="flex flex-1 flex-col gap-2 px-1 pb-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(DISPLAY, "min-w-0 text-[17px] leading-[1.05] @5xl:text-[22px]")}>{product.name}</h3>
          <p className="shrink-0 rounded-full border-2 border-site-tint-3 bg-site-accent px-2.5 py-0.5 font-site-heading text-[13px] @5xl:text-[15px]">
            {formatPrice(product.price, currency)}
          </p>
        </div>
        {product.description && <p className="text-[11px] leading-[1.5] text-site-tint-3/70 @5xl:text-[12px]">{product.description}</p>}
        <a
          href={`#${SECTION_ID.visit}`}
          aria-label={`Find ${product.name} in store`}
          className={cn("mt-auto w-fit rounded-full bg-site-tint-3 px-4 py-1.5 text-[11px] font-bold tracking-[0.04em] text-site-ink uppercase transition-opacity hover:opacity-85", FOCUS)}
        >
          View
        </a>
      </div>
    </article>
  );
}

function EmptyProducts({ children }: { children: ReactNode }) {
  return <p className="rounded-[22px] border-2 border-dashed border-site-border px-6 py-12 text-center text-[14px] text-site-muted">{children}</p>;
}

function ProductCards(props: BlockRenderProps<ProductCardsProps>) {
  const site = useSite();
  return (
    <section style={spacingStyle(props.spacing)} className="bg-site-bg py-[calc(44px*var(--site-space))] @5xl:py-[calc(72px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-7 @5xl:gap-10")}>
        <SectionTitle heading={props.heading} aside={props.eyebrow} align={props.align} />
        {props.products.length === 0 ? (
          <EmptyProducts>No featured products yet. Check back soon.</EmptyProducts>
        ) : (
          <ul className={cn("grid grid-cols-1 gap-6 @3xl:grid-cols-3 @3xl:gap-5 @5xl:gap-9", DESKTOP_COLUMNS_CLASS[props.columns])}>
            {props.products.map((product, i) => (
              <li key={`${product.name}-${i}`}>
                <ProductCard product={product} currency={site.currency} />
              </li>
            ))}
          </ul>
        )}
        {props.viewAllLabel && (
          <a href={`#${SECTION_ID.shop}`} className={cn("w-fit text-[13px] font-bold text-site-accent underline underline-offset-4", FOCUS)}>
            {props.viewAllLabel}
          </a>
        )}
      </div>
    </section>
  );
}

function AllProducts(props: BlockRenderProps<AllProductsProps>) {
  const site = useSite();
  const browser = useProductBrowser(props.products, props.categories, props.pageSize);
  const showChips = props.categories.length > 1;
  return (
    <section
      id={SECTION_ID.shop}
      style={spacingStyle(props.spacing)}
      className="scroll-mt-4 bg-site-bg py-[calc(44px*var(--site-space))] @5xl:py-[calc(72px*var(--site-space))]"
    >
      <div className={cn(CONTAINER, "flex flex-col gap-6 @5xl:gap-9")}>
        <SectionTitle heading={props.heading} aside={props.eyebrow} align={props.align} />
        {props.products.length === 0 ? (
          <EmptyProducts>No products yet. Check back soon.</EmptyProducts>
        ) : (
          <>
            {(showChips || props.products.length > props.pageSize) && (
              <div className="flex flex-col gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-between">
                {showChips && (
                  <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
                    {browser.chips.map((chip) => {
                      const active = chip === browser.category;
                      return (
                        <button
                          key={chip}
                          type="button"
                          aria-pressed={active}
                          onClick={() => browser.setCategory(chip)}
                          className={cn(
                            "rounded-full border-2 px-3.5 py-1 text-[12px] font-bold transition-colors",
                            active ? "border-site-accent bg-site-accent text-site-tint-3" : "border-site-border text-site-ink hover:border-site-ink",
                            FOCUS,
                          )}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                )}
                <label className="flex w-full items-center rounded-full border-2 border-site-border bg-site-surface px-4 py-2 focus-within:border-site-accent @3xl:w-[260px]">
                  <span className="sr-only">Search products</span>
                  <input
                    type="search"
                    value={browser.query}
                    onChange={(e) => browser.setQuery(e.target.value)}
                    placeholder={props.searchPlaceholder}
                    className="w-full min-w-0 bg-transparent text-[13px] text-site-ink outline-none placeholder:text-site-subtle"
                  />
                </label>
              </div>
            )}
            {browser.items.length === 0 ? (
              <EmptyProducts>
                {browser.query.trim() ? `No products match “${browser.query.trim()}”.` : "No products in this category yet."}
              </EmptyProducts>
            ) : (
              <ul className={cn("grid grid-cols-1 gap-6 @3xl:grid-cols-3 @3xl:gap-5 @5xl:gap-9", DESKTOP_COLUMNS_CLASS[props.columns])}>
                {browser.items.map((product, i) => (
                  <li key={`${product.name}-${i}`}>
                    <ProductCard product={product} currency={site.currency} />
                  </li>
                ))}
              </ul>
            )}
            {browser.totalPages > 1 && (
              <nav aria-label="Product pages" className="flex items-center justify-between gap-3">
                <p className="text-[12px] text-site-muted">
                  Showing {browser.items.length} of {browser.total}
                </p>
                <ul className="flex items-center gap-2">
                  {Array.from({ length: browser.totalPages }, (_, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        aria-label={`Page ${i + 1}`}
                        aria-current={i === browser.page ? "page" : undefined}
                        onClick={() => browser.setPage(i)}
                        className={cn(
                          "size-8 rounded-full border-2 text-[12px] font-bold",
                          i === browser.page ? "border-site-accent bg-site-accent text-site-tint-3" : "border-site-border text-site-ink hover:border-site-ink",
                          FOCUS,
                        )}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ About */

function About(props: BlockRenderProps<AboutProps>) {
  // "Endy · Founder" → signature and role pill.
  const [name, role] = props.caption.split(/\s*[·,]\s*/);
  return (
    <section id="about" style={spacingStyle(props.spacing)} className="scroll-mt-4 bg-site-bg py-[calc(24px*var(--site-space))] @5xl:py-[calc(40px*var(--site-space))]">
      <div className={CONTAINER}>
        <div className={cn("grid gap-7 rounded-[28px] border-2 border-site-tint-3 bg-site-accent p-5 text-site-tint-3 @3xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] @3xl:items-center @3xl:gap-10 @3xl:p-8 @5xl:rounded-[40px] @5xl:p-12", PANEL_SHADOW)}>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[380px] -rotate-[3deg] overflow-hidden rounded-[22px] border-2 border-site-tint-3 bg-white shadow-[6px_6px_0_var(--site-tint-3)] @3xl:mx-0 @5xl:max-w-[440px]">
            <SiteImage src={props.imageUrl} alt={props.caption || props.heading} sizes="(min-width: 1024px) 440px, 80vw" />
          </div>
          <div className={cn("flex flex-col gap-4 @5xl:gap-5", ALIGN_CLASS[props.align])}>
            {props.eyebrow && <Tag tone="dark">{props.eyebrow}</Tag>}
            <h2 className={cn(DISPLAY, "text-[40px] leading-[0.95] @3xl:text-[52px] @5xl:text-[76px]")}>{props.heading}</h2>
            {props.body && <p className="max-w-[440px] text-[13px] leading-[1.6] font-medium @5xl:text-[14px]">{props.body}</p>}
            {name && (
              <p className="flex items-center gap-3">
                <span className={cn(DISPLAY, "text-[26px] @5xl:text-[32px]")}>{name}</span>
                {role && <Tag className="border-2 border-site-tint-3 text-[10px]">{role}</Tag>}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Visit us */

/** "Mon – Fri 9:00 AM – 6:00 PM · Sat … · Sun closed" → rows of day label and hours. */
function hourRows(site: SiteRootProps): { day: string; hours: string }[] {
  if (!site.hoursDetail) return site.hours ? [{ day: "Every day", hours: site.hours }] : [];
  return site.hoursDetail
    .split(" · ")
    .map((part) => {
      const match = part.match(/^(.*?)\s+(\d.*|closed)$/i);
      return match ? { day: match[1], hours: match[2] } : { day: part, hours: "" };
    })
    .filter((row) => row.day);
}

function InfoCard({ icon: Icon, label, children, href }: { icon: typeof Call; label: string; children: ReactNode; href?: string }) {
  const body = (
    <>
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-site-tint-3 bg-site-accent text-site-tint-3 @5xl:size-11">
        <Icon className="size-[18px]" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[10px] text-site-tint-3/65">{label}</span>
        <span className="text-[13px] font-bold break-words @5xl:text-[14px]">{children}</span>
      </span>
    </>
  );
  const cls = cn("flex items-center gap-3 rounded-[18px] border-2 border-site-tint-3 bg-site-tint-2 p-3 text-site-tint-3 shadow-[4px_4px_0_var(--site-tint-4)] @5xl:p-3.5", FOCUS);
  return href ? (
    <a {...linkProps(href)} className={cn(cls, "transition-transform hover:-translate-y-px")}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function VisitUs(props: BlockRenderProps<VisitUsProps>) {
  const site = useSite();
  const phone = site.phones[0]?.number;
  const rows = hourRows(site);
  return (
    <section id={SECTION_ID.visit} style={spacingStyle(props.spacing)} className="scroll-mt-4 bg-site-bg py-[calc(44px*var(--site-space))] @5xl:py-[calc(72px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-6 @5xl:gap-9")}>
        <div className={cn("flex flex-col gap-3", ALIGN_CLASS[props.align])}>
          {props.eyebrow && <Tag>{props.eyebrow}</Tag>}
          {props.heading && <TwoToneHeading text={props.heading} className="max-w-[560px] text-[40px] @3xl:text-[52px] @5xl:text-[72px]" />}
        </div>
        <div className="grid gap-5 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] @5xl:gap-8">
          <div className="flex flex-col gap-4">
            {(site.hours || rows.length > 0) && (
              <div className="flex flex-col gap-3 rounded-[18px] border-2 border-site-tint-3 bg-site-tint-2 p-3.5 text-site-tint-3 shadow-[4px_4px_0_var(--site-tint-4)] @5xl:p-4">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-site-tint-3 bg-site-accent @5xl:size-11">
                    <Clock className="size-[18px]" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[10px] text-site-tint-3/65">Opening hours</span>
                    {site.statusText && <span className="text-[13px] font-bold @5xl:text-[14px]">{site.statusText}</span>}
                  </span>
                </div>
                {rows.length > 0 && (
                  <dl className="flex flex-col border-t border-site-tint-3/25 pt-2 text-[12px]">
                    {rows.map((row) => (
                      <div key={row.day} className="flex items-center justify-between gap-3 border-b border-site-tint-3/15 py-1.5 last:border-b-0">
                        <dt className="text-site-tint-3/70">{row.day}</dt>
                        <dd className="font-bold">{row.hours}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            )}
            {site.address && (
              <InfoCard icon={Location} label="Find us at" href={directionsHref(site.address)}>
                {site.address}
              </InfoCard>
            )}
            {phone && (
              <InfoCard icon={Call} label="Call us" href={telHref(phone)}>
                {phone}
              </InfoCard>
            )}
            {site.telegram && (
              <InfoCard icon={Send2} label="Telegram" href={telegramHref(site.telegram)}>
                @{site.telegram}
              </InfoCard>
            )}
          </div>
          <div className="relative min-h-[300px] overflow-hidden rounded-[24px] border-2 border-site-tint-3 shadow-[5px_5px_0_var(--site-tint-4)] @5xl:min-h-[420px] @5xl:rounded-[28px]">
            <SiteMap className="absolute inset-0" />
            <span className="absolute top-3 left-3 rounded-full border-2 border-site-tint-3 bg-site-tint-2 px-3 py-0.5 text-[11px] font-bold text-site-tint-3">Map</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Footer */

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className={cn(DISPLAY, "text-[15px] tracking-[0.04em] text-site-accent")}>{title}</p>
      <ul className="flex flex-col gap-2 text-[12px] text-site-ink/85 @5xl:text-[13px]">{children}</ul>
    </div>
  );
}

function Footer(props: BlockRenderProps<FooterProps>) {
  const site = useSite();
  const phone = site.phones[0]?.number;
  const rows = hourRows(site);
  const socials = socialLinks(site);
  const year = new Date().getFullYear();
  const circle = "flex size-9 items-center justify-center rounded-full bg-site-accent text-site-tint-3 transition-transform hover:-translate-y-px";
  return (
    <footer style={spacingStyle(props.spacing)} className="overflow-hidden bg-site-bg pt-[calc(36px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-8 @5xl:gap-10")}>
        <div className="grid gap-8 @3xl:grid-cols-[1.2fr_1fr_1.3fr_1.2fr] @5xl:gap-10">
          <div className={cn("flex flex-col gap-3", ALIGN_CLASS[props.align])}>
            <a href={`#${SECTION_ID.top}`} className={cn("flex items-center gap-2.5 rounded-full", FOCUS)}>
              <SiteLogo fallback={<BrandMark />} className="size-8" />
              <span className={cn(DISPLAY, "text-[20px] tracking-[0.02em]")}>{site.businessName}</span>
            </a>
            {props.tagline && <p className="max-w-[220px] text-[12px] leading-[1.6] text-site-muted">{props.tagline}</p>}
            <div className="flex items-center gap-2">
              {site.telegram && (
                <a href={telegramHref(site.telegram)} {...EXTERNAL_LINK} aria-label="Telegram" className={cn(circle, FOCUS)}>
                  <Send2 aria-hidden className="size-4" />
                </a>
              )}
              {phone && (
                <a href={telHref(phone)} aria-label="Call us" className={cn(circle, FOCUS)}>
                  <Call aria-hidden className="size-4" />
                </a>
              )}
              {site.address && (
                <a href={directionsHref(site.address)} {...EXTERNAL_LINK} aria-label="Get directions" className={cn(circle, FOCUS)}>
                  <Location aria-hidden className="size-4" />
                </a>
              )}
            </div>
          </div>
          <FooterColumn title="Explore">
            {[
              ["Home", `#${SECTION_ID.top}`],
              ["Products", `#${SECTION_ID.shop}`],
              ["About", "#about"],
              ["Visit", `#${SECTION_ID.visit}`],
            ].map(([label, href]) => (
              <li key={label}>
                <a href={href} className={cn("hover:underline", FOCUS)}>
                  {label}
                </a>
              </li>
            ))}
          </FooterColumn>
          {(phone || site.telegram || site.address || site.email) && (
            <FooterColumn title="Contact">
              {phone && (
                <li>
                  <a href={telHref(phone)} className={cn("hover:underline", FOCUS)}>
                    {phone}
                  </a>
                </li>
              )}
              {site.email && (
                <li>
                  <a href={mailtoHref(site.email)} className={cn("break-all hover:underline", FOCUS)}>
                    {site.email}
                  </a>
                </li>
              )}
              {site.telegram && (
                <li>
                  <a href={telegramHref(site.telegram)} {...EXTERNAL_LINK} className={cn("hover:underline", FOCUS)}>
                    @{site.telegram}
                  </a>
                </li>
              )}
              {site.address && <li>{site.address}</li>}
              {socials.filter((s) => s.label !== "Telegram").map((s) => (
                <li key={s.label}>
                  <a href={s.href} {...EXTERNAL_LINK} className={cn("hover:underline", FOCUS)}>
                    {s.label} <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </FooterColumn>
          )}
          {rows.length > 0 && (
            <FooterColumn title="Opening hours">
              {rows.map((row) => (
                <li key={row.day} className="flex items-center justify-between gap-3">
                  <span>{row.day}</span>
                  <span className={cn("font-bold", /closed/i.test(row.hours) ? "text-site-accent" : "text-site-ink")}>{row.hours}</span>
                </li>
              ))}
            </FooterColumn>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-site-border pt-5 text-[11px] text-site-muted">
          <p>
            © {year} {site.businessName}. All rights reserved.
          </p>
          <a href={`#${SECTION_ID.top}`} className={cn("flex items-center gap-2 text-[11px] font-bold tracking-[0.04em] text-site-ink uppercase", FOCUS)}>
            Back to top
            <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-site-accent text-[14px] text-site-tint-3">
              ↑
            </span>
          </a>
        </div>
      </div>
      {/* The shop name again, huge and cut off at the bottom of the page. */}
      <p aria-hidden className={cn(DISPLAY, "mt-4 -mb-[0.28em] text-center text-[22cqw] leading-none whitespace-nowrap select-none", OUTLINE, "opacity-30")}>
        {site.businessName}
      </p>
    </footer>
  );
}

/* ------------------------------------------------------------------ Text (the "Come try them on" band) */

function Text(props: BlockRenderProps<TextProps>) {
  const site = useSite();
  return (
    <section style={spacingStyle(props.spacing)} className="bg-site-bg py-[calc(24px*var(--site-space))] @5xl:py-[calc(40px*var(--site-space))]">
      <div className={CONTAINER}>
        <div className={cn("flex flex-col gap-6 rounded-[28px] border-2 border-site-tint-3 bg-site-accent p-6 text-site-tint-3 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:p-8 @5xl:rounded-[36px] @5xl:p-10", PANEL_SHADOW)}>
          <div className={cn("flex min-w-0 flex-col gap-2", ALIGN_CLASS[props.align])}>
            {props.eyebrow && <Tag tone="dark">{props.eyebrow}</Tag>}
            {props.heading && <h2 className={cn(DISPLAY, "max-w-[620px] text-[36px] leading-[0.95] @3xl:text-[46px] @5xl:text-[64px]")}>{props.heading}</h2>}
            {props.body && <p className="max-w-[520px] text-[13px] leading-[1.6] font-medium whitespace-pre-line @5xl:text-[14px]">{props.body}</p>}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {site.address && (
              <PillLink tone="dark" {...linkProps(directionsHref(site.address))}>
                Get directions
              </PillLink>
            )}
            <ContactDialog
              trigger={(open) => (
                <button
                  type="button"
                  onClick={open}
                  className={cn(
                    "rounded-site-button border-2 border-site-tint-3 bg-site-tint-2 px-5 py-2.5 text-[12px] font-bold tracking-[0.04em] uppercase transition-transform hover:-translate-y-px @5xl:px-6 @5xl:py-3 @5xl:text-[13px]",
                    FOCUS,
                  )}
                >
                  Contact us
                </button>
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export const jackets: TemplateDesign = { Header, Hero, ProductCards, AllProducts, About, VisitUs, Footer, Text };
