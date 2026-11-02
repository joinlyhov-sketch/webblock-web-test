"use client";

// Figma "Everyday store" (demo: Petal & Stem flower studio). Clean white store: navy buttons,
// borderless 4:3 product cards, text category tabs, drawn map with an overlaid info card.
import type { ReactNode } from "react";
import {
  ArrowLeft2,
  ArrowRight,
  ArrowRight2,
  Call,
  Clock,
  ExportSquare,
  Location,
  SearchNormal1,
  Send2,
  Sms,
} from "iconsax-reactjs";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Align, Product } from "../../../types";
import { ContactDialog } from "../contact-dialog";
import { ALIGN_CLASS, DESKTOP_COLUMNS_CLASS, JUSTIFY_CLASS, spacingStyle, useSite } from "../site-context";
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
import { SiteImage } from "../site-image";
import { SiteMap } from "../site-map";
import { useProductBrowser } from "../use-product-browser";
import type { BlockRenderProps, TemplateDesign } from "./types";
import { SiteLogo } from "../site-logo";
import type {
  AboutProps,
  AllProductsProps,
  FooterProps,
  HeroProps,
  ProductCardsProps,
  TextProps,
  VisitUsProps,
} from "../../../types";

/* ------------------------------------------------------------------ shared pieces */

const CONTAINER = "mx-auto w-full max-w-[1280px] px-5 @3xl:px-10 @5xl:px-16";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";
const PRIMARY_BUTTON = cn(
  "inline-flex items-center justify-center gap-2 rounded-site-button bg-site-accent px-5 py-2.5 text-[14px] font-semibold text-site-accent-fg transition-opacity hover:opacity-90",
  FOCUS,
);
const TEXT_LINK = cn(
  "inline-flex items-center gap-1.5 text-[14px] font-semibold text-site-ink underline decoration-1 underline-offset-4 transition-colors hover:text-site-accent",
  FOCUS,
);

function Brand({ className }: { className?: string }) {
  const site = useSite();
  return (
    <span className={cn("block min-w-0 truncate font-site-heading font-bold text-site-ink", className)}>
      <SiteLogo fallback={<span aria-hidden>❀ </span>} className="mr-[0.35em] size-[1.4em] align-[-0.4em]" />
      {site.businessName}
    </span>
  );
}

function Eyebrow({ children, className }: { children: string; className?: string }) {
  if (!children) return null;
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-site-accent-soft px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-site-accent uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

function SectionHeading({ children, className }: { children: string; className?: string }) {
  return (
    <h2
      className={cn(
        "font-site-heading text-[28px] leading-[1.1] font-semibold tracking-[-0.01em] text-site-ink @3xl:text-[32px] @5xl:text-[36px]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

function StatusBadge({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full bg-site-success-soft px-2.5 py-1 text-[12px] font-medium text-site-success",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-site-success" />
      <span className="truncate">{text}</span>
    </span>
  );
}

function ProductTile({ product, sizes }: { product: Product; sizes: string }) {
  const site = useSite();
  return (
    <article className="flex min-w-0 flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-site-image bg-site-alt">
        <SiteImage src={product.imageUrl} alt={product.name} sizes={sizes} />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-site-heading text-[14px] leading-snug font-semibold text-site-ink @5xl:text-[15px]">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-0.5 text-[12px] leading-snug text-site-muted">{product.description}</p>
          )}
        </div>
        <p className="shrink-0 text-[13px] font-semibold text-site-ink @5xl:text-[14px]">
          {formatPrice(product.price, site.currency)}
        </p>
      </div>
    </article>
  );
}

function EmptyMessage({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-site-card border border-dashed border-site-border bg-site-alt px-6 py-12 text-center text-[14px] text-site-muted">
      {children}
    </p>
  );
}

const SECTION_Y = "py-[calc(56px*var(--site-space))] @5xl:py-[calc(88px*var(--site-space))]";

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
      <div className={cn(CONTAINER, "flex h-16 items-center justify-between gap-4 @5xl:h-[72px]")}>
        <a href={`#${SECTION_ID.top}`} className={cn("rounded-sm", FOCUS)}>
          <Brand className="text-[17px] @5xl:text-[19px]" />
        </a>
        <div className="flex items-center gap-5">
          <nav aria-label="Main" className="hidden items-center gap-6 @3xl:flex">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn("text-[14px] font-medium text-site-muted transition-colors hover:text-site-ink", FOCUS)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          {site.statusText && (
            <span className="hidden items-center gap-1.5 text-[12px] font-medium whitespace-nowrap text-site-success @5xl:inline-flex">
              <span aria-hidden className="size-1.5 rounded-full bg-site-success" />
              {site.statusText}
            </span>
          )}
          <ContactDialog
            trigger={(open) => (
              <button type="button" onClick={open} className={cn(PRIMARY_BUTTON, "px-4 py-2 text-[13px] @5xl:px-7 @5xl:text-[14px]")}>
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
  return (
    <section style={spacingStyle(props.spacing)} className="pt-[calc(24px*var(--site-space))] pb-[calc(56px*var(--site-space))] @5xl:pt-[calc(16px*var(--site-space))] @5xl:pb-[calc(88px*var(--site-space))]">
      <div className={cn(CONTAINER, "grid items-center gap-8 @3xl:grid-cols-2 @3xl:gap-10 @5xl:gap-16")}>
        <div className={cn("flex flex-col gap-5", ALIGN_CLASS[props.align])}>
          {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
          <h1 className="font-site-heading text-[36px] leading-[1.04] font-bold tracking-[-0.01em] whitespace-pre-line text-site-ink @3xl:text-[44px] @5xl:text-[60px]">
            {props.heading}
          </h1>
          {props.description && (
            <p className="max-w-[440px] text-[15px] leading-[1.6] text-site-muted @5xl:text-[16px]">{props.description}</p>
          )}
          <div
            className={cn(
              "flex w-full flex-col items-stretch gap-4 pt-1 @3xl:w-auto @3xl:flex-row @3xl:items-center @3xl:gap-6",
              JUSTIFY_CLASS[props.align],
            )}
          >
            {props.primaryLabel && (
              <a {...linkProps(ctaHref(props.primaryAction, site))} className={cn(PRIMARY_BUTTON, "py-3 @3xl:py-2.5")}>
                {props.primaryLabel}
              </a>
            )}
            {props.secondaryLabel && (
              <a {...linkProps(ctaHref(props.secondaryAction, site))} className={cn(TEXT_LINK, "justify-center")}>
                {props.secondaryLabel}
              </a>
            )}
          </div>
        </div>
        <div className="relative aspect-[3/2] overflow-hidden rounded-site-image bg-site-alt @3xl:aspect-[5/4]">
          <SiteImage
            src={props.imageUrl}
            alt={props.heading}
            sizes="(min-width: 1024px) 600px, (min-width: 768px) 50vw, 100vw"
            priority
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Product cards */

function ProductCards(props: BlockRenderProps<ProductCardsProps>) {
  const isCentered = props.align === "center";
  return (
    <section style={spacingStyle(props.spacing)} className={SECTION_Y}>
      <div className={CONTAINER}>
        <div
          className={cn(
            "flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between",
            isCentered && "@3xl:flex-col @3xl:items-center",
            props.align === "right" && "@3xl:flex-row-reverse",
          )}
        >
          <div className={cn("flex flex-col gap-3", ALIGN_CLASS[props.align])}>
            {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
            <SectionHeading>{props.heading}</SectionHeading>
          </div>
          {props.viewAllLabel && (
            <a href={`#${SECTION_ID.shop}`} className={cn(TEXT_LINK, "text-[13px]", ALIGN_CLASS[props.align])}>
              {props.viewAllLabel}
              <ArrowRight aria-hidden className="size-3.5" />
            </a>
          )}
        </div>

        <div className="mt-8 @5xl:mt-10">
          {props.products.length === 0 ? (
            <EmptyMessage>New picks are on their way. Check back soon.</EmptyMessage>
          ) : (
            <div
              className={cn(
                // Mobile: swipeable row. Tablet/desktop: grid.
                "-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2",
                "@3xl:mx-0 @3xl:grid @3xl:grid-cols-3 @3xl:gap-5 @3xl:overflow-visible @3xl:px-0 @3xl:pb-0",
                DESKTOP_COLUMNS_CLASS[props.columns],
              )}
            >
              {props.products.map((product, i) => (
                <div key={`${product.name}-${i}`} className="w-[72%] shrink-0 snap-start @3xl:w-auto">
                  <ProductTile product={product} sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 72vw" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ All products */

function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const set = new Set([0, 1, 2, total - 3, total - 2, total - 1, current - 1, current, current + 1]);
  const pages = [...set].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const stepClass = cn(
    "inline-flex h-9 items-center gap-1.5 rounded-site-button border border-site-border px-2.5 text-[13px] font-medium text-site-ink transition-colors hover:bg-site-alt disabled:cursor-not-allowed disabled:text-site-subtle disabled:hover:bg-transparent @3xl:px-3",
    FOCUS,
  );
  return (
    <div className="mt-10 flex flex-col items-center gap-4 @3xl:flex-row @3xl:justify-between">
      <p className="text-[13px] text-site-muted">
        Page <span className="font-semibold text-site-ink">{page + 1}</span> of {totalPages}
      </p>
      <nav aria-label="Products pages" className="flex items-center gap-1">
        <button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => onChange(page - 1)} className={stepClass}>
          <ArrowLeft2 aria-hidden className="size-3.5" />
          <span className="hidden @3xl:inline">Previous</span>
        </button>
        {pageList(page, totalPages).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} aria-hidden className="w-6 text-center text-[13px] text-site-subtle">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-label={`Page ${p + 1}`}
              aria-current={p === page ? "page" : undefined}
              onClick={() => onChange(p)}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-site-button text-[13px] font-medium transition-colors",
                p === page ? "bg-site-accent text-site-accent-fg" : "text-site-muted hover:bg-site-alt hover:text-site-ink",
                FOCUS,
              )}
            >
              {p + 1}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages - 1}
          onClick={() => onChange(page + 1)}
          className={stepClass}
        >
          <span className="hidden @3xl:inline">Next</span>
          <ArrowRight2 aria-hidden className="size-3.5" />
        </button>
      </nav>
    </div>
  );
}

function AllProducts(props: BlockRenderProps<AllProductsProps>) {
  const browser = useProductBrowser(props.products, props.categories, props.pageSize);
  const searchId = `${props.id}-search`;
  return (
    <section id={SECTION_ID.shop} style={spacingStyle(props.spacing)} className={cn(SECTION_Y, "scroll-mt-4")}>
      <div className={CONTAINER}>
        <div className={cn("flex flex-col gap-3", ALIGN_CLASS[props.align])}>
          {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
          <SectionHeading>{props.heading}</SectionHeading>
        </div>

        <div className="mt-6 flex flex-col gap-4 @5xl:mt-7 @5xl:flex-row @5xl:items-center @5xl:justify-between">
          <div className="relative w-full @5xl:w-[320px]">
            <label htmlFor={searchId} className="sr-only">
              Search products
            </label>
            <SearchNormal1 aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-site-muted" />
            <input
              id={searchId}
              type="search"
              value={browser.query}
              onChange={(e) => browser.setQuery(e.target.value)}
              placeholder={props.searchPlaceholder}
              className={cn(
                "h-11 w-full rounded-site-card border border-site-border bg-site-alt pr-4 pl-10 text-[14px] text-site-ink placeholder:text-site-muted @5xl:h-10",
                FOCUS,
              )}
            />
          </div>
          {browser.chips.length > 1 && (
            <div role="group" aria-label="Categories" className="-mx-5 flex gap-6 overflow-x-auto px-5 @5xl:mx-0 @5xl:px-0">
              {browser.chips.map((chip) => {
                const active = chip === browser.category;
                return (
                  <button
                    key={chip}
                    type="button"
                    aria-pressed={active}
                    onClick={() => browser.setCategory(chip)}
                    className={cn(
                      "relative shrink-0 pb-2 text-[14px] font-medium whitespace-nowrap transition-colors",
                      active
                        ? "text-site-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-site-accent"
                        : "text-site-muted hover:text-site-ink",
                      FOCUS,
                    )}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-7">
          {props.products.length === 0 ? (
            <EmptyMessage>Products will appear here soon.</EmptyMessage>
          ) : browser.total === 0 ? (
            <EmptyMessage>
              No products match{browser.query ? <> “{browser.query}”</> : " this category"}. Try another search or category.
            </EmptyMessage>
          ) : (
            <>
              <div className={cn("grid grid-cols-2 gap-x-3 gap-y-6 @3xl:grid-cols-3 @3xl:gap-x-5 @3xl:gap-y-9", DESKTOP_COLUMNS_CLASS[props.columns])}>
                {browser.items.map((product, i) => (
                  <ProductTile
                    key={`${product.name}-${i}`}
                    product={product}
                    sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 50vw"
                  />
                ))}
              </div>
              {browser.totalPages > 1 && (
                <Pagination page={browser.page} totalPages={browser.totalPages} onChange={browser.setPage} />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ About */

function About(props: BlockRenderProps<AboutProps>) {
  return (
    <section style={spacingStyle(props.spacing)} className={SECTION_Y}>
      <div className={cn(CONTAINER, "grid items-center gap-8 @3xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] @3xl:gap-12 @5xl:gap-16")}>
        <div className="relative aspect-[3/2] overflow-hidden rounded-site-image bg-site-alt @3xl:aspect-[4/3]">
          <SiteImage src={props.imageUrl} alt={props.heading} sizes="(min-width: 1024px) 520px, (min-width: 768px) 45vw, 100vw" />
        </div>
        <div className={cn("flex flex-col gap-4", ALIGN_CLASS[props.align])}>
          {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
          <SectionHeading>{props.heading}</SectionHeading>
          {props.body && (
            <p className="max-w-[600px] text-[15px] leading-[1.6] whitespace-pre-line text-site-muted">{props.body}</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Visit us */

function InfoRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-site-accent-soft text-site-accent">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[12px] text-site-muted">{label}</span>
        <span className="block text-[14px] leading-snug text-site-ink">{children}</span>
      </span>
    </li>
  );
}

function InfoCard({ className }: { className?: string }) {
  const site = useSite();
  const phone = site.phones[0]?.number;
  return (
    <div className={cn("rounded-site-card bg-site-surface p-5 shadow-[0_8px_24px_-6px] shadow-site-ink/15", className)}>
      <h3 className="font-site-heading text-[20px] font-semibold text-site-ink">{site.businessName}</h3>
      <StatusBadge text={site.statusText} className="mt-2" />
      <hr className="my-4 border-site-border" />
      <ul className="flex flex-col gap-4">
        {site.address && (
          <InfoRow icon={<Location aria-hidden className="size-3.5" />} label="Address">
            {site.address}
          </InfoRow>
        )}
        {(site.hours || site.hoursDetail) && (
          <InfoRow icon={<Clock aria-hidden className="size-3.5" />} label="Opening hours">
            {site.hoursDetail || site.hours}
          </InfoRow>
        )}
        {phone && (
          <InfoRow icon={<Call aria-hidden className="size-3.5" />} label="Call us">
            <a href={telHref(phone)} className={cn("hover:text-site-accent", FOCUS)}>
              {phone}
            </a>
          </InfoRow>
        )}
        {site.email && (
          <InfoRow icon={<Sms aria-hidden className="size-3.5" />} label="Email">
            <a href={mailtoHref(site.email)} className={cn("break-all hover:text-site-accent", FOCUS)}>
              {site.email}
            </a>
          </InfoRow>
        )}
      </ul>
      {site.address && (
        <a
          href={directionsHref(site.address)}
          {...EXTERNAL_LINK}
          className={cn(PRIMARY_BUTTON, "mt-5 w-full")}
        >
          Get directions
          <ExportSquare aria-hidden className="size-4" />
        </a>
      )}
    </div>
  );
}

/** Replaces the Figma message form (websites have no forms): same card, direct contact buttons. */
function ReachUsPanel() {
  const site = useSite();
  const phone = site.phones[0]?.number;
  const actions = [
    phone && { icon: Call, label: "Call us", value: phone, href: telHref(phone) },
    site.email && { icon: Sms, label: "Email us", value: site.email, href: mailtoHref(site.email) },
    site.telegram && { icon: Send2, label: "Message on Telegram", value: `@${site.telegram}`, href: telegramHref(site.telegram) },
    site.address && { icon: Location, label: "Get directions", value: site.address, href: directionsHref(site.address) },
  ].filter((a): a is { icon: typeof Call; label: string; value: string; href: string } => Boolean(a));

  return (
    <div className="flex flex-col rounded-site-card border border-site-border bg-site-surface p-6 @5xl:p-7">
      <h3 className="font-site-heading text-[22px] font-semibold text-site-ink">Get in touch</h3>
      <p className="mt-1 text-[13px] text-site-muted">Custom bouquets, events or a quick question.</p>
      <ul className="mt-5 flex flex-1 flex-col gap-3">
        {actions.map((action, i) => (
          <li key={action.label}>
            <a
              {...linkProps(action.href)}
              className={cn(
                "flex items-center gap-3 rounded-site-button px-4 py-3 transition-colors",
                i === 0
                  ? "bg-site-accent text-site-accent-fg hover:opacity-90"
                  : "border border-site-border bg-site-alt text-site-ink hover:bg-site-accent-soft",
                FOCUS,
              )}
            >
              <action.icon aria-hidden className="size-5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold">{action.label}</span>
                <span className={cn("block truncate text-[12px]", i === 0 ? "opacity-80" : "text-site-muted")}>
                  {action.value}
                </span>
              </span>
              <ArrowRight aria-hidden className="size-4 shrink-0" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center text-[12px] text-site-muted">We usually reply within a day.</p>
    </div>
  );
}

function VisitUs(props: BlockRenderProps<VisitUsProps>) {
  return (
    <section
      id={SECTION_ID.visit}
      style={spacingStyle(props.spacing)}
      className="scroll-mt-4 bg-site-alt py-[calc(56px*var(--site-space))] @5xl:py-[calc(72px*var(--site-space))]"
    >
      <div className={CONTAINER}>
        <div className={cn("flex flex-col gap-3", ALIGN_CLASS[props.align])}>
          {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
          <SectionHeading>{props.heading}</SectionHeading>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 @5xl:mt-10 @5xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex flex-col gap-5">
            <SiteMap pin="end" className="h-[240px] rounded-site-card @3xl:h-[320px] @5xl:h-full @5xl:min-h-[520px]">
              <InfoCard className="absolute bottom-5 left-5 hidden w-[320px] @5xl:block" />
            </SiteMap>
            <InfoCard className="@5xl:hidden" />
          </div>
          <ReachUsPanel />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Footer */

function Footer(props: BlockRenderProps<FooterProps>) {
  const site = useSite();
  const phone = site.phones[0]?.number;
  const links = socialLinks(site);
  const contactBits = [site.email, phone, site.address].filter(Boolean);
  return (
    <footer
      style={spacingStyle(props.spacing)}
      className="border-t border-site-border bg-site-bg py-[calc(32px*var(--site-space))] @5xl:py-[calc(36px*var(--site-space))]"
    >
      <div
        className={cn(
          CONTAINER,
          "flex flex-col gap-4 @5xl:grid @5xl:grid-cols-[1fr_auto_1fr] @5xl:items-start",
          ALIGN_CLASS[props.align],
        )}
      >
        <div className={cn("flex flex-col gap-1", ALIGN_CLASS[props.align], "@5xl:items-start @5xl:text-left")}>
          <Brand className="text-[15px]" />
          {props.tagline && <p className="text-[12px] text-site-muted">{props.tagline}</p>}
        </div>
        <div className={cn("flex flex-col gap-1.5", ALIGN_CLASS[props.align], "@5xl:items-center @5xl:text-center")}>
          {contactBits.length > 0 && <p className="text-[13px] text-site-muted">{contactBits.join(" · ")}</p>}
          {site.hoursDetail && <p className="text-[12px] text-site-muted">{site.hoursDetail}</p>}
          {links.length > 0 && (
            <ul className={cn("mt-1 flex flex-wrap gap-4", JUSTIFY_CLASS[props.align], "@5xl:justify-center")}>
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...EXTERNAL_LINK}
                    className={cn("inline-flex items-center gap-1 text-[13px] font-medium text-site-ink hover:text-site-accent", FOCUS)}
                  >
                    {link.label}
                    <ExportSquare aria-hidden className="size-3" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-[12px] text-site-muted @5xl:text-right @5xl:text-[13px]">Made with WebBlock</p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ Text */

function Text(props: BlockRenderProps<TextProps>) {
  const width: Record<Align, string> = { left: "", center: "mx-auto", right: "ml-auto" };
  return (
    <section style={spacingStyle(props.spacing)} className={SECTION_Y}>
      <div className={CONTAINER}>
        <div className={cn("flex max-w-[720px] flex-col gap-4", width[props.align], ALIGN_CLASS[props.align])}>
          {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
          <SectionHeading>{props.heading}</SectionHeading>
          {props.body && <p className="text-[15px] leading-[1.6] whitespace-pre-line text-site-muted">{props.body}</p>}
        </div>
      </div>
    </section>
  );
}

export const everydayStore: TemplateDesign = {
  Header,
  Hero,
  ProductCards,
  AllProducts,
  About,
  VisitUs,
  Footer,
  Text,
};
