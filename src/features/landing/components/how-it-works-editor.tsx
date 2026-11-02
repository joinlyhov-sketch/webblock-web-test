import type { ReactNode } from "react";
import { AddSquare, ArrowDown2, Layer, Magicpen, Setting2, SidebarLeft } from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import { CanvasDots, EditorTopBar, SiteAllProducts, SiteHero, SiteNav, SiteProductCards } from "./editor-mock";
import { RealSize, Tracked, tl, type Tracks } from "./how-it-works-timeline";

// Screen 02 · "Customize your website": the Puck editor with the page panel folded into its rail,
// WebBlock AI folded on top of the right panel and the site settings open below it (Layout & Design
// · Visual style). Built from the editor-mock pieces and scaled into the 704px screen; folding the
// left panel lets the site and settings show larger. The palette switches to Bakery, then the font
// to Editorial, and each change flashes an outline on the site. Swatches use the real site theme
// variables of Petal & Stem's template (`everyday-store`), so they match the editor.

const EDITOR_WIDTH = 936;
const EDITOR_SCALE = 704 / EDITOR_WIDTH;
/** Real-size height that fills the 407.44px screen. */
const EDITOR_HEIGHT = 407.44 / EDITOR_SCALE;
const TEMPLATE = "everyday-store";

const panel = "flex flex-col overflow-hidden rounded-[14.074px] bg-background shadow-editor-panel";

export function CustomizeScreen() {
  return (
    <Tracked tracks={tl.editor} className="absolute inset-0 origin-center">
      <RealSize width={EDITOR_WIDTH} height={EDITOR_HEIGHT} scale={EDITOR_SCALE}>
        <div className="grid size-full grid-rows-[42.222px_minmax(0,1fr)] gap-[8.444px] bg-editor-canvas p-[8.444px]">
          <EditorTopBar />
          <div className="grid min-h-0 grid-cols-[39.407px_minmax(0,1fr)_270.222px] gap-[8.444px]">
            <PageRail />
            <Canvas />
            <SettingsPanel />
          </div>
        </div>
      </RealSize>
    </Tracked>
  );
}

/** The page panel folded into its rail (the editor's PanelRail): show panel, Page structure, Add a block. */
function PageRail() {
  return (
    <div className="flex flex-col items-center gap-[2.815px] self-start rounded-[14.074px] bg-background py-[8.444px] text-foreground-soft shadow-editor-panel">
      <RailIcon>
        <SidebarLeft variant="Outline" className="size-[12.667px]" />
      </RailIcon>
      <span className="my-[2.815px] h-[0.704px] w-[16.889px] bg-border" />
      <RailIcon>
        <Layer variant="Outline" className="size-[12.667px]" />
      </RailIcon>
      <RailIcon>
        <AddSquare variant="Outline" className="size-[12.667px]" />
      </RailIcon>
    </div>
  );
}

function RailIcon({ children }: { children: ReactNode }) {
  return <span className="flex size-[28.148px] items-center justify-center rounded-full">{children}</span>;
}

/** The site being edited; it runs past the bottom, as in the real editor. */
function Canvas() {
  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-[14.074px] px-[28.148px] py-[16.889px]">
      <CanvasDots />
      <div className="relative w-[534.815px] shrink-0 overflow-hidden rounded-[12.667px] bg-background shadow-editor-panel">
        <SiteNav Button={StyledButton} />
        <SiteHero heading="Fresh flowers for every moment." Button={StyledButton} Heading={StyledHeading} />
        <SiteProductCards Heading={StyledHeading} />
        <SiteAllProducts Heading={StyledHeading} />
      </div>
    </div>
  );
}

/** Outline flashed around a site element when an edit changes it. */
function ChangeFlash({ tracks }: { tracks: Tracks }) {
  return (
    <Tracked
      tracks={tracks}
      className="pointer-events-none absolute -inset-[3.519px] rounded-[9.852px] border-[1.407px] border-primary"
    />
  );
}

/** Site button that takes the Bakery accent when the palette changes. */
function StyledButton({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className="relative">
      <span
        data-site-template={TEMPLATE}
        className={cn("relative isolate block overflow-hidden rounded-[8px] bg-site-accent text-site-accent-fg", className)}
      >
        <Tracked tracks={tl.bakeryAccent} data-site-palette="bakery" className="absolute inset-0 -z-10 bg-site-accent" />
        {children}
      </span>
      <ChangeFlash tracks={tl.paletteFlash} />
    </span>
  );
}

/**
 * Site heading that switches to the Editorial font: the serif version fades in over the original.
 * The landing page doesn't load the editor's site fonts, so `font-serif` stands in for Playfair.
 */
function StyledHeading({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={cn("relative grid", className)}>
      <span className="[grid-area:1/1]">{children}</span>
      <Tracked tracks={tl.editorialHeadings} className="bg-background font-serif [grid-area:1/1]">
        {children}
      </Tracked>
      <ChangeFlash tracks={tl.fontFlash} />
    </span>
  );
}

/** Right panel: WebBlock AI folded into its switch, site settings below. */
function SettingsPanel() {
  return (
    <div className={panel}>
      <div className="px-[11.259px] pt-[8.444px] pb-[5.63px]">
        <div className="flex items-center gap-[7.037px] rounded-[9.852px] border-[0.704px] border-border bg-background py-[5.63px] pr-[7.037px] pl-[5.63px]">
          <span className="flex size-[22.519px] shrink-0 items-center justify-center rounded-[7.037px] bg-brand-soft text-brand">
            <Magicpen variant="Outline" className="size-[11.259px]" />
          </span>
          <span className="flex-1">
            <span className="block text-[9.852px] leading-[14.074px] font-semibold text-foreground">WebBlock AI</span>
            <span className="block text-[8.444px] leading-[12.667px] text-placeholder">Ask AI to edit your site</span>
          </span>
          <span className="flex size-[19.704px] items-center justify-center rounded-full bg-segment">
            <ArrowDown2 variant="Outline" className="size-[9.852px] text-foreground-soft" />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-[7.037px] px-[12.667px] py-[11.259px]">
        <span className="flex size-[28.148px] shrink-0 items-center justify-center rounded-[8.444px] bg-brand-soft text-brand">
          <Setting2 variant="Outline" className="size-[12.667px]" />
        </span>
        <span>
          <span className="block text-[9.852px] leading-[14.074px] font-semibold text-foreground">Site settings</span>
          <span className="block text-[8.444px] leading-[12.667px] text-muted-foreground">
            Business info · select a section to edit it
          </span>
        </span>
      </div>

      <div className="px-[11.259px] pt-[2.815px] pb-[5.63px]">
        <div className="flex rounded-full bg-segment p-[2.815px] text-[9.852px]">
          <span className="flex h-[25.333px] flex-1 items-center justify-center font-medium text-muted-foreground">
            Content
          </span>
          <span className="flex h-[25.333px] flex-1 items-center justify-center rounded-full bg-background font-semibold text-brand-deep shadow-button">
            Layout &amp; Design
          </span>
        </div>
      </div>

      <VisualStyle />
    </div>
  );
}

const palettes: { value: string; label: string; selected?: Tracks }[] = [
  { value: "original", label: "Original", selected: tl.paletteOriginal },
  { value: "lavender", label: "Lavender" },
  { value: "bakery", label: "Bakery", selected: tl.paletteBakery },
  { value: "sage", label: "Sage" },
];

const fonts: { value: string; label: string; className: string; selected?: Tracks }[] = [
  { value: "original", label: "Original", className: "font-site-heading", selected: tl.fontOriginal },
  // The editor loads each site font; the landing page doesn't, so the samples use close stand-ins.
  { value: "editorial", label: "Editorial", className: "font-serif font-medium", selected: tl.fontEditorial },
  { value: "clean", label: "Clean", className: "font-heading" },
  { value: "rounded", label: "Rounded", className: "font-bold tracking-[0.7px]" },
];

// The editor's 2px / 8px / pill radii at the mock's 0.704 scale.
const buttonStyles: { value: string; label: string; radius: string; selected?: true }[] = [
  { value: "square", label: "Square", radius: "rounded-[1.408px]" },
  { value: "rounded", label: "Rounded", radius: "rounded-[5.63px]", selected: true },
  { value: "pill", label: "Pill", radius: "rounded-full" },
];

/** "Layout & Design · Visual style · Whole site", as in the editor's VisualStyle. */
function VisualStyle() {
  return (
    <section data-site-template={TEMPLATE} className="flex flex-col border-t-[0.704px] border-border px-[12.667px] py-[11.259px]">
      <div className="flex justify-between text-[8.444px] leading-[12.667px] text-placeholder">
        <span className="font-medium">Visual style</span>
        <span>Whole site</span>
      </div>

      <FieldTitle first>Color palette</FieldTitle>
      <div className="grid grid-cols-4 gap-[5.63px]">
        {palettes.map((p) => (
          <OptionCard key={p.value} label={p.label} selected={p.selected}>
            <span
              data-site-palette={p.value === "original" ? undefined : p.value}
              className="flex h-[19.704px] w-full overflow-hidden rounded-[11.259px] border-[0.704px] border-border"
            >
              <span className="flex-1 bg-site-accent" />
              <span className="flex-1 bg-site-accent-soft" />
              <span className="flex-1 bg-site-ink" />
            </span>
          </OptionCard>
        ))}
      </div>
      <div className="flex gap-[5.63px] pt-[7.037px]">
        <ColorChip label="Accent">
          <Tracked tracks={tl.bakeryAccent} data-site-palette="bakery" className="absolute inset-0 bg-site-accent" />
        </ColorChip>
        <ColorChip label="Background" swatch="bg-site-bg" />
        <ColorChip label="Text" swatch="bg-site-ink" />
      </div>

      <FieldTitle>Font</FieldTitle>
      <div className="grid grid-cols-4 gap-[5.63px]">
        {fonts.map((f) => (
          <OptionCard key={f.value} label={f.label} selected={f.selected}>
            <span className={cn("text-[14.074px] leading-[21.111px] font-semibold", f.className)}>Aa</span>
          </OptionCard>
        ))}
      </div>

      <FieldTitle>Buttons</FieldTitle>
      <div className="grid grid-cols-3 gap-[5.63px]">
        {buttonStyles.map((b) => (
          <OptionCard key={b.value} label={b.label} selected={b.selected}>
            <span className={cn("h-[14.074px] w-[39.407px]", b.radius, b.selected ? "bg-brand" : "bg-brand-border")} />
          </OptionCard>
        ))}
      </div>
    </section>
  );
}

function FieldTitle({ first, children }: { first?: boolean; children: ReactNode }) {
  return (
    <p className={cn("pb-[5.63px] text-[9.148px] leading-[13.722px] font-semibold text-foreground", first ? "pt-[8.444px]" : "pt-[11.259px]")}>
      {children}
    </p>
  );
}

/**
 * Visual style option. `selected: true` is chosen for the whole loop; a track fades the chosen look
 * (brand ring, soft fill, bold label) in or out as the cursor picks another option.
 */
function OptionCard({ label, selected, children }: { label: string; selected?: true | Tracks; children: ReactNode }) {
  const chosen = selected === true;
  const track = selected === true ? undefined : selected;
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-[4.222px] rounded-[11.259px] p-[7.037px] text-[8.444px] leading-[12.667px]",
        chosen
          ? "border-[1.126px] border-brand bg-primary-soft font-semibold text-brand-deep"
          : "border-[0.704px] border-border bg-background font-medium text-foreground-soft",
      )}
    >
      {track && (
        <Tracked tracks={track} className="absolute -inset-[0.704px] rounded-[11.259px] border-[1.126px] border-brand bg-primary-soft" />
      )}
      <span className="relative flex w-full justify-center">{children}</span>
      <span className="relative whitespace-nowrap">
        {label}
        {track && (
          <Tracked tracks={track} className="absolute inset-y-0 -inset-x-[4px] bg-primary-soft text-center font-semibold text-brand-deep">
            {label}
          </Tracked>
        )}
      </span>
    </div>
  );
}

/** Accent / Background / Text chip (the editor's ColorPicker trigger). Children layer over the swatch. */
function ColorChip({ label, swatch = "bg-site-accent", children }: { label: string; swatch?: string; children?: ReactNode }) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-[4.222px] rounded-full border-[0.704px] border-border bg-muted px-[5.63px] py-[4.222px] text-[8.444px] leading-[12.667px] text-foreground">
      <span className={cn("relative size-[12.667px] shrink-0 overflow-hidden rounded-[3.519px] border-[0.704px] border-border", swatch)}>
        {children}
      </span>
      {label}
    </span>
  );
}
