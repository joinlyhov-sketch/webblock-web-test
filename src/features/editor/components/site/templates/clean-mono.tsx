"use client";

import type { ReactNode } from "react";
import { ArrowRight, Call, Location, SearchNormal1, Send2, Sms } from "iconsax-reactjs";
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
 * "Clean mono" (Northpoint Audio). Swiss / editorial monochrome: white page, near-black ink,
 * Space Mono uppercase labels, 1px hairlines, square corners. Figma desktop is 1728 wide; scaled
 * here to a 1280 container (64px side padding).
 */

const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 @3xl:px-10 @5xl:px-16";
/** Mono "spec label" used for eyebrows, counters and info labels. */
const LABEL = "font-site-display text-[11px] tracking-[0.06em] uppercase text-site-muted @5xl:text-[12px]";
const H2 = "font-site-heading text-[30px] leading-[1.1] font-bold tracking-[-0.02em] text-site-ink @3xl:text-[38px] @5xl:text-[48px]";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-ink";

/* ------------------------------------------------------------------ shared pieces */

function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn(LABEL, className)}>{children}</p>;
}

function StatusDot({ className }: { className?: string }) {
  return <span aria-hidden className={cn("size-2 shrink-0 rounded-full bg-site-success", className)} />;
}

function SectionHeading({
  eyebrow,
  heading,
  align,
  aside,
}: {
  eyebrow: string;
  heading: string;
  align: HeroProps["align"];
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className={cn("flex min-w-0 flex-1 flex-col gap-2.5 @5xl:gap-3.5", ALIGN_CLASS[align])}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        {heading && <h2 className={H2}>{heading}</h2>}
      </div>
      {aside}
    </div>
  );
}

/* ------------------------------------------------------------------ Header */

function Header() {
  const site = useSite();
  const links = [
    { label: "Home", href: `#${SECTION_ID.top}` },
    { label: "Shop", href: `#${SECTION_ID.shop}` },
    { label: "Visit us", href: `#${SECTION_ID.visit}` },
  ];
  return (
    <header id={SECTION_ID.top} className="border-b border-site-border bg-site-bg">
      <div className={cn(CONTAINER, "flex items-center justify-between gap-4 py-[18px] @3xl:py-5")}>
        <a
          href={`#${SECTION_ID.top}`}
          className={cn("truncate font-site-heading text-[17px] font-bold text-site-ink @3xl:text-[19px] @5xl:text-[21px]", FOCUS)}
        >
          <SiteLogo fallback={<span aria-hidden>▲ </span>} className="mr-[0.35em] size-[1.4em] align-[-0.4em]" />
          {site.businessName}
        </a>
        <div className="flex shrink-0 items-center gap-2 @3xl:gap-[22px]">
          <nav aria-label="Main" className="hidden @3xl:block">
            <ul className="flex items-center gap-[22px]">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={cn("text-[14px] font-medium text-site-ink transition-colors hover:text-site-muted @5xl:text-[15px] @5xl:font-normal @5xl:text-site-muted @5xl:hover:text-site-ink", FOCUS)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {site.statusText && (
            <span className="hidden items-center gap-2 rounded-full bg-site-success-soft py-1.5 pr-3.5 pl-3 text-[12px] font-medium text-site-success @3xl:flex @5xl:py-2 @5xl:text-[13px]">
              <StatusDot />
              {site.statusText}
            </span>
          )}
          <ContactDialog
            trigger={(open) => (
              <button
                type="button"
                onClick={open}
                className={cn(
                  "rounded-site-button bg-site-accent px-3.5 py-2 text-[13px] font-semibold text-site-accent-fg transition-opacity hover:opacity-90 @3xl:px-[18px] @3xl:py-2.5 @3xl:text-[14px] @5xl:px-6 @5xl:py-3 @5xl:text-[15px]",
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

function Hero(props: BlockRenderProps<HeroProps>) {
  const site = useSite();
  const highlights = props.highlights.filter((h) => h.text);
  return (
    <section style={spacingStyle(props.spacing)} className="bg-site-bg">
      <div className={CONTAINER}>
        <div className="border-y border-site-border">
          <div className="flex flex-col gap-[18px] py-[calc(32px*var(--site-space))] @3xl:grid @3xl:grid-cols-[minmax(0,1fr)_340px] @3xl:items-center @3xl:gap-10 @3xl:py-[calc(48px*var(--site-space))] @5xl:grid-cols-[minmax(0,1fr)_480px] @5xl:gap-16 @5xl:py-[calc(64px*var(--site-space))]">
            <div className={cn("flex flex-col gap-[18px] @3xl:gap-5 @5xl:gap-7", ALIGN_CLASS[props.align])}>
              {props.eyebrow && (
                <p className={cn(LABEL, "flex items-center gap-2.5 @5xl:gap-3")}>
                  <span aria-hidden className="size-2 shrink-0 rounded-full bg-site-accent" />
                  {props.eyebrow}
                </p>
              )}
              <h1 className="font-site-heading text-[56px] leading-[0.92] font-bold tracking-[-0.03em] text-balance text-site-ink @3xl:text-[64px] @5xl:text-[88px] @5xl:tracking-[-0.04em]">
                {props.heading}
              </h1>
              {props.description && (
                <p className="max-w-[460px] text-[15px] leading-[1.55] text-site-muted @5xl:text-[17px]">{props.description}</p>
              )}
              <HeroButtons {...props} site={site} />
              {highlights.length > 0 && (
                <ul className={cn("flex flex-wrap items-center gap-y-2 pt-0 @5xl:pt-2", JUSTIFY_CLASS[props.align])}>
                  {highlights.map((h, i) => (
                    <li key={`${h.text}-${i}`} className="flex items-center">
                      {i > 0 && <span aria-hidden className="mx-3.5 h-3.5 w-px bg-site-border @5xl:mx-5 @5xl:h-4" />}
                      <span className={LABEL}>{h.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-site-image bg-site-alt">
              <SiteImage
                src={props.imageUrl}
                alt={props.heading}
                sizes="(min-width: 1024px) 480px, (min-width: 768px) 340px, 100vw"
                priority
              />
              <span aria-hidden className={cn(LABEL, "absolute top-4 left-4 @5xl:top-6 @5xl:left-6")}>
                01 / 04
              </span>
              {props.badge && (
                <span className="absolute right-4 bottom-4 bg-site-ink px-3 py-2 font-site-display text-[12px] text-site-bg @5xl:right-6 @5xl:bottom-6 @5xl:px-3.5 @5xl:py-2.5 @5xl:text-[14px]">
                  {props.badge}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroButtons(props: HeroProps & { site: SiteRootProps }) {
  if (!props.primaryLabel && !props.secondaryLabel) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-5 @5xl:gap-7", JUSTIFY_CLASS[props.align])}>
      {props.primaryLabel && (
        <a
          {...linkProps(ctaHref(props.primaryAction, props.site))}
          className={cn(
            "rounded-site-button bg-site-ink px-[22px] py-3.5 text-[14px] font-semibold text-site-bg transition-opacity hover:opacity-85 @3xl:px-6 @3xl:text-[15px] @5xl:px-7 @5xl:py-4 @5xl:text-[16px]",
            FOCUS,
          )}
        >
          {props.primaryLabel}
        </a>
      )}
      {props.secondaryLabel && (
        <a
          {...linkProps(ctaHref(props.secondaryAction, props.site))}
          className={cn(
            "rounded-site-button text-[14px] font-medium text-site-ink underline underline-offset-4 hover:no-underline @5xl:text-[16px]",
            FOCUS,
          )}
        >
          {props.secondaryLabel} <span aria-hidden>→</span>
        </a>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Product cards */

function EmptyProducts({ children }: { children: ReactNode }) {
  return (
    <p className="border border-dashed border-site-border px-6 py-12 text-center text-[15px] text-site-muted">{children}</p>
  );
}

function ProductCards(props: BlockRenderProps<ProductCardsProps>) {
  const site = useSite();
  const count = props.products.length;
  return (
    <section style={spacingStyle(props.spacing)} className="bg-site-bg py-[calc(40px*var(--site-space))] @3xl:py-[calc(56px*var(--site-space))] @5xl:py-[calc(80px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-6 @3xl:gap-7 @5xl:gap-10")}>
        <SectionHeading
          eyebrow={props.eyebrow}
          heading={props.heading}
          align={props.align}
          aside={
            count > 0 && (
              <p className={cn(LABEL, "hidden shrink-0 pb-2 @3xl:block @5xl:pb-3")}>
                {count} {count === 1 ? "item" : "items"}
              </p>
            )
          }
        />
        {count === 0 ? (
          <EmptyProducts>No featured products yet. Check back soon.</EmptyProducts>
        ) : (
          <ul
            className={cn(
              "-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-1 @3xl:mx-0 @3xl:grid @3xl:grid-cols-3 @3xl:gap-5 @3xl:overflow-visible @3xl:px-0 @3xl:pb-0 @5xl:gap-8",
              DESKTOP_COLUMNS_CLASS[props.columns],
            )}
          >
            {props.products.map((product, i) => (
              <li key={`${product.name}-${i}`} className="w-[250px] shrink-0 snap-start @3xl:w-auto">
                <PopularCard product={product} index={i} currency={site.currency} />
              </li>
            ))}
          </ul>
        )}
        {props.viewAllLabel && (
          <a
            href={`#${SECTION_ID.shop}`}
            className={cn(
              "group flex items-center justify-between border-y border-site-ink px-1 py-4 font-site-heading text-[17px] font-medium text-site-ink @3xl:px-1.5 @3xl:py-[18px] @3xl:text-[18px] @5xl:px-2 @5xl:py-[22px] @5xl:text-[20px]",
              FOCUS,
            )}
          >
            {props.viewAllLabel}
            <span aria-hidden className="text-[20px] transition-transform group-hover:translate-x-1 @3xl:text-[22px] @5xl:text-[24px]">
              →
            </span>
          </a>
        )}
      </div>
    </section>
  );
}

function PopularCard({ product, index, currency }: { product: Product; index: number; currency: SiteRootProps["currency"] }) {
  return (
    <article className="flex flex-col gap-2.5 @3xl:gap-3 @5xl:gap-4">
      <span className={LABEL}>{String(index + 1).padStart(2, "0")}</span>
      <div className="relative aspect-square w-full overflow-hidden rounded-site-image bg-site-alt @5xl:aspect-[16/15]">
        <SiteImage src={product.imageUrl} alt={product.name} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 33vw, 250px" />
      </div>
      <span aria-hidden className="h-px w-full bg-site-ink" />
      <div className="flex items-baseline justify-between gap-3 text-site-ink">
        <h3 className="min-w-0 font-site-heading text-[17px] font-medium @3xl:text-[16px] @5xl:text-[20px]">{product.name}</h3>
        <p className="shrink-0 font-site-display text-[13px] @3xl:text-[12px] @5xl:text-[14px]">{formatPrice(product.price, currency)}</p>
      </div>
      {product.description && <p className="text-[13px] text-site-muted @3xl:text-[12px] @5xl:text-[14px]">{product.description}</p>}
    </article>
  );
}

/* ------------------------------------------------------------------ All products */

function AllProducts(props: BlockRenderProps<AllProductsProps>) {
  const site = useSite();
  const browser = useProductBrowser(props.products, props.categories, props.pageSize);
  const count = props.products.length;
  const countLabel = `${count} ${count === 1 ? "product" : "products"}`;

  return (
    <section
      id={SECTION_ID.shop}
      style={spacingStyle(props.spacing)}
      className="scroll-mt-4 bg-site-bg pt-[calc(8px*var(--site-space))] pb-[calc(40px*var(--site-space))] @3xl:pb-[calc(56px*var(--site-space))] @5xl:pt-[calc(16px*var(--site-space))] @5xl:pb-[calc(88px*var(--site-space))]"
    >
      <div className={cn(CONTAINER, "flex flex-col gap-5 @3xl:gap-6 @5xl:gap-8")}>
        <SectionHeading
          eyebrow={props.eyebrow}
          heading={props.heading}
          align={props.align}
          aside={count > 0 && <p className={cn(LABEL, "hidden shrink-0 pb-2 @3xl:block @5xl:pb-3")}>{countLabel}</p>}
        />

        {count === 0 ? (
          <EmptyProducts>No products yet. Check back soon.</EmptyProducts>
        ) : (
          <>
            <div className="flex flex-col gap-5 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:gap-6">
              <div
                role="group"
                aria-label="Filter by category"
                className="order-2 -mx-4 flex gap-[22px] overflow-x-auto border-b border-site-border px-4 @3xl:order-1 @3xl:mx-0 @3xl:border-b-0 @3xl:px-0 @5xl:gap-8"
              >
                {browser.chips.map((chip) => {
                  const active = chip === browser.category;
                  return (
                    <button
                      key={chip}
                      type="button"
                      aria-pressed={active}
                      onClick={() => browser.setCategory(chip)}
                      className={cn(
                        "shrink-0 border-b-2 pb-2 text-[14px] font-medium whitespace-nowrap transition-colors @5xl:pb-2.5 @5xl:text-[15px]",
                        active ? "border-site-ink text-site-ink" : "border-transparent text-site-muted hover:text-site-ink",
                        FOCUS,
                      )}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
              <label className="order-1 flex w-full items-center gap-2.5 border border-site-ink bg-site-surface px-3.5 py-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-site-ink @3xl:order-2 @3xl:w-[220px] @3xl:py-2.5 @5xl:w-[300px] @5xl:gap-3 @5xl:px-4 @5xl:py-3">
                <span className="sr-only">Search products</span>
                <SearchNormal1 variant="Outline" aria-hidden className="size-[18px] shrink-0 text-site-muted" />
                <input
                  type="search"
                  value={browser.query}
                  onChange={(e) => browser.setQuery(e.target.value)}
                  placeholder={props.searchPlaceholder}
                  className="w-full min-w-0 bg-transparent text-[14px] text-site-ink outline-none placeholder:text-site-muted @5xl:text-[15px]"
                />
              </label>
            </div>
            <span aria-hidden className="-mt-1 hidden h-px w-full bg-site-border @3xl:block" />

            {browser.items.length === 0 ? (
              <EmptyProducts>
                {browser.query.trim()
                  ? `No products match “${browser.query.trim()}”. Try another word.`
                  : "No products in this category yet."}
              </EmptyProducts>
            ) : (
              <ul
                className={cn(
                  "grid grid-cols-2 gap-x-3 gap-y-5 @3xl:grid-cols-3 @3xl:gap-x-6 @3xl:gap-y-9 @5xl:gap-x-8 @5xl:gap-y-12",
                  DESKTOP_COLUMNS_CLASS[props.columns],
                )}
              >
                {browser.items.map((product, i) => (
                  <li key={`${product.name}-${i}`}>
                    <GridCard product={product} currency={site.currency} />
                  </li>
                ))}
              </ul>
            )}

            <Pagination
              shown={browser.items.length}
              total={browser.total}
              page={browser.page}
              totalPages={browser.totalPages}
              onPage={browser.setPage}
            />
          </>
        )}
      </div>
    </section>
  );
}

function GridCard({ product, currency }: { product: Product; currency: SiteRootProps["currency"] }) {
  return (
    <article className="flex flex-col gap-2.5 @3xl:gap-3 @5xl:gap-3.5">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-site-image bg-site-alt">
        <SiteImage src={product.imageUrl} alt={product.name} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
      </div>
      <span aria-hidden className="h-px w-full bg-site-ink" />
      <div className="flex items-start justify-between gap-2 text-site-ink">
        <h3 className="min-w-0 flex-1 font-site-heading text-[13px] leading-snug font-medium break-words @3xl:text-[16px] @5xl:text-[18px]">
          {product.name}
        </h3>
        <p className="shrink-0 font-site-display text-[12px] @3xl:text-[13px] @5xl:text-[14px]">{formatPrice(product.price, currency)}</p>
      </div>
      {product.description && <p className="text-[11px] text-site-muted @3xl:text-[13px] @5xl:text-[14px]">{product.description}</p>}
    </article>
  );
}

function Pagination({
  shown,
  total,
  page,
  totalPages,
  onPage,
}: {
  shown: number;
  total: number;
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  return (
    <nav aria-label="Product pages" className="flex flex-col gap-3.5 @5xl:gap-[18px]">
      <span aria-hidden className="h-px w-full bg-site-border" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={LABEL}>
          Showing {shown} of {total}
        </p>
        {totalPages > 1 && (
          <ul className="flex items-center gap-[18px] font-site-display text-[13px] @3xl:gap-5 @5xl:gap-6 @5xl:text-[14px]">
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i}>
                <button
                  type="button"
                  aria-label={`Page ${i + 1}`}
                  aria-current={i === page ? "page" : undefined}
                  onClick={() => onPage(i)}
                  className={cn(
                    "transition-colors",
                    i === page ? "text-site-ink underline underline-offset-4" : "text-site-muted hover:text-site-ink",
                    FOCUS,
                  )}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                aria-label="Next page"
                disabled={page >= totalPages - 1}
                onClick={() => onPage(page + 1)}
                className={cn("text-site-muted transition-colors hover:text-site-ink disabled:opacity-40 disabled:hover:text-site-muted", FOCUS)}
              >
                <span aria-hidden>→</span>
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ About */

function About(props: BlockRenderProps<AboutProps>) {
  const stats = props.stats.filter((s) => s.value || s.label);
  return (
    <section style={spacingStyle(props.spacing)} className="bg-site-bg pt-[calc(8px*var(--site-space))] pb-[calc(40px*var(--site-space))] @3xl:pt-[calc(48px*var(--site-space))] @3xl:pb-[calc(56px*var(--site-space))] @5xl:pt-[calc(64px*var(--site-space))] @5xl:pb-[calc(88px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-6 @3xl:gap-8 @5xl:gap-10")}>
        <span aria-hidden className="h-px w-full bg-site-border" />
        <div className={cn("flex flex-col gap-6 @3xl:gap-8 @5xl:gap-10", ALIGN_CLASS[props.align])}>
          {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
          {props.heading && (
            <h2 className="max-w-[1000px] font-site-heading text-[26px] leading-[1.2] font-medium tracking-[-0.01em] text-site-ink @3xl:text-[34px] @3xl:tracking-[-0.02em] @5xl:text-[44px] @5xl:leading-[1.18]">
              {props.heading}
            </h2>
          )}
          {props.body && <p className="max-w-[640px] text-[15px] leading-[1.6] text-site-muted @5xl:text-[17px]">{props.body}</p>}
        </div>

        {stats.length > 0 && (
          <dl className="flex flex-col border-t border-site-ink @3xl:grid @3xl:grid-cols-3 @3xl:gap-6 @3xl:border-t-0 @5xl:gap-8">
            {stats.map((stat, i) => (
              <div
                key={`${stat.value}-${i}`}
                className="flex items-center gap-4 border-b border-site-ink py-3.5 @3xl:flex-col-reverse @3xl:items-start @3xl:gap-2.5 @3xl:border-t @3xl:border-b-0 @3xl:pt-3.5 @3xl:pb-0 @5xl:gap-3 @5xl:pt-5"
              >
                <dt className="text-[13px] text-site-muted @5xl:text-[15px]">{stat.label}</dt>
                <dd className="order-first font-site-heading text-[30px] leading-none font-bold tracking-[-0.02em] text-site-ink @3xl:order-none @3xl:text-[36px] @5xl:text-[44px]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <figure className="flex flex-col gap-6 @3xl:gap-8 @5xl:gap-10">
          <div className="relative aspect-[358/220] w-full overflow-hidden rounded-site-image bg-site-alt @3xl:aspect-[740/300] @5xl:aspect-[16/5]">
            <SiteImage src={props.imageUrl} alt={props.caption || props.heading} sizes="(min-width: 1280px) 1152px, 100vw" />
          </div>
          {props.caption && <figcaption className={cn(LABEL, "text-[10px] @5xl:text-right")}>{props.caption}</figcaption>}
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Visit us */

type InfoRow = { label: string; value: string; href?: string };

function infoRows(site: SiteRootProps, withEmail: boolean): InfoRow[] {
  const phone = site.phones[0]?.number;
  const rows: (InfoRow | false)[] = [
    Boolean(site.hours) && { label: "Open today", value: site.hours },
    Boolean(site.address) && { label: "Find us", value: site.address },
    Boolean(phone) && { label: "Call", value: phone ?? "", href: telHref(phone ?? "") },
    withEmail && Boolean(site.email) && { label: "Email", value: site.email, href: mailtoHref(site.email) },
  ];
  return rows.filter((row): row is InfoRow => Boolean(row));
}

function InfoRows({ rows, stacked }: { rows: InfoRow[]; stacked?: boolean }) {
  if (rows.length === 0) return null;
  return (
    <dl className="flex flex-col border-t border-site-border">
      {rows.map((row) => (
        <div
          key={row.label}
          className={cn(
            "flex border-b border-site-border py-3.5",
            stacked ? "flex-col gap-1.5" : "items-center justify-between gap-4",
          )}
        >
          <dt className={LABEL}>{row.label}</dt>
          <dd className={cn("font-site-heading text-[15px] font-medium text-site-ink", stacked ? "@5xl:text-[17px]" : "text-right")}>
            {row.href ? (
              <a href={row.href} className={cn("break-all hover:underline", FOCUS)}>
                {row.value}
              </a>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function VisitUs(props: BlockRenderProps<VisitUsProps>) {
  const site = useSite();
  return (
    <section
      id={SECTION_ID.visit}
      style={spacingStyle(props.spacing)}
      className="scroll-mt-4 bg-site-bg pt-[calc(8px*var(--site-space))] pb-[calc(40px*var(--site-space))] @3xl:pb-[calc(56px*var(--site-space))] @5xl:pt-[calc(16px*var(--site-space))] @5xl:pb-[calc(88px*var(--site-space))]"
    >
      <div className={cn(CONTAINER, "flex flex-col gap-6 @5xl:gap-10")}>
        {(props.eyebrow || props.heading) && (
          <div className={cn("flex flex-col gap-2.5 @5xl:gap-3.5", ALIGN_CLASS[props.align])}>
            {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
            {props.heading && <h2 className={H2}>{props.heading}</h2>}
          </div>
        )}

        <div className="flex flex-col gap-6 @3xl:grid @3xl:grid-cols-[minmax(0,1fr)_340px] @3xl:items-start @3xl:gap-9 @5xl:grid-cols-[minmax(0,1fr)_400px] @5xl:items-stretch @5xl:gap-8">
          {/* Mobile + tablet: info rows beside / above the map (Figma tablet + mobile). */}
          <div className="flex flex-col gap-6 @5xl:hidden">
            <InfoRows rows={infoRows(site, true)} />
            {site.address && (
              <a
                href={directionsHref(site.address)}
                {...EXTERNAL_LINK}
                className={cn("self-start rounded-site-button text-[14px] font-medium text-site-ink underline underline-offset-4 hover:no-underline", FOCUS)}
              >
                Get directions <span aria-hidden>↗</span>
              </a>
            )}
          </div>
          <SiteMap className="h-[300px] border border-site-ink @3xl:aspect-square @3xl:h-auto @5xl:aspect-auto @5xl:h-full @5xl:min-h-[560px]" />
          <ContactPanel site={site} />
        </div>
      </div>
    </section>
  );
}

/** Replaces the Figma "Send us a message" form (websites have no forms): same card, CTA rows instead. */
function ContactPanel({ site }: { site: SiteRootProps }) {
  const phone = site.phones[0]?.number;
  const ctas = [
    phone && { label: "Call us", detail: phone, href: telHref(phone), icon: Call },
    site.email && { label: "Email us", detail: site.email, href: mailtoHref(site.email), icon: Sms },
    site.telegram && { label: "Message on Telegram", detail: `@${site.telegram}`, href: telegramHref(site.telegram), icon: Send2 },
    site.address && { label: "Get directions", detail: "Opens Google Maps", href: directionsHref(site.address), icon: Location },
  ].filter((cta): cta is { label: string; detail: string; href: string; icon: typeof Call } => Boolean(cta));

  return (
    <div className="hidden flex-col gap-5 border border-site-ink bg-site-surface p-8 @5xl:flex">
      <div className="flex flex-col gap-2">
        <h3 className="font-site-heading text-[28px] leading-tight font-bold text-site-ink">Get in touch</h3>
        <p className="text-[15px] text-site-muted">Product questions, trade-ins or a quick hello.</p>
        {site.statusText && (
          <span className="mt-1 flex items-center gap-1.5 self-start border border-site-ink px-2.5 py-1 font-site-display text-[11px] tracking-[0.04em] text-site-ink uppercase">
            <StatusDot className="size-1.5" />
            {site.statusText}
          </span>
        )}
      </div>
      <InfoRows rows={infoRows(site, false)} stacked />
      {ctas.length > 0 && (
        <ul className="mt-auto flex flex-col gap-2">
          {ctas.map((cta, i) => (
            <li key={cta.label}>
              <a
                {...linkProps(cta.href)}
                className={cn(
                  "group flex items-center gap-3 rounded-site-button border border-site-ink px-4 py-3 transition-colors",
                  i === 0 ? "bg-site-ink text-site-bg hover:opacity-90" : "bg-site-surface text-site-ink hover:bg-site-alt",
                  FOCUS,
                )}
              >
                <cta.icon variant="Outline" aria-hidden className="size-[18px] shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{cta.label}</span>
                  <span className={cn("block truncate text-[12px]", i === 0 ? "opacity-70" : "text-site-muted")}>{cta.detail}</span>
                </span>
                <ArrowRight variant="Outline" aria-hidden className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Footer */

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 @5xl:gap-2.5">
      <p className="font-site-display text-[10px] tracking-[0.06em] text-site-muted uppercase @5xl:text-[12px]">{title}</p>
      <ul className="flex flex-col gap-2 text-[12px] text-site-ink @3xl:text-[13px] @5xl:gap-2.5 @5xl:text-[14px]">{children}</ul>
    </div>
  );
}

function Footer(props: BlockRenderProps<FooterProps>) {
  const site = useSite();
  const socials = socialLinks(site);
  const hours = site.hoursDetail ? site.hoursDetail.split(" · ") : site.hours ? [site.hours] : [];
  const year = new Date().getFullYear();
  return (
    <footer style={spacingStyle(props.spacing)} className="bg-site-bg pb-[calc(28px*var(--site-space))] @3xl:pb-[calc(32px*var(--site-space))] @5xl:pb-[calc(40px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-5 @3xl:gap-6 @5xl:gap-9")}>
        <span aria-hidden className="h-px w-full bg-site-ink" />
        <div className="flex flex-col gap-5 pt-3 @3xl:flex-row @3xl:items-start @3xl:justify-between @3xl:pt-3.5 @5xl:pt-4">
          <div className={cn("flex flex-col gap-1.5 @3xl:gap-2 @5xl:gap-2.5", ALIGN_CLASS[props.align])}>
            <a href={`#${SECTION_ID.top}`} className={cn("font-site-heading text-[20px] font-bold text-site-ink @5xl:text-[24px]", FOCUS)}>
              <SiteLogo fallback={<span aria-hidden>▲ </span>} className="mr-[0.35em] size-[1.4em] align-[-0.4em]" />
              {site.businessName}
            </a>
            {props.tagline && <p className="text-[13px] text-site-muted @5xl:text-[14px]">{props.tagline}</p>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-5 @3xl:gap-8 @5xl:gap-16">
            {hours.length > 0 && (
              <FooterColumn title="Hours">
                {hours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </FooterColumn>
            )}
            {(site.email || site.phones.length > 0) && (
              <FooterColumn title="Contact">
                {site.email && (
                  <li>
                    <a href={mailtoHref(site.email)} className={cn("hover:underline", FOCUS)}>
                      {site.email}
                    </a>
                  </li>
                )}
                {site.phones.map((p) => (
                  <li key={p.number}>
                    <a href={telHref(p.number)} className={cn("hover:underline", FOCUS)}>
                      {p.number}
                    </a>
                  </li>
                ))}
              </FooterColumn>
            )}
            {socials.length > 0 && (
              <FooterColumn title="Follow">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} {...EXTERNAL_LINK} className={cn("hover:underline", FOCUS)}>
                      {s.label} <span aria-hidden>↗</span>
                    </a>
                  </li>
                ))}
              </FooterColumn>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 pt-0 font-site-display text-[9px] tracking-[0.04em] text-site-muted uppercase @3xl:flex-row @3xl:justify-between @3xl:pt-4 @3xl:text-[10px] @3xl:tracking-[0.06em] @5xl:pt-6 @5xl:text-[11px]">
          <p>
            © {year} {site.businessName}
          </p>
          <p>Made with WebBlock</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ Text (not in Figma) */

function Text(props: BlockRenderProps<TextProps>) {
  return (
    <section style={spacingStyle(props.spacing)} className="bg-site-bg py-[calc(40px*var(--site-space))] @3xl:py-[calc(56px*var(--site-space))] @5xl:py-[calc(72px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-6 @5xl:gap-8")}>
        <span aria-hidden className="h-px w-full bg-site-border" />
        <div className={cn("flex flex-col gap-2.5 @5xl:gap-3.5", ALIGN_CLASS[props.align])}>
          {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
          {props.heading && <h2 className={H2}>{props.heading}</h2>}
          {props.body && (
            <p className="mt-2 max-w-[680px] text-[15px] leading-[1.6] whitespace-pre-line text-site-muted @5xl:text-[17px]">{props.body}</p>
          )}
        </div>
      </div>
    </section>
  );
}

export const cleanMono: TemplateDesign = { Header, Hero, ProductCards, AllProducts, About, VisitUs, Footer, Text };
