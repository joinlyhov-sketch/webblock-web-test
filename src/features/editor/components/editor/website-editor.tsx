"use client";

import "@puckeditor/core/puck.css";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Puck, useGetPuck } from "@puckeditor/core";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ResizeHandle } from "@/components/common/resize-handle";
import { toast } from "@/components/common/toast";
import { useViewportWidth } from "@/hooks/use-viewport-width";
import type { WebsiteStatus } from "@/features/websites";
import { savePageAction } from "../../actions";
import type { MediaAsset, PageData, WebsitePage } from "../../types";
import { editorConfig } from "./editor-config";
import type { Device } from "../preview/devices";
import { useDeploy } from "../preview/use-deploy";
import { EditorCanvas } from "./editor-canvas";
import { MediaContext } from "./editor-context";
import { EditorTopBar, type SaveState } from "./editor-top-bar";
import { PropertiesPanel } from "./properties-panel";
import { StructurePanel } from "./structure-panel";

/**
 * Side panel widths in px. `max` is the Figma width; the owner can drag a panel narrower down to `min`,
 * and further folds it into its icon strip (`RAIL_WIDTH`). On smaller windows `max` drops to `share` of
 * the window (never below `min`), so the canvas keeps room.
 */
const PANEL = {
  structure: { min: 240, max: 300, share: 0.22 },
  properties: { min: 300, max: 384, share: 0.28 },
} as const;

type Panel = keyof typeof PANEL;

/** Width of a folded panel's icon strip (Tailwind `w-14`). */
const RAIL_WIDTH = 56;

type Props = {
  websiteId: string;
  siteName: string;
  /** "petalandstem.webblock.com" */
  domain: string | null;
  /** Live and suspended websites get the Portal button in the top bar. */
  status: WebsiteStatus;
  page: WebsitePage;
  media: MediaAsset[];
};

/**
 * The visual editor (Figma "10 Editor · Layout & Design" / "11 Edit Content"), built on Puck.
 * Every website has its own document: it loads the saved draft, and Save / Deploy write it back.
 */
export function WebsiteEditor({ websiteId, siteName, domain, status, page, media }: Props) {
  const [device, setDevice] = useState<Device>("desktop");
  const savedJson = useRef(JSON.stringify(page.draft));
  const [dirty, setDirty] = useState(false);
  const live = page.publishedAt !== null;
  const [library, setLibrary] = useState(media);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    // Full-bleed (Figma "10 Editor"): cancels the studio layout's padding. Puck wraps EditorShell in a
    // div of its own, so the bleed lives out here.
    <div className="-m-page">
      <MediaContext
        value={{ websiteId, media: library, addMedia: (asset) => setLibrary((current) => [asset, ...current]) }}
      >
        <Puck
          config={editorConfig}
          data={page.draft}
          iframe={{ enabled: false }}
          onChange={(data) => setDirty(JSON.stringify(data) !== savedJson.current)}
        >
          <EditorShell
            websiteId={websiteId}
            siteName={siteName}
            domain={domain}
            portalHref={status === "DRAFT" ? null : `/portal/${websiteId}`}
            device={device}
            onDeviceChange={setDevice}
            saveState={dirty ? "unsaved" : live ? "live" : "draft"}
            dirty={dirty}
            onSaved={(data) => {
              savedJson.current = JSON.stringify(data);
              setDirty(false);
            }}
          />
        </Puck>
      </MediaContext>
    </div>
  );
}

/** Lives inside <Puck> so it can read the current document. */
function EditorShell({
  websiteId,
  siteName,
  domain,
  portalHref,
  device,
  onDeviceChange,
  saveState,
  dirty,
  onSaved,
}: {
  websiteId: string;
  siteName: string;
  domain: string | null;
  portalHref: string | null;
  device: Device;
  onDeviceChange: (device: Device) => void;
  saveState: SaveState;
  dirty: boolean;
  onSaved: (data: PageData) => void;
}) {
  const router = useRouter();
  const getPuck = useGetPuck();
  const deploy = useDeploy(websiteId);
  const [busy, setBusy] = useState<"save" | "preview" | "deploy" | null>(null);
  /** "Leave without saving?" for the back button; closing the tab uses the browser's own warning. */
  const [leaveOpen, setLeaveOpen] = useState(false);
  // Both panels can be dragged narrower, or folded into an icon strip, to see more of the website.
  const viewport = useViewportWidth();
  const [open, setOpen] = useState<Record<Panel, boolean>>({ structure: true, properties: true });
  const [widths, setWidths] = useState<Record<Panel, number>>({
    structure: PANEL.structure.max,
    properties: PANEL.properties.max,
  });
  const maxOf = (panel: Panel) =>
    Math.max(PANEL[panel].min, Math.min(PANEL[panel].max, Math.round(viewport * PANEL[panel].share)));
  const widthOf = (panel: Panel) => Math.min(widths[panel], maxOf(panel));
  const setPanelOpen = (panel: Panel) => (next: boolean) => setOpen((o) => ({ ...o, [panel]: next }));
  const handleFor = (panel: Panel, label: string, side: "left" | "right") => (
    <ResizeHandle
      label={label}
      panel={side}
      value={open[panel] ? widthOf(panel) : RAIL_WIDTH}
      min={PANEL[panel].min}
      max={maxOf(panel)}
      onChange={(width) => setWidths((w) => ({ ...w, [panel]: width }))}
      collapsed={!open[panel]}
      collapsedWidth={RAIL_WIDTH}
      onCollapsedChange={(folded) => setPanelOpen(panel)(!folded)}
    />
  );
  const [, startTransition] = useTransition();
  const currentData = () => getPuck().appState.data as PageData;

  /** Saves the draft; returns false (and shows why) on failure. */
  const save = async (data: PageData, quiet = false) => {
    const result = await savePageAction(websiteId, data);
    if (!result.ok) {
      toast.error("Couldn't save your changes", result.message);
      return false;
    }
    onSaved(data);
    if (!quiet) toast.success("Draft saved", "Visitors still see your last deployed version.");
    return true;
  };

  const run = (kind: "save" | "preview" | "deploy", task: () => Promise<void>) => {
    setBusy(kind);
    startTransition(async () => {
      try {
        await task();
      } finally {
        setBusy(null);
      }
    });
  };

  return (
    <div className="bg-dot-grid flex h-dvh min-h-[640px] flex-col">
      <ConfirmDialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        onConfirm={() => router.push("/websites")}
        title="Leave without saving?"
        description="You have changes that aren’t saved yet. If you leave now, they’ll be lost."
        confirmLabel="Leave editor"
      />
      <EditorTopBar
        siteName={siteName}
        domain={domain}
        portalHref={portalHref}
        saveState={saveState}
        device={device}
        onDeviceChange={onDeviceChange}
        busy={busy}
        onBack={(e) => {
          if (!dirty) return;
          e.preventDefault();
          setLeaveOpen(true);
        }}
        onSave={() => run("save", async () => void (await save(currentData())))}
        onPreview={() =>
          run("preview", async () => {
            if (dirty && !(await save(currentData(), true))) return;
            router.push(`/websites/${websiteId}/preview`);
          })
        }
        onDeploy={() =>
          run("deploy", async () => {
            // The backend deploys the saved draft, so save what is on screen first.
            if (!(await save(currentData(), true))) return;
            await deploy();
          })
        }
      />
      <div className="flex min-h-0 flex-1 p-2">
        <StructurePanel open={open.structure} onOpenChange={setPanelOpen("structure")} width={widthOf("structure")} />
        {handleFor("structure", "Resize page panel", "left")}
        <EditorCanvas device={device} />
        {handleFor("properties", "Resize settings panel", "right")}
        <PropertiesPanel open={open.properties} onOpenChange={setPanelOpen("properties")} width={widthOf("properties")} />
      </div>
    </div>
  );
}
