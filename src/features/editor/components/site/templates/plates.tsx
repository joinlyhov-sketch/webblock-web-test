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
 * "Plates" (a small plate-lunch restaurant). Warm peach page, round plate photos, white rounded cards and one
 * orange accent. Widths: phone (<576), small tablet (576+), tablet (768+), desktop (1024+).
 */

const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 @3xl:px-10 @5xl:px-12";
const HEADING = "font-site-heading font-extrabold tracking-[-0.03em]";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";
const CARD = "rounded-[22px] bg-site-surface shadow-[0_6px_24px_-12px_rgba(120,70,30,0.18)] @5xl:rounded-[26px]";
/** Prices use the success green, as in the design. */
const PRICE_TEXT = "text-[color-mix(in_srgb,var(--site-success)_70%,var(--site-ink))]";
/** The accent orange fading to a warmer yellow: the big words, the buttons and the closing band. */
const ORANGE_GRADIENT = "bg-linear-to-br from-site-accent to-[color-mix(in_srgb,var(--site-accent)_55%,#ffc46b)]";
const ORANGE_TEXT = "bg-linear-to-r from-site-accent to-[color-mix(in_srgb,var(--site-accent)_60%,#ffb347)] bg-clip-text text-transparent";

/* ------------------------------------------------------------------ shared pieces */

/** "Plates for *everyday* life." → the starred words in the given style; with no stars, the last word. */
function AccentText({ text, accent }: { text: string; accent: string }) {
  const parts = text.split(/\*([^*]+)\*/);
  if (parts.length > 1) {
    return (
      <>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <span key={i} className={accent}>
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </>
    );
  }
  const words = text.trim().split(/\s+/);
  const last = words.pop() ?? "";
  return (
    <>
      {words.join(" ")}
      {words.length > 0 && " "}
      <span className={accent}>{last}</span>
    </>
  );
}

function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("w-fit text-[10px] font-bold tracking-[0.14em] text-site-accent uppercase @5xl:text-[11px]", className)}>{children}</span>;
}

function StatusDot() {
  return <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-site-success" />;
}

function PillLink({ tone, className, ...rest }: { tone: "orange" | "dark" | "light"; className?: string } & React.ComponentProps<"a">) {
  return (
    <a
      {...rest}
      className={cn(
        "inline-flex items-center justify-center rounded-site-button px-5 py-2.5 text-[12px] font-semibold whitespace-nowrap transition-opacity hover:opacity-90 @5xl:px-6 @5xl:py-3 @5xl:text-[13px]",
        tone === "orange" && cn(ORANGE_GRADIENT, "text-site-accent-fg shadow-[0_8px_18px_-8px_var(--site-accent)]"),
        tone === "dark" && "bg-site-ink text-site-bg",
        tone === "light" && "bg-site-surface text-site-ink shadow-sm",
        FOCUS,
        className,
      )}
    />
  );
}

function BrandMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("flex size-8 shrink-0 items-center justify-center rounded-full bg-site-accent-soft text-site-accent", className)}>
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ Header */

function Header() {
  const site = useSite();
  const links = [
    { label: "Home", href: `#${SECTION_ID.top}` },
    { label: "Menu", href: `#${SECTION_ID.shop}` },
    { label: "About", href: "#about" },
    { label: "Visit", href: `#${SECTION_ID.visit}` },
  ];
  return (
    <header id={SECTION_ID.top} className="bg-site-bg pt-3 @5xl:pt-4">
      <div className={CONTAINER}>
        <div className="flex items-center justify-between gap-3 rounded-full bg-site-surface py-2 pr-2 pl-3 shadow-[0_8px_30px_-14px_rgba(120,70,30,0.3)] @5xl:py-2.5 @5xl:pl-4">
          <a href={`#${SECTION_ID.top}`} className={cn("flex min-w-0 items-center gap-2.5 rounded-full", FOCUS)}>
            <SiteLogo fallback={<BrandMark />} className="size-8" />
            <span className="truncate text-[13px] font-bold text-site-ink @5xl:text-[14px]">{site.businessName}</span>
          </a>
          <nav aria-label="Main" className="hidden @3xl:block">
            <ul className="flex items-center">
              {links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={cn("block rounded-full px-4 py-2 text-[11px] font-medium text-site-ink hover:text-site-accent @5xl:px-5 @5xl:text-[12px]", FOCUS)}>
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
                className={cn("rounded-site-button px-5 py-2 text-[12px] font-semibold text-site-accent-fg transition-opacity hover:opacity-90 @5xl:px-6 @5xl:py-2.5 @5xl:text-[13px]", ORANGE_GRADIENT, FOCUS)}
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

/** Where the four round plates sit in the collage (percent of the box) and how wide they are. */
const PLATE_SPOTS = ["top-[4%] left-[2%] w-[26%]", "top-[16%] left-[22%] w-[56%]", "top-0 right-0 w-[30%]", "bottom-0 left-[16%] w-[34%]"];

function Hero(props: BlockRenderProps<HeroProps>) {
  const site = useSite();
  const chip = props.highlights.find((h) => h.text)?.text;
  const plates = props.sideImages.filter((c) => c.imageUrl).slice(0, 4);
  return (
    <section style={spacingStyle(props.spacing)} className="bg-site-bg pt-[calc(28px*var(--site-space))] pb-[calc(24px*var(--site-space))] @5xl:pt-[calc(44px*var(--site-space))] @5xl:pb-[calc(32px*var(--site-space))]">
      <div className={CONTAINER}>
        <div className="grid gap-8 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @3xl:items-center @5xl:gap-12">
          <div className={cn("flex flex-col gap-4 @5xl:gap-5", ALIGN_CLASS[props.align])}>
            {props.eyebrow && (
              <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-site-success-soft px-3 py-1 text-[10px] font-medium text-site-ink @5xl:text-[11px]">
                <StatusDot />
                {props.eyebrow}
              </span>
            )}
            <h1 className={cn(HEADING, "max-w-[520px] text-[44px] leading-[1] @xl:text-[56px] @5xl:text-[78px]")}>
              <AccentText text={props.heading.replace(/\n/g, " ")} accent={ORANGE_TEXT} />
            </h1>
            {props.description && <p className="max-w-[420px] text-[13px] leading-[1.65] text-site-muted @xl:text-[14px] @5xl:text-[15px]">{props.description}</p>}
            {(props.primaryLabel || props.secondaryLabel) && (
              <div className={cn("flex flex-wrap items-center gap-3", JUSTIFY_CLASS[props.align])}>
                {props.primaryLabel && (
                  <PillLink tone="orange" {...linkProps(ctaHref(props.primaryAction, site))}>
                    {props.primaryLabel}
                  </PillLink>
                )}
                {props.secondaryLabel && (
                  <PillLink tone="light" {...linkProps(ctaHref(props.secondaryAction, site))}>
                    {props.secondaryLabel}
                  </PillLink>
                )}
              </div>
            )}
          </div>

          {/* Four round plates inside a thin ring, with two small notes. */}
          {plates.length > 0 && (
            <div className="relative mx-auto aspect-square w-full max-w-[460px] @3xl:max-w-none">
              <span aria-hidden className="absolute inset-[6%] rounded-full border border-site-border" />
              {plates.map((plate, i) => (
                <div key={`${plate.imageUrl}-${i}`} className={cn("absolute", PLATE_SPOTS[i])}>
                  <div className="relative aspect-square overflow-hidden rounded-full bg-site-surface shadow-[0_14px_34px_-12px_rgba(90,50,20,0.35)] ring-[3px] ring-site-surface">
                    <SiteImage src={plate.imageUrl} alt={plate.label ?? ""} sizes="(min-width: 1024px) 280px, 50vw" priority={i === 0} className="object-contain" />
                  </div>
                </div>
              ))}
              {props.badge && (
                <span className="absolute top-[52%] left-0 rounded-full bg-site-surface px-3 py-1 text-[9px] font-semibold text-site-ink shadow-sm @5xl:text-[10px]">
                  {props.badge} <span aria-hidden className="text-site-accent">↓</span>
                </span>
              )}
              {chip && (
                <span className="absolute right-[2%] bottom-[14%] rounded-full bg-site-surface px-3 py-1 text-[9px] font-semibold text-site-ink shadow-sm @5xl:text-[10px]">
                  {chip} <span aria-hidden className="text-site-accent">●</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Products */

function ProductCard({ product, currency }: { product: Product; currency: SiteRootProps["currency"] }) {
  return (
    <article className={cn(CARD, "flex h-full flex-col gap-3 p-3 @5xl:p-4")}>
      <div className="relative aspect-square w-full overflow-hidden rounded-full">
        <SiteImage src={product.imageUrl} alt={product.name} sizes="(min-width: 1024px) 22vw, (min-width: 576px) 40vw, 80vw" className="object-contain" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-1">
        <h3 className="text-[13px] leading-tight font-bold text-site-ink @5xl:text-[14px]">{product.name}</h3>
        {product.description && <p className="text-[10px] leading-[1.5] text-site-muted @5xl:text-[11px]">{product.description}</p>}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 px-1">
        <p className={cn("text-[12px] font-bold @5xl:text-[13px]", PRICE_TEXT)}>{formatPrice(product.price, currency)}</p>
        <a
          href={`#${SECTION_ID.visit}`}
          aria-label={`Find ${product.name} in store`}
          className={cn("flex size-8 items-center justify-center rounded-full bg-site-accent text-site-accent-fg transition-opacity hover:opacity-85", FOCUS)}
        >
          <span aria-hidden>→</span>
        </a>
      </div>
    </article>
  );
}

function EmptyProducts({ children }: { children: ReactNode }) {
  return <p className="rounded-[22px] border border-dashed border-site-border px-6 py-12 text-center text-[14px] text-site-muted">{children}</p>;
}

function SectionTitle({ heading, eyebrow, align }: { heading: string; eyebrow: string; align: HeroProps["align"] }) {
  return (
    <div className={cn("flex flex-col gap-2", ALIGN_CLASS[align])}>
      {eyebrow && <Tag>{eyebrow}</Tag>}
      <h2 className={cn(HEADING, "text-[34px] leading-none text-site-ink @xl:text-[42px] @3xl:text-[48px] @5xl:text-[60px]")}>
        <AccentText text={heading} accent="text-site-subtle" />
      </h2>
    </div>
  );
}

function ProductCards(props: BlockRenderProps<ProductCardsProps>) {
  const site = useSite();
  return (
    <section id={SECTION_ID.shop} style={spacingStyle(props.spacing)} className="scroll-mt-4 bg-site-bg py-[calc(40px*var(--site-space))] @5xl:py-[calc(72px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-5 @5xl:gap-8")}>
        <SectionTitle heading={props.heading} eyebrow={props.eyebrow} align={props.align} />
        {props.products.length === 0 ? (
          <EmptyProducts>No featured products yet. Check back soon.</EmptyProducts>
        ) : (
          <ul className={cn("grid grid-cols-2 gap-3 @3xl:grid-cols-3 @3xl:gap-4 @5xl:gap-5", DESKTOP_COLUMNS_CLASS[props.columns])}>
            {props.products.map((product, i) => (
              <li key={`${product.name}-${i}`}>
                <ProductCard product={product} currency={site.currency} />
              </li>
            ))}
          </ul>
        )}
        {props.viewAllLabel && (
          <a href="#all-products" className={cn("w-fit text-[13px] font-semibold text-site-ink underline underline-offset-4", FOCUS)}>
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
    <section id="all-products" style={spacingStyle(props.spacing)} className="scroll-mt-4 bg-site-bg py-[calc(40px*var(--site-space))] @5xl:py-[calc(72px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-5 @5xl:gap-8")}>
        <SectionTitle heading={props.heading} eyebrow={props.eyebrow} align={props.align} />
        {props.products.length === 0 ? (
          <EmptyProducts>No products yet. Check back soon.</EmptyProducts>
        ) : (
          <>
            <div className="flex flex-col gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-between">
              {showChips ? (
                <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
                  {browser.chips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      aria-pressed={chip === browser.category}
                      onClick={() => browser.setCategory(chip)}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
                        chip === browser.category ? "bg-site-accent text-site-accent-fg" : "bg-site-surface text-site-ink hover:bg-site-alt",
                        FOCUS,
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              ) : (
                <span />
              )}
              <label className="flex w-full items-center rounded-full bg-site-surface px-4 py-2 focus-within:outline-2 focus-within:outline-site-accent @3xl:w-[260px]">
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
            {browser.items.length === 0 ? (
              <EmptyProducts>{browser.query.trim() ? `No products match “${browser.query.trim()}”.` : "No products in this category yet."}</EmptyProducts>
            ) : (
              <ul className={cn("grid grid-cols-2 gap-3 @3xl:grid-cols-3 @3xl:gap-4 @5xl:gap-5", DESKTOP_COLUMNS_CLASS[props.columns])}>
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
                        className={cn("size-8 rounded-full text-[12px] font-semibold", i === browser.page ? "bg-site-accent text-site-accent-fg" : "bg-site-surface text-site-ink hover:bg-site-alt", FOCUS)}
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
    <section id="about" style={spacingStyle(props.spacing)} className="scroll-mt-4 bg-site-bg py-[calc(20px*var(--site-space))] @5xl:py-[calc(32px*var(--site-space))]">
      <div className={CONTAINER}>
        <div className="grid items-center gap-6 overflow-hidden rounded-[26px] bg-linear-to-br from-site-alt to-site-bg p-6 @xl:p-8 @3xl:grid-cols-2 @3xl:rounded-[32px] @5xl:gap-12 @5xl:p-14">
          <div className="relative mx-auto aspect-square w-full max-w-[320px] @5xl:max-w-[400px]">
            <span aria-hidden className="absolute -inset-[8%] rounded-full border border-site-accent/15" />
            <span aria-hidden className="absolute -inset-[3%] rounded-full border border-site-accent/20" />
            <div className="relative size-full overflow-hidden rounded-full bg-site-surface shadow-[0_18px_40px_-16px_rgba(90,50,20,0.35)] ring-4 ring-site-surface">
              <SiteImage src={props.imageUrl} alt={props.caption || props.heading} sizes="(min-width: 768px) 400px, 80vw" className="object-contain" />
            </div>
          </div>
          <div className={cn("flex flex-col justify-center gap-4 @5xl:gap-5", ALIGN_CLASS[props.align])}>
            {props.eyebrow && <Tag>{props.eyebrow}</Tag>}
            <h2 className={cn(HEADING, "max-w-[360px] text-[32px] leading-[1.02] text-site-ink @xl:text-[40px] @5xl:text-[52px]")}>{props.heading}</h2>
            {props.body && <p className="max-w-[380px] text-[13px] leading-[1.65] text-site-muted @5xl:text-[14px]">{props.body}</p>}
            {name && (
              <p className="flex items-center gap-3">
                <span className={cn(HEADING, "text-[20px] text-site-ink @5xl:text-[24px]")}>{name}</span>
                {role && <span className="rounded-full bg-site-success-soft px-2.5 py-1 text-[8px] font-bold tracking-[0.1em] text-site-ink uppercase">{role}</span>}
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

function IconTile({ icon: Icon }: { icon: typeof Call }) {
  return (
    <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-site-accent-soft text-site-accent">
      <Icon variant="Outline" className="size-[18px]" />
    </span>
  );
}

function InfoCard({ icon, label, children, href }: { icon: typeof Call; label: string; children: ReactNode; href?: string }) {
  const body = (
    <>
      <IconTile icon={icon} />
      <span className="flex min-w-0 flex-col">
        <span className="text-[10px] text-site-muted">{label}</span>
        <span className="text-[13px] font-semibold break-words text-site-ink @5xl:text-[14px]">{children}</span>
      </span>
    </>
  );
  const cls = cn(CARD, "flex items-center gap-3 p-3.5 @5xl:p-4");
  return href ? (
    <a {...linkProps(href)} className={cn(cls, "transition-shadow hover:shadow-md", FOCUS)}>
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
    <section id={SECTION_ID.visit} style={spacingStyle(props.spacing)} className="scroll-mt-4 bg-site-bg py-[calc(40px*var(--site-space))] @5xl:py-[calc(64px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-5 @5xl:gap-8")}>
        <div className={cn("flex flex-col gap-2", ALIGN_CLASS[props.align])}>
          {props.eyebrow && <Tag>{props.eyebrow}</Tag>}
          {props.heading && (
            <h2 className={cn(HEADING, "text-[30px] leading-[1.05] text-site-ink @xl:text-[38px] @5xl:text-[52px]")}>
              <AccentText text={props.heading} accent="text-site-subtle" />
            </h2>
          )}
        </div>
        <div className="grid gap-4 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @5xl:gap-5">
          <div className="flex flex-col gap-3 @5xl:gap-4">
            {(site.hours || rows.length > 0) && (
              <div className={cn(CARD, "flex flex-col gap-3 p-4 @5xl:p-5")}>
                <div className="flex items-center gap-3">
                  <IconTile icon={Clock} />
                  <span className="flex flex-col">
                    <span className="text-[10px] text-site-muted">Opening hours</span>
                    {site.statusText && <span className="text-[13px] font-semibold text-site-ink @5xl:text-[14px]">{site.statusText}</span>}
                  </span>
                </div>
                {rows.length > 0 && (
                  <dl className="flex flex-col gap-1 text-[12px]">
                    {rows.map((row) => (
                      <div key={row.day} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2">
                        <dt className="text-site-muted">{row.day}</dt>
                        <dd className={cn("font-semibold", /closed/i.test(row.hours) ? "text-site-muted" : "text-site-ink")}>{row.hours}</dd>
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
          <div className="relative min-h-[280px] overflow-hidden rounded-[22px] @5xl:min-h-[380px] @5xl:rounded-[26px]">
            <SiteMap className="absolute inset-0" />
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
      <p className="text-[10px] font-bold tracking-[0.12em] text-site-accent uppercase">{title}</p>
      <ul className="flex flex-col gap-2 text-[12px] text-site-muted @5xl:text-[13px]">{children}</ul>
    </div>
  );
}

function Footer(props: BlockRenderProps<FooterProps>) {
  const site = useSite();
  const phone = site.phones[0]?.number;
  const rows = hourRows(site);
  const socials = socialLinks(site).filter((s) => s.label !== "Telegram");
  const year = new Date().getFullYear();
  const firstWord = site.businessName.trim().split(/\s+/)[0] ?? "";
  return (
    <footer style={spacingStyle(props.spacing)} className="overflow-hidden bg-site-bg pt-[calc(32px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-8 @5xl:gap-10")}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 @5xl:grid-cols-[1.4fr_0.8fr_1.2fr_1.2fr] @5xl:gap-x-8">
          <div className={cn("col-span-2 flex flex-col gap-3 @5xl:col-span-1", ALIGN_CLASS[props.align])}>
            <a href={`#${SECTION_ID.top}`} className={cn("flex items-center gap-2.5 rounded-full", FOCUS)}>
              <SiteLogo fallback={<BrandMark />} className="size-8" />
              <span className="text-[13px] font-bold text-site-ink">{site.businessName}</span>
            </a>
            {props.tagline && <p className="max-w-[230px] text-[12px] leading-[1.6] text-site-muted">{props.tagline}</p>}
          </div>
          <FooterColumn title="Explore">
            {[
              ["Home", `#${SECTION_ID.top}`],
              ["Menu", `#${SECTION_ID.shop}`],
              ["About", "#about"],
              ["Visit", `#${SECTION_ID.visit}`],
            ].map(([label, href]) => (
              <li key={label}>
                <a href={href} className={cn("hover:text-site-ink hover:underline", FOCUS)}>
                  {label}
                </a>
              </li>
            ))}
          </FooterColumn>
          {(phone || site.telegram || site.address || site.email) && (
            <FooterColumn title="Contact">
              {phone && (
                <li>
                  <a href={telHref(phone)} className={cn("hover:text-site-ink hover:underline", FOCUS)}>
                    {phone}
                  </a>
                </li>
              )}
              {site.email && (
                <li>
                  <a href={mailtoHref(site.email)} className={cn("break-all hover:text-site-ink hover:underline", FOCUS)}>
                    {site.email}
                  </a>
                </li>
              )}
              {site.telegram && (
                <li>
                  <a href={telegramHref(site.telegram)} {...EXTERNAL_LINK} className={cn("hover:text-site-ink hover:underline", FOCUS)}>
                    @{site.telegram}
                  </a>
                </li>
              )}
              {site.address && <li>{site.address}</li>}
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} {...EXTERNAL_LINK} className={cn("hover:text-site-ink hover:underline", FOCUS)}>
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
                  <span className={cn("font-semibold", /closed/i.test(row.hours) ? "text-site-accent" : "text-site-ink")}>{row.hours}</span>
                </li>
              ))}
            </FooterColumn>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-site-border pt-5 text-[11px] text-site-muted">
          <p>
            © {year} {site.businessName}. All rights reserved.
          </p>
          <a href={`#${SECTION_ID.top}`} className={cn("rounded-full bg-site-surface px-4 py-2 font-semibold text-site-ink shadow-sm hover:underline", FOCUS)}>
            Back to top <span aria-hidden>↑</span>
          </a>
        </div>
      </div>
      {/* The first word of the restaurant name, huge, outlined and cut off at the bottom. */}
      <p
        aria-hidden
        className={cn(HEADING, "mt-2 -mb-[0.28em] text-center text-[34cqw] leading-none whitespace-nowrap select-none", "text-transparent opacity-40 [-webkit-text-stroke:1.5px_var(--site-subtle)]")}
      >
        {firstWord}
      </p>
    </footer>
  );
}

/* ------------------------------------------------------------------ Text (the "Come taste them in store" band) */

function Text(props: BlockRenderProps<TextProps>) {
  const site = useSite();
  return (
    <section style={spacingStyle(props.spacing)} className="bg-site-bg py-[calc(20px*var(--site-space))] @5xl:py-[calc(32px*var(--site-space))]">
      <div className={CONTAINER}>
        <div className={cn("flex flex-col gap-5 rounded-[26px] p-6 text-site-ink @xl:p-8 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:rounded-[32px] @5xl:p-12", ORANGE_GRADIENT)}>
          <div className={cn("flex min-w-0 flex-col gap-2", ALIGN_CLASS[props.align])}>
            {props.eyebrow && <p className="text-[11px] text-site-ink/70">{props.eyebrow}</p>}
            {props.heading && <h2 className={cn(HEADING, "max-w-[560px] text-[30px] leading-[1.05] @xl:text-[38px] @5xl:text-[52px]")}>{props.heading}</h2>}
            {props.body && <p className="max-w-[460px] text-[13px] leading-[1.6] whitespace-pre-line text-site-ink/75">{props.body}</p>}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {site.address && (
              <PillLink tone="dark" {...linkProps(directionsHref(site.address))}>
                Get Directions
              </PillLink>
            )}
            <ContactDialog
              trigger={(open) => (
                <button
                  type="button"
                  onClick={open}
                  className={cn("rounded-site-button bg-site-surface/55 px-5 py-2.5 text-[12px] font-semibold text-site-ink transition-colors hover:bg-site-surface/80 @5xl:px-6 @5xl:py-3 @5xl:text-[13px]", FOCUS)}
                >
                  Contact Us
                </button>
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export const plates: TemplateDesign = { Header, Hero, ProductCards, AllProducts, About, VisitUs, Footer, Text };
