// Static pieces of the editor mock (Figma "Editor · Puck (animated)"), drawn at the Figma size —
// a 1216px editor at 0.704 scale, hence the fractional px values. Pure markup: the animated layers
// are composed in editor-demo.tsx. Everything here is decoration (the demo is aria-hidden).
import Image from "next/image";
import type { ReactNode } from "react";
import {
  Add,
  ArrowLeft,
  ArrowRotateLeft,
  ArrowRotateRight,
  ArrowUp,
  Copy,
  Devices,
  DocumentDownload,
  Element3,
  Eye,
  Gallery,
  InfoCircle,
  Location,
  MagicStar,
  Menu,
  Mobile,
  Monitor,
  RowVertical,
  SearchNormal1,
  Send2,
  Shop,
  Text,
  Trash,
  type Icon,
} from "iconsax-reactjs";
import { LogoMark } from "@/components/common/logo";
import { cn } from "@/lib/utils";

const panel = "rounded-[14.074px] bg-background shadow-editor-panel";

export function EditorTopBar() {
  return (
    <div className={cn(panel, "flex h-[42.222px] items-center gap-[9.852px] rounded-[12.667px] px-[11.259px]")}>
      <span className="flex size-[25.333px] items-center justify-center rounded-full text-foreground">
        <ArrowLeft className="size-[12.667px]" />
      </span>
      <LogoMark className="h-[21.111px]" />
      <div className="w-[56.736px]">
        <p className="text-[9.15px] leading-[13.722px] font-semibold text-foreground">Petal &amp; Stem</p>
        <p className="text-[8.44px] leading-[12.667px] text-muted-foreground">Home page</p>
      </div>
      <span className="flex-1" />
      <div className="flex items-center gap-[2.815px] text-foreground">
        {[ArrowRotateLeft, ArrowRotateRight].map((IconCmp, i) => (
          <span
            key={i}
            className="flex size-[25.333px] items-center justify-center rounded-full border-[0.704px] border-border bg-background"
          >
            <IconCmp className="size-[12.667px]" />
          </span>
        ))}
      </div>
      <div className="flex w-[94.296px] gap-[1.407px] rounded-[8.444px] border-[0.704px] border-border bg-primary-soft p-[2.815px] text-foreground">
        {[Monitor, Devices, Mobile].map((IconCmp, i) => (
          <span
            key={i}
            className={cn(
              "flex h-[22.519px] flex-1 items-center justify-center rounded-[6.333px]",
              i === 0 && "bg-background shadow-button",
            )}
          >
            <IconCmp className="size-[11.259px]" />
          </span>
        ))}
      </div>
      <span className="flex-1" />
      <TopBarButton icon={DocumentDownload}>Save draft</TopBarButton>
      <TopBarButton icon={Eye}>Preview</TopBarButton>
      <TopBarButton icon={Send2} primary>
        Deploy
      </TopBarButton>
    </div>
  );
}

function TopBarButton({ icon: IconCmp, primary, children }: { icon: Icon; primary?: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "flex h-[28.148px] items-center gap-[5.63px] rounded-full px-[12.667px] text-[9.85px] leading-[14.778px] font-semibold",
        primary
          ? "bg-brand text-primary-foreground shadow-page-active"
          : "border-[0.704px] border-border bg-background text-foreground shadow-button",
      )}
    >
      <IconCmp className="size-[11.259px]" />
      {children}
    </span>
  );
}

// ── Left panel ──────────────────────────────────────────────────────────────────────────────────

export function PanelHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex h-[11.611px] items-center justify-between">
      <p className="text-[9.148px] leading-[11.611px] font-semibold text-foreground">{children}</p>
      {action}
    </div>
  );
}

export function StructureRow({ icon: IconCmp, label }: { icon: Icon; label: string }) {
  return (
    <div className="flex h-[26.741px] items-center gap-[7.037px] rounded-[8.444px] py-[5.63px] pr-[7.037px] pl-[8.444px]">
      <IconCmp className="size-[10.556px] shrink-0 text-muted-foreground" />
      <p className="flex-1 text-[9.148px] leading-[13.722px] font-medium text-foreground">{label}</p>
      <Menu className="size-[10.556px] shrink-0 text-placeholder" />
    </div>
  );
}

/** The selected "Product Cards" row with its duplicate / delete actions. */
export function SelectedStructureRow() {
  return (
    <div className="flex h-[26.741px] items-center gap-[7.037px] rounded-[8.444px] border-[0.704px] border-editor-selected bg-primary-soft py-[5.63px] pr-[7.037px] pl-[8.444px]">
      <Element3 className="size-[10.556px] shrink-0 text-brand-deep" />
      <p className="text-[9.148px] leading-[13.722px] font-semibold whitespace-nowrap text-brand-deep">
        Product Cards
      </p>
      <span className="flex flex-1 justify-end gap-[1.407px] text-brand-deep">
        {[Copy, Trash].map((IconCmp, i) => (
          <span key={i} className="flex size-[18.296px] items-center justify-center rounded-full">
            <IconCmp className="size-[9.852px]" />
          </span>
        ))}
      </span>
      <Menu className="size-[10.556px] shrink-0 text-placeholder" />
    </div>
  );
}

export const structureIcons = {
  hero: Gallery,
  text: Text,
  allProducts: Shop,
  about: InfoCircle,
  visitUs: Location,
  footer: RowVertical,
} satisfies Record<string, Icon>;

export const blockLibrary: { icon: Icon; name: string; hint: string }[] = [
  { icon: Gallery, name: "Hero", hint: "Big heading, image, button" },
  { icon: Text, name: "Text", hint: "Heading and paragraph" },
  { icon: Element3, name: "Product Cards", hint: "Products with prices" },
  { icon: Shop, name: "All products", hint: "Search, grid & pagination" },
  { icon: InfoCircle, name: "About", hint: "Your story" },
  { icon: Location, name: "Visit us", hint: "Map, hours & contact form" },
  { icon: RowVertical, name: "Footer", hint: "Contact and links" },
];

/** Card in the "Add a block" list; also the drag ghost (`dragging`). */
export function BlockItem({
  icon: IconCmp,
  name,
  hint,
  dragging,
}: {
  icon: Icon;
  name: string;
  hint: string;
  dragging?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-[39.759px] w-full items-center gap-[7.037px] rounded-[9.852px] bg-background px-[7.037px] py-[6.333px]",
        dragging ? "border-[1.056px] border-primary shadow-editor-ghost" : "border-[0.704px] border-border shadow-card",
      )}
    >
      <span className="flex size-[22.519px] shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-deep">
        <IconCmp className="size-[11.259px]" />
      </span>
      <div className="w-[94.758px]">
        <p className="text-[9.148px] leading-[13.722px] font-semibold whitespace-nowrap text-foreground">{name}</p>
        <p className="text-[7.741px] leading-[11.611px] whitespace-nowrap text-muted-foreground">{hint}</p>
      </div>
      <span className="flex flex-1 justify-end text-muted-foreground">
        <Add className="size-[12.667px]" />
      </span>
    </div>
  );
}

export function AddIcon() {
  return (
    <span className="flex rounded-[5.63px] p-[2.111px] text-muted-foreground">
      <Add className="size-[12.667px]" />
    </span>
  );
}

// ── Canvas: the "Petal & Stem" site ─────────────────────────────────────────────────────────────

/** Canvas background: 2.1px dots every 16.9px. */
export function CanvasDots() {
  return (
    <div className="pointer-events-none absolute top-0 left-0 h-[786.037px] w-[1216px] bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-editor-dot)_85%,transparent)_1.05px,transparent_1.1px)] bg-size-[16.889px_16.889px] bg-position-[-7.39px_-7.39px]" />
  );
}

const siteBlock = "w-[534.815px] bg-background px-[16.889px] py-[19.704px]";
const siteHeading = "font-heading text-[14.07px] font-medium text-foreground";

/**
 * The site's main button and headings. The "How it works" demo passes its own, which restyle with
 * the Visual style edits (palette, font).
 */
export type SitePart = (props: { className: string; children: ReactNode }) => ReactNode;

function PlainButton({ className, children }: { className: string; children: ReactNode }) {
  return <span className={cn("rounded-[8px] bg-foreground text-primary-foreground", className)}>{children}</span>;
}

function PlainHeading({ className, children }: { className: string; children: ReactNode }) {
  return <p className={className}>{children}</p>;
}

export function SiteNav({ Button = PlainButton }: { Button?: SitePart }) {
  return (
    <div className="flex h-[39.407px] w-[534.815px] items-center gap-[11.259px] overflow-hidden border-b-[0.704px] border-border bg-background px-[16.889px]">
      <p className="text-[9.85px] font-semibold whitespace-nowrap text-foreground">❀ Petal &amp; Stem</p>
      <span className="flex-1" />
      <div className="flex gap-[12.667px] text-[8.44px] whitespace-nowrap text-muted-foreground">
        <span>Home</span>
        <span>Shop</span>
        <span>Visit us</span>
      </div>
      <span className="flex items-center gap-[3.519px]">
        <span className="size-[4.222px] rounded-full bg-editor-open" />
        <span className="text-[7.74px] font-medium whitespace-nowrap text-editor-open">Open now · until 18:00</span>
      </span>
      <Button className="px-[9.852px] py-[5.63px] text-[8.44px] font-semibold">Contact</Button>
    </div>
  );
}

export function SiteHero({
  heading,
  Button = PlainButton,
  Heading = PlainHeading,
}: {
  heading: string;
  Button?: SitePart;
  Heading?: SitePart;
}) {
  return (
    <div className={cn(siteBlock, "flex items-center gap-[16.889px]")}>
      <div className="flex min-w-0 flex-1 flex-col gap-[8.444px]">
        <Heading className="font-heading text-[21.11px] leading-[23.926px] font-semibold text-foreground">{heading}</Heading>
        <p className="text-[8.44px] leading-[12.667px] text-muted-foreground">
          Hand-tied bouquets, single stems and event flowers, arranged in our studio and delivered across
          town.
        </p>
        <div className="flex items-center gap-[9.852px]">
          <Button className="px-[11.259px] py-[6.333px] text-[8.44px] font-semibold">Shop flowers</Button>
          <span className="text-[8.44px] font-medium text-foreground underline">Visit the studio</span>
        </div>
      </div>
      <SitePhoto src="vase-shelf" className="h-[140.741px] w-[211.111px] rounded-[12px]" />
    </div>
  );
}

export function SiteText() {
  return (
    <div className={siteBlock}>
      <div className="flex h-[49.963px] flex-col gap-[7.037px] overflow-hidden">
        <p className={siteHeading}>A note from the studio</p>
        <p className="text-[8.44px] leading-[12.667px] text-muted-foreground">
          Every bouquet is arranged by hand on the morning it goes out, using seasonal stems from local
          growers. Use this space to tell customers what makes your shop special.
        </p>
      </div>
    </div>
  );
}

type Product = { name: string; note: string; price: string; photo: string };

const featured: Product[] = [
  { name: "Blue lily stem", note: "Single, long-stemmed", price: "$6.00", photo: "vase-shelf" },
  { name: "Gift bouquet", note: "Wrapped and ready to give", price: "$38.00", photo: "gift-bouquet" },
  { name: "Stone vase", note: "Handmade ceramic", price: "$24.00", photo: "stone-vase" },
  { name: "Lily bunch", note: "Three stems, hand-tied", price: "$16.00", photo: "lily-bunch" },
];

const catalogue: Product[][] = [
  [featured[0], featured[1], featured[3], featured[2]],
  [
    { name: "Table arrangement", note: "For home or events", price: "$45.00", photo: "table-arrangement" },
    { name: "Spring tulip bunch", note: "This week’s special", price: "$14.00", photo: "tulip-bunch" },
    { name: "Peony bouquet", note: "Soft pink, seasonal", price: "$32.00", photo: "table-arrangement" },
    { name: "Dried grass bunch", note: "Lasts for months", price: "$18.00", photo: "tulip-bunch" },
  ],
];

function ProductRow({ products }: { products: Product[] }) {
  return (
    <div className="flex w-full gap-[8.444px]">
      {products.map((p) => (
        <div key={p.name} className="flex min-w-0 flex-1 flex-col gap-[5.63px]">
          <SitePhoto src={p.photo} className="h-[89.37px] w-full rounded-[8px]" />
          <div className="flex gap-[5.63px]">
            <div className="flex min-w-0 flex-1 flex-col gap-[1.407px]">
              <p className="text-[8.44px] font-medium text-foreground">{p.name}</p>
              <p className="text-[7.04px] text-muted-foreground">{p.note}</p>
            </div>
            <p className="text-[8.44px] font-medium whitespace-nowrap text-foreground">{p.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SiteProductCards({ Heading = PlainHeading }: { Heading?: SitePart }) {
  return (
    <div className={cn(siteBlock, "flex flex-col gap-[9.852px]")}>
      <div className="flex items-center gap-[8.444px] text-foreground">
        <Heading className={cn(siteHeading, "flex-1")}>Fresh picks, hand-tied today</Heading>
        <p className="text-[7.74px] font-medium whitespace-nowrap">View all products →</p>
      </div>
      <ProductRow products={featured} />
    </div>
  );
}

export function SiteAllProducts({ Heading = PlainHeading }: { Heading?: SitePart }) {
  return (
    <div className={cn(siteBlock, "flex flex-col gap-[9.852px]")}>
      <Heading className={siteHeading}>Everything in the studio</Heading>
      <div className="flex w-full items-center gap-[11.259px]">
        <span className="flex h-[22.519px] w-[154.815px] items-center gap-[5.63px] rounded-[8px] border-[0.704px] border-border-strong bg-muted px-[7.037px]">
          <SearchNormal1 className="size-[8.444px] text-muted-foreground" />
          <span className="text-[7.74px] whitespace-nowrap text-muted-foreground">Search flowers, bouquets, gifts…</span>
        </span>
        {/* Figma's spacer is 70px tall, which sets this row's height. */}
        <span className="h-[70.37px] flex-1" />
        <span className="flex gap-[9.852px] text-[7.74px] font-medium">
          {["All", "Flowers", "Bouquets", "Gifts", "Events"].map((chip, i) => (
            <span
              key={chip}
              className={cn(
                "pt-[2.815px] pb-[4.222px]",
                i === 0 ? "border-b-[1.407px] border-foreground text-foreground" : "text-muted-foreground",
              )}
            >
              {chip}
            </span>
          ))}
        </span>
      </div>
      {catalogue.map((row, i) => (
        <ProductRow key={i} products={row} />
      ))}
    </div>
  );
}

function SitePhoto({ src, className }: { src: string; className?: string }) {
  return (
    <span className={cn("relative block shrink-0 overflow-hidden", className)}>
      <Image src={`/landing/editor/${src}.jpg`} alt="" fill sizes="212px" className="object-cover" />
    </span>
  );
}

// ── Right panel: WebBlock AI ────────────────────────────────────────────────────────────────────

export function AiPanelHeader() {
  return (
    <div className="px-[11.259px] pt-[8.444px] pb-[5.63px]">
      <div className="flex items-center gap-[7.037px] rounded-full bg-primary-soft py-[5.63px] pr-[7.037px] pl-[9.852px]">
        <MagicStar className="size-[11.259px] text-brand-deep" />
        <div className="flex-1 whitespace-nowrap">
          <p className="text-[9.852px] leading-[14.074px] font-semibold text-brand-deep">WebBlock AI</p>
          <p className="text-[8.444px] leading-[11.259px] text-placeholder">Ask AI to edit your site</p>
        </div>
        <span className="flex size-[19.704px] items-center justify-center rounded-full bg-background text-brand-deep">
          <Add className="size-[9.852px] rotate-45" />
        </span>
      </div>
    </div>
  );
}

export function ChatBubble({ from, children }: { from: "user" | "ai"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-[14.074px] px-[11.259px] py-[7.037px] text-[9.148px] leading-[14.074px]",
        from === "user"
          ? "w-[188.59px] bg-brand-strong text-primary-foreground"
          : "w-[211.11px] bg-editor-bubble text-foreground",
      )}
    >
      {children}
    </div>
  );
}

export function SendButton() {
  return (
    <span className="flex size-[25.333px] shrink-0 items-center justify-center rounded-full bg-brand-strong text-primary-foreground">
      <ArrowUp className="size-[9.852px]" />
    </span>
  );
}
