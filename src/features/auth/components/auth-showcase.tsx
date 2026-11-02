import Image from "next/image";
import { Lock } from "iconsax-reactjs";

const STEPS = [
  { title: "Pick a template", detail: "Ready-made designs" },
  { title: "Add your details", detail: "Name, hours, contact" },
  { title: "Deploy", detail: "Live on webblock.com" },
];

/** Two-line headline; line 2 is `line2` (optional) followed by the blue `accent`. */
export type Headline = { line1: string; line2?: string; accent: string };

/** Right-hand marketing panel: headline, desktop + phone preview of a template, 3 steps. */
export function AuthShowcase({ headline }: { headline: Headline }) {
  return (
    <aside className="@container relative hidden w-[743px] max-w-[46%] shrink-0 flex-col gap-8 overflow-hidden rounded-[32px] border border-brand-soft bg-linear-to-b from-background via-background to-muted p-10 lg:flex min-[1600px]:p-[55px]">
      <ShowcaseBackground />

      {/* Scales with the panel width so the two lines never wrap into three. */}
      <p className="relative shrink-0 font-heading text-[clamp(36px,10.1cqw,64px)] leading-[1.06] font-semibold tracking-[-0.034em] text-foreground motion-safe:animate-fade-up">
        {headline.line1}
        <br />
        {headline.line2 && `${headline.line2} `}
        <span className="text-primary">{headline.accent}</span>
      </p>

      {/* Fills the space between headline and steps; the preview scales to fit both width and height. */}
      <div aria-hidden className="relative min-h-0 flex-1 [container-type:size]">
        <div className="absolute top-1/2 left-0 aspect-[644/529] w-[min(100cqw,calc(100cqh*644/529),644px)] -translate-y-1/2">
          <BrowserPreview />
          <PhonePreview />
        </div>
      </div>

      <ol className="relative flex shrink-0 items-center gap-4 rounded-[20px] border border-border bg-background/80 px-5 py-[18px] shadow-card backdrop-blur-sm motion-safe:animate-fade-up motion-safe:[animation-delay:360ms]">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex min-w-0 flex-1 items-center gap-3">
            {i > 0 && <span aria-hidden className="h-9 w-px shrink-0 bg-border" />}
            <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-sm leading-tight font-semibold text-foreground">{step.title}</span>
              {/* Only fits near full width (container = panel content box, 633px at full size). */}
              <span className="mt-0.5 block text-xs text-muted-foreground @max-[580px]:hidden">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

/** Figma "Background": two soft blue glows, the fading block grid and a white top sheen. */
function ShowcaseBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 motion-safe:animate-fade-in-slow">
      <Image
        src="/images/auth/block-grid.svg"
        alt=""
        width={743}
        height={1069}
        className="absolute top-0 left-0 max-w-none"
      />
      <Image
        src="/images/auth/mesh-top-right.svg"
        alt=""
        width={740}
        height={680}
        className="absolute -top-[310px] -right-[310px] max-w-none"
      />
      <Image
        src="/images/auth/mesh-bottom-left.svg"
        alt=""
        width={780}
        height={660}
        className="absolute -bottom-[150px] -left-[330px] max-w-none"
      />
      <div className="absolute inset-x-0 top-0 h-[220px] bg-linear-to-b from-background/70 to-transparent" />
    </div>
  );
}

function BrowserPreview() {
  return (
    <div className="absolute top-0 left-0 w-[87.6%] overflow-hidden rounded-[19px] border border-border bg-background shadow-card motion-safe:animate-fade-up motion-safe:[animation-delay:120ms]">
      <div className="flex h-[46px] items-center gap-[7px] border-b border-border bg-muted px-4">
        <span className="size-3 shrink-0 rounded-full bg-danger/40" />
        <span className="size-3 shrink-0 rounded-full bg-warning/40" />
        <span className="size-3 shrink-0 rounded-full bg-success/40" />
        <span className="mx-auto flex h-[29px] min-w-0 items-center gap-[7px] rounded-full border border-border bg-background px-4 text-sm text-muted-foreground">
          <Lock variant="Outline" className="size-3.5 shrink-0" />
          <span className="truncate">petalandstem.webblock.com</span>
        </span>
      </div>
      <div className="relative aspect-[562/410]">
        <Image
          src="/images/auth/template-desktop.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 564px, 0px"
          className="object-cover object-top"
          priority
        />
      </div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="absolute right-0 bottom-0 w-[35.6%] rounded-[41px] bg-foreground p-[6px] shadow-card motion-safe:animate-fade-up motion-safe:[animation-delay:240ms]">
      <div className="relative aspect-[216/446] overflow-hidden rounded-[35px] bg-background">
        <Image
          src="/images/auth/template-mobile.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 216px, 0px"
          className="object-cover object-top pt-[33px]"
        />
        <div className="absolute inset-x-0 top-0 flex h-[33px] items-center bg-background/95 px-6 text-[10px] font-semibold text-foreground">
          9:41
        </div>
        <span className="absolute top-[6.5px] left-1/2 h-[22px] w-[34%] -translate-x-1/2 rounded-full bg-foreground" />
      </div>
    </div>
  );
}
