"use client";

import { useRef, type ReactNode } from "react";
import { ArrowLeft2, ArrowRight2, Call, Clock, Location, Send2 } from "iconsax-reactjs";
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
 * "Keyboards" (a small keyboard shop). Near-black page, wide Syne headlines with one violet word,
 * mono labels, hairline cards with coloured glows behind the photos. Product tags live in the product
 * description after a "|": "A compact board. | Tenkeyless | RGB backlight".
 */

const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 @3xl:px-10 @5xl:px-16";
const LABEL = "font-site-display text-[10px] tracking-[0.12em] uppercase text-site-muted @5xl:text-[11px]";
const HEADING = "font-site-heading font-extrabold tracking-[-0.03em] text-site-ink";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";
const CARD = "rounded-[20px] border border-site-border bg-site-surface @5xl:rounded-[24px]";
/** Glow colours behind product photos, one per card (theme tints). */
const GLOWS = ["var(--site-tint-1)", "var(--site-tint-2)", "var(--site-tint-3)", "var(--site-tint-4)"];

/* ------------------------------------------------------------------ shared pieces */

/** Last `n` words in the accent colour ("good keyboards." / "life."). */
function AccentHeading({
  text,
  accentWords,
  className,
  as: Tag = "h2",
}: {
  text: string;
  accentWords?: number;
  className?: string;
  as?: "h1" | "h2";
}) {
  const words = text.trim().split(/\s+/);
  const n = Math.min(words.length, accentWords ?? Math.max(1, Math.floor(words.length / 2)));
  const split = words.length - n;
  return (
    <Tag className={cn(HEADING, "leading-[1.02]", className)}>
      {words.slice(0, split).join(" ")}
      {split > 0 && " "}
      <span className="text-site-accent">{words.slice(split).join(" ")}</span>
    </Tag>
  );
}

function StatusDot({ className }: { className?: string }) {
  return <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full bg-site-success ring-2 ring-site-success/30", className)} />;
}

function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-site-border px-2.5 py-1 text-[10px] text-site-muted @5xl:text-[11px]", className)}>
      {children}
    </span>
  );
}

function Pill({
  tone,
  className,
  ...rest
}: { tone: "light" | "outline"; className?: string } & React.ComponentProps<"a">) {
  return (
    <a
      {...rest}
      className={cn(
        "inline-flex items-center justify-center rounded-site-button px-5 py-2.5 text-[12px] font-semibold whitespace-nowrap transition-opacity hover:opacity-85 @5xl:px-6 @5xl:py-3 @5xl:text-[13px]",
        tone === "light" ? "bg-site-ink text-site-bg" : "border border-site-border text-site-ink hover:border-site-ink",
        FOCUS,
        className,
      )}
    />
  );
}

/** "A compact board. | Tenkeyless | RGB backlight" → the sentence and its tags. */
function splitDescription(description: string): { text: string; tags: string[] } {
  const [text, ...tags] = description.split("|").map((part) => part.trim());
  return { text: text ?? "", tags: tags.filter(Boolean) };
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
    <header id={SECTION_ID.top} className="bg-site-bg">
      <div className={cn(CONTAINER, "flex items-center justify-between gap-4 py-4 @5xl:py-5")}>
        <a href={`#${SECTION_ID.top}`} className={cn("flex min-w-0 items-center gap-2.5 rounded-full", FOCUS)}>
          <SiteLogo fallback={<span aria-hidden className="size-2 shrink-0 rounded-full bg-site-accent" />} className="size-7" />
          <span className="truncate font-site-display text-[12px] font-bold tracking-[0.08em] text-site-ink uppercase @5xl:text-[13px]">
            {site.businessName}
          </span>
        </a>
        <nav aria-label="Main" className="hidden rounded-full border border-site-border bg-site-surface/70 px-2 @3xl:block">
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
              className={cn(
                "rounded-site-button border border-site-ink px-4 py-2 text-[12px] font-semibold text-site-ink transition-colors hover:bg-site-ink hover:text-site-bg @5xl:px-5 @5xl:text-[13px]",
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

function Hero(props: BlockRenderProps<HeroProps>) {
  const site = useSite();
  // First line of the description is the bold "Picked with care." lead-in.
  const [lead, ...rest] = props.description.split("\n");
  const hasLead = rest.length > 0 && lead.trim() !== "";
  const paragraph = hasLead ? rest.join(" ") : props.description;
  return (
    <section style={spacingStyle(props.spacing)} className="overflow-hidden bg-site-bg">
      <div className={cn(CONTAINER, "flex flex-col gap-6 pt-[calc(16px*var(--site-space))] pb-[calc(48px*var(--site-space))] @5xl:gap-8 @5xl:pt-[calc(24px*var(--site-space))] @5xl:pb-[calc(88px*var(--site-space))]", ALIGN_CLASS[props.align])}>
        {props.eyebrow && (
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-site-border bg-site-surface/70 px-3.5 py-1.5 text-center font-site-display text-[9px] @xl:text-[10px] tracking-[0.1em] text-site-ink uppercase @5xl:text-[11px]">
            <StatusDot />
            {props.eyebrow}
          </span>
        )}
        <AccentHeading
          as="h1"
          text={props.heading.replace(/\n/g, " ")}
          accentWords={1}
          className={cn("max-w-[880px] text-[34px] text-balance @xl:text-[46px] @3xl:text-[60px] @5xl:text-[92px]", props.align === "center" && "mx-auto")}
        />
        {/* The photo floats on two soft glows (blue left, green right). */}
        <div className="relative mx-auto aspect-[16/8] w-full max-w-[860px]">
          <div aria-hidden className="absolute top-[10%] -left-[6%] size-[55%] rounded-full bg-site-tint-2 opacity-70 blur-[90px]" />
          <div aria-hidden className="absolute -right-[6%] bottom-0 size-[50%] rounded-full bg-site-tint-3 opacity-70 blur-[90px]" />
          <SiteImage src={props.imageUrl} alt={props.heading.replace(/\n/g, " ")} sizes="(min-width: 1024px) 860px, 100vw" className="object-contain" priority />
        </div>
        {paragraph && (
          <p className="max-w-[460px] text-[13px] leading-[1.6] text-site-muted @xl:text-[14px] @5xl:text-[16px]">
            {hasLead && <strong className="font-semibold text-site-ink">{lead} </strong>}
            {paragraph}
          </p>
        )}
        {(props.primaryLabel || props.secondaryLabel) && (
          <div className={cn("flex flex-wrap items-center gap-3", JUSTIFY_CLASS[props.align])}>
            {props.primaryLabel && (
              <Pill tone="light" {...linkProps(ctaHref(props.primaryAction, site))}>
                {props.primaryLabel}
              </Pill>
            )}
            {props.secondaryLabel && (
              <Pill tone="outline" {...linkProps(ctaHref(props.secondaryAction, site))}>
                {props.secondaryLabel}
              </Pill>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Products */

function ProductCard({ product, index, currency }: { product: Product; index: number; currency: SiteRootProps["currency"] }) {
  const { text, tags } = splitDescription(product.description);
  return (
    <article className={cn(CARD, "flex h-full flex-col gap-4 p-3 @5xl:gap-5 @5xl:p-4")}>
      <div
        className="relative flex flex-col overflow-hidden rounded-[14px] p-3 @5xl:rounded-[18px] @5xl:p-4"
        style={{ backgroundImage: `radial-gradient(70% 80% at 50% 35%, color-mix(in srgb, ${GLOWS[index % GLOWS.length]} 70%, transparent), transparent 75%)` }}
      >
        <div className="relative z-10 flex items-center justify-between gap-2 font-site-display text-[10px] tracking-[0.1em] uppercase">
          <span className="rounded-full border border-site-border bg-site-bg/60 px-2.5 py-1 text-site-ink">No. {String(index + 1).padStart(2, "0")}</span>
          {product.category && <span className="truncate text-site-muted">{product.category}</span>}
        </div>
        <div className="relative aspect-[16/9] w-full">
          <SiteImage src={product.imageUrl} alt={product.name} sizes="(min-width: 1024px) 480px, 85vw" className="object-contain" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-1 pb-1 @5xl:px-2">
        <h3 className={cn(HEADING, "text-[22px] leading-tight @5xl:text-[30px]")}>{product.name}</h3>
        {text && <p className="text-[12px] leading-[1.6] text-site-muted @5xl:text-[13px]">{text}</p>}
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li key={tag}>
                <Chip>{tag}</Chip>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <a href={`#${SECTION_ID.visit}`} aria-label={`Find ${product.name} in store`} className={cn("rounded-full bg-site-ink px-5 py-2 text-[12px] font-semibold text-site-bg transition-opacity hover:opacity-85", FOCUS)}>
            View
          </a>
          <p className="font-site-display text-[13px] text-site-ink @5xl:text-[14px]">{formatPrice(product.price, currency)}</p>
        </div>
      </div>
    </article>
  );
}

function EmptyProducts({ children }: { children: ReactNode }) {
  return <p className="rounded-[20px] border border-dashed border-site-border px-6 py-12 text-center text-[14px] text-site-muted">{children}</p>;
}

function ProductCards(props: BlockRenderProps<ProductCardsProps>) {
  const site = useSite();
  const track = useRef<HTMLUListElement>(null);
  const count = props.products.length;
  const scroll = (direction: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: direction * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" });
  };
  const arrow = "flex size-9 items-center justify-center rounded-full border border-site-border text-site-ink transition-colors hover:border-site-ink @5xl:size-10";
  return (
    <section id={SECTION_ID.shop} style={spacingStyle(props.spacing)} className="scroll-mt-4 bg-site-bg py-[calc(40px*var(--site-space))] @5xl:py-[calc(64px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-5 @5xl:gap-8")}>
        <div className="flex items-end justify-between gap-4">
          <div className={cn("flex min-w-0 flex-col gap-3", ALIGN_CLASS[props.align])}>
            {(props.eyebrow || count > 0) && (
              <p className={LABEL}>
                {props.eyebrow}
                {props.eyebrow && count > 0 && " · "}
                {count > 0 && `${String(count).padStart(2, "0")} ${count === 1 ? "board" : "boards"}`}
              </p>
            )}
            {props.heading && <h2 className={cn(HEADING, "text-[34px] leading-none @xl:text-[44px] @3xl:text-[56px] @5xl:text-[76px]")}>{props.heading}</h2>}
          </div>
          {count > 1 && (
            <div className="flex shrink-0 items-center gap-2 pb-1">
              <button type="button" aria-label="Previous products" onClick={() => scroll(-1)} className={cn(arrow, FOCUS)}>
                <ArrowLeft2 aria-hidden className="size-4" />
              </button>
              <button type="button" aria-label="Next products" onClick={() => scroll(1)} className={cn(arrow, FOCUS)}>
                <ArrowRight2 aria-hidden className="size-4" />
              </button>
            </div>
          )}
        </div>
        {count === 0 ? (
          <EmptyProducts>No featured products yet. Check back soon.</EmptyProducts>
        ) : (
          <ul
            ref={track}
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] @3xl:-mx-10 @3xl:px-10 @5xl:-mx-16 @5xl:gap-6 @5xl:px-16 [&::-webkit-scrollbar]:hidden"
          >
            {props.products.map((product, i) => (
              <li key={`${product.name}-${i}`} className="w-[84%] shrink-0 snap-start @xl:w-[62%] @3xl:w-[52%] @5xl:w-[560px]">
                <ProductCard product={product} index={i} currency={site.currency} />
              </li>
            ))}
          </ul>
        )}
        {props.viewAllLabel && (
          <a href="#all-products" className={cn("w-fit text-[13px] font-semibold text-site-accent underline underline-offset-4", FOCUS)}>
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
  const count = props.products.length;
  const showChips = props.categories.length > 1;
  return (
    <section id="all-products" style={spacingStyle(props.spacing)} className="scroll-mt-4 bg-site-bg py-[calc(40px*var(--site-space))] @5xl:py-[calc(64px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-5 @5xl:gap-8")}>
        <div className={cn("flex flex-col gap-3", ALIGN_CLASS[props.align])}>
          {props.eyebrow && <p className={LABEL}>{props.eyebrow}</p>}
          {props.heading && <h2 className={cn(HEADING, "text-[34px] leading-none @xl:text-[44px] @3xl:text-[56px] @5xl:text-[76px]")}>{props.heading}</h2>}
        </div>
        {count === 0 ? (
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
                        "rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                        chip === browser.category ? "border-site-accent bg-site-accent text-site-accent-fg" : "border-site-border text-site-ink hover:border-site-ink",
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
              <label className="flex w-full items-center rounded-full border border-site-border bg-site-surface px-4 py-2 focus-within:border-site-accent @3xl:w-[260px]">
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
              <EmptyProducts>
                {browser.query.trim() ? `No products match “${browser.query.trim()}”.` : "No products in this category yet."}
              </EmptyProducts>
            ) : (
              <ul className={cn("grid grid-cols-1 gap-4 @xl:grid-cols-2 @5xl:gap-6", DESKTOP_COLUMNS_CLASS[props.columns])}>
                {browser.items.map((product, i) => (
                  <li key={`${product.name}-${i}`}>
                    <ProductCard product={product} index={i} currency={site.currency} />
                  </li>
                ))}
              </ul>
            )}
            {browser.totalPages > 1 && (
              <nav aria-label="Product pages" className="flex items-center justify-between gap-3">
                <p className={LABEL}>
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
                          "size-8 rounded-full border text-[12px] font-medium",
                          i === browser.page ? "border-site-accent bg-site-accent text-site-accent-fg" : "border-site-border text-site-ink hover:border-site-ink",
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
  // "Endy · Founder" → signature and role chip.
  const [name, role] = props.caption.split(/\s*[·,]\s*/);
  return (
    <section id="about" style={spacingStyle(props.spacing)} className="relative scroll-mt-4 overflow-hidden bg-site-bg py-[calc(40px*var(--site-space))] @5xl:py-[calc(72px*var(--site-space))]">
      <div className={cn(CONTAINER, "grid gap-10 @3xl:grid-cols-2 @3xl:items-center @5xl:gap-16")}>
        <div className={cn("flex flex-col gap-5 @5xl:gap-7", ALIGN_CLASS[props.align])}>
          {props.eyebrow && <Chip className="font-site-display tracking-[0.1em] text-site-ink uppercase">{props.eyebrow}</Chip>}
          <AccentHeading text={props.heading} className="max-w-[460px] text-[34px] @xl:text-[44px] @3xl:text-[48px] @5xl:text-[64px]" />
          {props.body && <p className="max-w-[440px] text-[14px] leading-[1.65] text-site-muted @5xl:text-[15px]">{props.body}</p>}
          {name && (
            <>
              <span aria-hidden className="h-px w-full max-w-[400px] bg-site-border" />
              <p className="flex items-center gap-3">
                <span className={cn(HEADING, "text-[22px] @5xl:text-[26px]")}>{name}</span>
                {role && <span className="rounded-full bg-site-accent px-2.5 py-0.5 font-site-display text-[9px] tracking-[0.1em] text-site-accent-fg uppercase">{role}</span>}
              </p>
            </>
          )}
        </div>
        {/* Two boards on a violet glow, tilted in opposite directions. */}
        <div className="relative mx-auto aspect-[1.05] w-full max-w-[540px]">
          <div aria-hidden className="absolute top-[10%] left-[10%] size-[80%] rounded-full bg-site-tint-4 opacity-60 blur-[90px]" />
          <div className="absolute top-0 left-0 aspect-[2.1] w-[82%] -rotate-[8deg]">
            <SiteImage src={props.imageUrl} alt={props.caption || props.heading} sizes="(min-width: 1024px) 440px, 80vw" className="object-contain" />
          </div>
          {props.secondImageUrl && (
            <div className="absolute right-0 bottom-0 aspect-[1.6] w-[66%] rotate-[8deg]">
              <SiteImage src={props.secondImageUrl} alt="" sizes="(min-width: 1024px) 360px, 66vw" className="object-contain" />
            </div>
          )}
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
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-site-accent text-site-accent-fg">
        <Icon className="size-[18px]" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className={LABEL}>{label}</span>
        <span className="text-[13px] font-semibold break-words text-site-ink @5xl:text-[14px]">{children}</span>
      </span>
    </>
  );
  const cls = cn(CARD, "flex items-center gap-3 p-3 @5xl:p-4");
  return href ? (
    <a {...linkProps(href)} className={cn(cls, "transition-colors hover:border-site-accent", FOCUS)}>
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
      <div className={cn(CONTAINER, "flex flex-col gap-6 @5xl:gap-9")}>
        <div className={cn("flex flex-col gap-3", ALIGN_CLASS[props.align])}>
          {props.heading && <AccentHeading text={props.heading} className="text-[30px] @xl:text-[40px] @3xl:text-[48px] @5xl:text-[72px]" />}
          {props.eyebrow && <Chip className="font-site-display tracking-[0.1em] uppercase">{props.eyebrow}</Chip>}
        </div>
        <div className="grid gap-4 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] @5xl:gap-6">
          <div className="flex flex-col gap-3 @5xl:gap-4">
            {(site.hours || rows.length > 0) && (
              <div className={cn(CARD, "flex flex-col gap-3 p-4 @5xl:p-5")}>
                <div className="flex items-start gap-3">
                  <StatusDot className="mt-1.5" />
                  <div className="flex flex-col gap-1">
                    <span className={LABEL}>Opening hours</span>
                    {site.statusText && <span className="text-[15px] font-semibold text-site-ink @5xl:text-[17px]">{site.statusText}</span>}
                  </div>
                  <Clock aria-hidden className="ml-auto size-4 text-site-subtle" />
                </div>
                {rows.length > 0 && (
                  <dl className="flex flex-col border-t border-site-border text-[12px]">
                    {rows.map((row) => (
                      <div key={row.day} className="flex items-center justify-between gap-3 border-b border-site-border/60 py-2 last:border-b-0">
                        <dt className="text-site-ink">{row.day}</dt>
                        <dd className={cn("font-site-display text-[11px]", /closed/i.test(row.hours) ? "text-site-accent" : "text-site-muted")}>{row.hours}</dd>
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
            {(phone || site.telegram) && (
              <div className="grid gap-3 @xl:grid-cols-2 @3xl:grid-cols-1 @5xl:grid-cols-2 @5xl:gap-4">
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
            )}
          </div>
          <div className="relative min-h-[300px] overflow-hidden rounded-[20px] border border-site-border @5xl:min-h-[400px] @5xl:rounded-[24px]">
            <SiteMap className="absolute inset-0" />
            <span className="absolute top-3 left-3 rounded-full border border-site-border bg-site-bg/80 px-2.5 py-1 font-site-display text-[10px] tracking-[0.1em] text-site-ink uppercase">
              Map
            </span>
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
      <p className="font-site-display text-[10px] tracking-[0.12em] text-site-accent uppercase">{title}</p>
      <ul className="flex flex-col gap-2 text-[12px] text-site-ink/85 @5xl:text-[13px]">{children}</ul>
    </div>
  );
}

function Footer(props: BlockRenderProps<FooterProps>) {
  const site = useSite();
  const phone = site.phones[0]?.number;
  const rows = hourRows(site);
  const socials = socialLinks(site).filter((s) => s.label !== "Telegram");
  const year = new Date().getFullYear();
  return (
    <footer style={spacingStyle(props.spacing)} className="overflow-hidden bg-site-bg pt-[calc(32px*var(--site-space))]">
      <div className={cn(CONTAINER, "flex flex-col gap-8 border-t border-site-border pt-8 @5xl:gap-10 @5xl:pt-10")}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 @5xl:grid-cols-[1.4fr_1fr_1.3fr_1.2fr] @5xl:gap-x-8">
          <div className={cn("col-span-2 flex flex-col gap-3 @5xl:col-span-1", ALIGN_CLASS[props.align])}>
            <a href={`#${SECTION_ID.top}`} className={cn("flex items-center gap-2.5 rounded-full", FOCUS)}>
              <span aria-hidden className="size-2 rounded-full bg-site-accent" />
              <span className="font-site-display text-[12px] font-bold tracking-[0.08em] uppercase">{site.businessName}</span>
            </a>
            {props.tagline && <p className="max-w-[230px] text-[12px] leading-[1.6] text-site-muted">{props.tagline}</p>}
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
              {socials.map((s) => (
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
                  <span className={cn("font-site-display text-[11px]", /closed/i.test(row.hours) ? "text-site-accent" : "text-site-muted")}>{row.hours}</span>
                </li>
              ))}
            </FooterColumn>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-site-border pt-5 text-[11px] text-site-muted">
          <p>
            © {year} {site.businessName}. All rights reserved.
          </p>
          <a href={`#${SECTION_ID.top}`} className={cn("rounded-full border border-site-border px-3.5 py-1.5 text-[11px] font-medium text-site-ink transition-colors hover:border-site-ink", FOCUS)}>
            Back to top <span aria-hidden>↑</span>
          </a>
        </div>
      </div>
      {/* The shop name again, huge, outlined and cut off at the bottom of the page. */}
      <p
        aria-hidden
        className={cn(HEADING, "mt-2 -mb-[0.3em] text-center text-[15cqw] leading-none whitespace-nowrap uppercase opacity-20 select-none", "text-transparent [-webkit-text-stroke:1.5px_var(--site-ink)]")}
      >
        {site.businessName}
      </p>
    </footer>
  );
}

/* ------------------------------------------------------------------ Text (the "Come try them out" band) */

function Text(props: BlockRenderProps<TextProps>) {
  const site = useSite();
  return (
    <section style={spacingStyle(props.spacing)} className="bg-site-bg py-[calc(24px*var(--site-space))] @5xl:py-[calc(48px*var(--site-space))]">
      <div className={CONTAINER}>
        <div className={cn(CARD, "relative isolate overflow-hidden p-5 @xl:p-8 @3xl:p-10 @5xl:rounded-[28px] @5xl:p-14")}>
          <div aria-hidden className="absolute -top-1/4 -right-[10%] -z-10 size-[70%] rounded-full bg-site-tint-3 opacity-60 blur-[100px]" />
          <div className="grid items-center gap-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] @3xl:gap-8">
            <div className={cn("flex flex-col gap-5", ALIGN_CLASS[props.align])}>
              {props.eyebrow && <p className={LABEL}>{props.eyebrow}</p>}
              {props.heading && <h2 className={cn(HEADING, "max-w-[420px] text-[32px] leading-[1.02] @xl:text-[42px] @3xl:text-[44px] @5xl:text-[68px]")}>{props.heading}</h2>}
              {props.body && <p className="max-w-[420px] text-[14px] leading-[1.6] whitespace-pre-line text-site-muted">{props.body}</p>}
              <div className="flex flex-wrap items-center gap-3">
                {site.address && (
                  <Pill tone="light" {...linkProps(directionsHref(site.address))}>
                    Get directions
                  </Pill>
                )}
                <ContactDialog
                  trigger={(open) => (
                    <button
                      type="button"
                      onClick={open}
                      className={cn(
                        "rounded-site-button border border-site-border px-5 py-2.5 text-[12px] font-semibold text-site-ink transition-colors hover:border-site-ink @5xl:px-6 @5xl:py-3 @5xl:text-[13px]",
                        FOCUS,
                      )}
                    >
                      Contact us
                    </button>
                  )}
                />
              </div>
            </div>
            {props.imageUrl && (
              <div className="relative aspect-[1.7] w-full -rotate-[6deg]">
                <SiteImage src={props.imageUrl} alt="" sizes="(min-width: 1024px) 560px, 90vw" className="object-contain" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export const keyboards: TemplateDesign = { Header, Hero, ProductCards, AllProducts, About, VisitUs, Footer, Text };
