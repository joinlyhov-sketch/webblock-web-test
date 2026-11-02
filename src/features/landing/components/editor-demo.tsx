"use client";

import Image from "next/image";
import { LoopStage } from "@/components/common/motion";
import { ScaleToFit } from "@/components/common/scale-to-fit";
import {
  AddIcon,
  AiPanelHeader,
  BlockItem,
  CanvasDots,
  ChatBubble,
  EditorTopBar,
  PanelHeading,
  SelectedStructureRow,
  SendButton,
  SiteAllProducts,
  SiteHero,
  SiteNav,
  SiteProductCards,
  SiteText,
  StructureRow,
  blockLibrary,
  structureIcons,
} from "./editor-mock";
import { editorTimeline as t } from "./editor-timeline";
import { Track } from "./editor-track";

/** Figma "Editor showcase" frame size; the demo is drawn at this size and scaled to fit. */
const SHOWCASE = { width: 1280, height: 868 };

/**
 * Looping editor demo (Figma "04 Seven blocks"): a Text block is dragged onto the page, then
 * WebBlock AI rewrites the hero heading. Decorative only.
 */
export function EditorDemo() {
  return (
    <ScaleToFit width={SHOWCASE.width} height={SHOWCASE.height}>
      <LoopStage className="flex size-full flex-col items-center overflow-hidden rounded-[32px] border border-border bg-muted px-8 py-10 shadow-editor-showcase">
        <div className="relative h-[786.037px] w-[1216px] shrink-0 overflow-hidden rounded-[24px] border border-border bg-editor-canvas shadow-editor-frame">
          <div className="grid h-full grid-rows-[42.222px_minmax(0,1fr)] gap-[8.444px] p-[8.444px]">
            <EditorTopBar />
            <div className="grid min-h-0 grid-cols-[211.111px_minmax(0,1fr)_270.222px] gap-[8.444px]">
              <BlocksPanel />
              <Canvas />
              <AiPanel />
            </div>
          </div>

          <Track spec={t.dragGhost} className="absolute top-[372.611px] left-[19.704px] w-[188.593px]">
            <BlockItem {...blockLibrary[1]} dragging />
          </Track>
          <Ripple spec={t.rippleText} left={101.98} top={352.324} />
          <Ripple spec={t.ripplePrompt} left={989.943} top={733.908} />
          <Ripple spec={t.rippleSend} left={1166.685} top={733.906} />
          <Track spec={t.cursor} className="absolute top-[362.342px] left-[112px] h-[26.66px] w-[21.81px]">
            <Image
              src="/landing/editor/cursor.svg"
              alt=""
              width={31}
              height={31}
              className="max-w-none drop-shadow-editor-cursor"
            />
          </Track>
          <Track spec={t.loopVeil} className="pointer-events-none absolute inset-0 bg-editor-canvas" />
        </div>
      </LoopStage>
    </ScaleToFit>
  );
}

function Ripple({ spec, left, top }: { spec: typeof t.rippleText; left: number; top: number }) {
  return <Track spec={spec} className="absolute size-[26.04px] rounded-full bg-brand/28" style={{ left, top }} />;
}

/** Left panel: page structure (gains a Text row) and the "Add a block" library. */
function BlocksPanel() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[14.074px] bg-background shadow-editor-panel">
      <div className="p-[11.259px]">
        <PanelHeading action={<AddIcon />}>Page structure</PanelHeading>
        <div className="flex flex-col gap-[1.407px] pt-[8.444px]">
          <StructureRow icon={structureIcons.hero} label="Hero" />
          <Track spec={t.textRow}>
            <StructureRow icon={structureIcons.text} label="Text" />
          </Track>
          <Track spec={t.rowsBelow} className="flex flex-col gap-[1.407px]">
            <SelectedStructureRow />
            <StructureRow icon={structureIcons.allProducts} label="All products" />
            <StructureRow icon={structureIcons.about} label="About" />
            <StructureRow icon={structureIcons.visitUs} label="Visit us" />
            <StructureRow icon={structureIcons.footer} label="Footer" />
          </Track>
        </div>
      </div>
      <Track spec={t.rowsBelow} className="flex min-h-0 flex-1 flex-col px-[11.259px] pt-[11.259px] pb-[4.222px]">
        <PanelHeading>Add a block</PanelHeading>
        <div className="flex flex-col gap-[5.63px] pt-[7.037px] pb-[8.444px]">
          {blockLibrary.map((block) => (
            <BlockItem key={block.name} {...block} />
          ))}
        </div>
      </Track>
    </div>
  );
}

/** Centre: the site being edited. The Text block drops in, then the AI-edited hero fades over. */
function Canvas() {
  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-[14.074px] px-[28.148px] py-[16.889px]">
      <CanvasDots />
      <div className="relative h-[684.704px] w-[534.815px] shrink-0 overflow-hidden rounded-[12.667px] bg-background shadow-editor-panel">
        <div className="absolute top-0 left-0 flex w-[534.815px] flex-col">
          <SiteNav />
          <SiteHero heading="Fresh flowers for every moment." />
          <Track spec={t.droppedText}>
            <SiteText />
          </Track>
          <Track spec={t.blocksBelow}>
            <SiteProductCards />
            <SiteAllProducts />
          </Track>

          <Track spec={t.heroAfterAi} className="absolute top-[39.407px] left-0">
            <SiteHero heading="Flowers made with love, every day." />
          </Track>
          <Track
            spec={t.aiRing}
            className="absolute top-[43.63px] left-[4.222px] h-[172.148px] w-[526.37px] rounded-[7.037px] border-[1.407px] border-primary"
          >
            <span className="absolute top-[5.63px] left-[5.63px] rounded-full bg-primary px-[7.037px] py-[2.815px] text-[7.741px] font-medium whitespace-nowrap text-primary-foreground">
              Updated by WebBlock AI
            </span>
          </Track>
          <Track
            spec={t.dropZone}
            className="absolute top-[227.37px] left-[16.889px] flex h-[75.259px] w-[501.037px] items-center justify-center rounded-[8.444px] border-[1.056px] border-dashed border-primary bg-editor-drop"
          >
            <span className="text-[9.852px] font-medium text-primary">Drop Text here</span>
          </Track>
        </div>
      </div>
    </div>
  );
}

/** Right panel: the prompt is typed, sent, and answered. */
function AiPanel() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[14.074px] bg-background shadow-editor-panel">
      <AiPanelHeader />
      <div className="flex min-h-0 flex-1 flex-col gap-[11.259px] px-[14.074px] pt-[8.444px] pb-[5.63px]">
        <Track spec={t.userMessage} className="flex justify-end">
          <ChatBubble from="user">Make the hero heading warmer</ChatBubble>
        </Track>
        <div className="relative">
          <Track spec={t.aiResponse}>
            <ChatBubble from="ai">
              Done! I changed the hero heading to “Flowers made with love, every day.”
            </ChatBubble>
          </Track>
          <Track
            spec={t.aiTyping}
            className="absolute top-0 left-0 flex items-center gap-[4.222px] rounded-[14.074px] bg-editor-bubble px-[11.259px] py-[9.852px]"
          >
            {t.typingDots.map((dot, i) => (
              <Track key={i} spec={dot} className="size-[4.926px] rounded-full bg-muted-foreground" />
            ))}
          </Track>
        </div>
      </div>
      <div className="px-[11.259px] pt-[8.444px] pb-[14.074px]">
        <div className="relative flex items-center gap-[5.63px] rounded-full border-[0.704px] border-border bg-background py-[4.222px] pr-[4.222px] pl-[12.667px] shadow-editor-composer">
          <Track spec={t.promptPlaceholder} className="flex-1 text-[9.148px] leading-[14.074px] text-placeholder">
            Ask WebBlock AI to edit your site…
          </Track>
          <SendButton />
          <Track
            spec={t.typedText}
            className="absolute top-[9.85px] left-[12.67px] h-[11.963px] w-[133px] overflow-hidden text-[9.148px] whitespace-nowrap text-foreground"
          >
            Make the hero heading warmer
          </Track>
        </div>
      </div>
    </div>
  );
}
