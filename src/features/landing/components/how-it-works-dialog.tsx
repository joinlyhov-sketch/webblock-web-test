import Image from "next/image";
import { Add, Element4, Layer, SearchNormal1 } from "iconsax-reactjs";
import { RealSize, Tracked, tl } from "./how-it-works-timeline";

// Screen 01 · "Start a new website" dialog (Figma 5574:226147), authored at real size and shown at
// the dialog's instance scale (656 / 1288).

const DIALOG_SCALE = 656 / 1288;

const templates = [
  { name: "Fresh & simple", tagline: "Products, categories and clear prices", thumb: "everyday-store" },
  { name: "Candy pastel", tagline: "Round photos, stickers, candy colours", thumb: "sweet-pastel" },
  { name: "Rustic roast", tagline: "Full-bleed hero, serif, menu-board grid", thumb: "warm-bold" },
  { name: "Studio mono", tagline: "Hairlines, big type, catalogue layout", thumb: "clean-mono" },
];

export function ChooseTemplateScreen() {
  return (
    <div className="absolute inset-0 bg-hiw-stage">
      <Tracked tracks={tl.dialog} className="absolute top-[19px] left-[24px] h-[354px] w-[656px]">
        <RealSize width={1288} height={695} scale={DIALOG_SCALE}>
          <div className="flex flex-col overflow-hidden rounded-[18px] border border-border bg-background shadow-hiw-dialog">
            <div className="flex items-center justify-between px-6 py-[22px]">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-[10px] bg-hiw-chip text-brand">
                  <Element4 variant="Outline" className="size-[18px]" />
                </span>
                <div>
                  <p className="font-heading text-[17px] leading-[22px] font-semibold tracking-[-0.17px] text-foreground">
                    Start a new website
                  </p>
                  <p className="text-xs leading-[18px] text-muted-foreground">Pick a template to begin</p>
                </div>
              </div>
              <span className="flex size-9 items-center justify-center text-muted-foreground">
                <Add variant="Outline" className="size-[18px] rotate-45" />
              </span>
            </div>
            <div className="mx-6 h-px bg-border" />
            <div className="flex flex-col gap-5 px-6 pt-6 pb-7">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-[400px] items-center gap-2.5 rounded-full border border-border px-3.5">
                  <SearchNormal1 variant="Outline" className="size-[17px] text-placeholder" />
                  <span className="text-sm leading-[21px] text-placeholder">
                    Search templates, e.g. “minimal”
                  </span>
                </div>
                <span className="text-[13px] text-muted-foreground">4 templates</span>
              </div>
              <div className="flex gap-4">
                {templates.map((template, index) => (
                  <TemplateCard key={template.name} {...template} picked={index === 0} />
                ))}
              </div>
            </div>
          </div>
        </RealSize>
      </Tracked>
    </div>
  );
}

function TemplateCard({
  name,
  tagline,
  thumb,
  picked,
}: {
  name: string;
  tagline: string;
  thumb: string;
  picked: boolean;
}) {
  const card = (
    <>
      <div className="overflow-hidden rounded-[14px] bg-hiw-preview">
        <div className="relative h-[360px] overflow-hidden rounded-t-lg bg-background shadow-float">
          <Image
            src={`/landing/how-it-works/thumb-${thumb}.webp`}
            alt=""
            fill
            sizes="300px"
            className="object-cover object-top"
          />
        </div>
      </div>
      <div className="flex h-[90px] flex-col gap-2.5 px-1.5 pb-1.5">
        <div className="flex flex-col gap-[5px]">
          <p className="font-heading text-[17px] font-semibold text-foreground">{name}</p>
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Layer variant="Outline" className="size-3.5" />
            {tagline}
          </p>
        </div>
        <div className="flex gap-2.5">
          <span className="flex flex-1 items-center justify-center rounded-full border border-border bg-background px-3 py-1.5 text-[13px] font-semibold text-foreground shadow-button">
            Preview
          </span>
          <span className="flex h-[31px] flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-[13px] font-semibold whitespace-nowrap text-primary-foreground">
            <Add variant="Outline" className="size-[15px]" />
            Use template
          </span>
        </div>
      </div>
    </>
  );

  const className =
    "relative flex flex-1 flex-col gap-3.5 rounded-[20px] border border-border bg-background p-3 shadow-card";

  if (!picked) return <div className={className}>{card}</div>;

  return (
    <Tracked tracks={tl.pickedCard} className={className}>
      {card}
      <Tracked
        tracks={tl.pickedRing}
        className="pointer-events-none absolute -inset-px rounded-[20px] border-[3px] border-brand shadow-hiw-ring"
      />
    </Tracked>
  );
}
