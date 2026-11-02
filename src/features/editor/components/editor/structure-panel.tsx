"use client";

import { useState } from "react";
import { Drawer } from "@puckeditor/core";
import { Add, AddSquare, Copy, Layer, Menu, SidebarLeft, Trash } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BlockName } from "../../types";
import { BLOCK_META, BLOCK_ORDER } from "./block-meta";
import { PanelRail } from "./panel-rail";
import { useEditorPuck } from "./use-editor-puck";

/** Puck's zone for top-level blocks. */
const ROOT_ZONE = "root:default-zone";

/**
 * Scrolls the canvas to the block at `index`, so choosing a section in the list takes you to it.
 * Puck marks every block's element with `data-puck-component`; it can take a frame to appear after an insert.
 */
function scrollToBlock(index: number) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const go = () => {
    const canvas = document.getElementById("website-canvas");
    const block = canvas?.querySelectorAll<HTMLElement>("[data-puck-component]")[index];
    block?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };
  requestAnimationFrame(() => requestAnimationFrame(go));
}

/** Moves focus to the first button inside `id` once the panel is open again. */
function focusIn(id: string) {
  requestAnimationFrame(() => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ block: "nearest" });
    section?.querySelector<HTMLElement>("button")?.focus();
  });
}

/**
 * Figma left panel: "Page structure" (select, duplicate, delete, drag to reorder) + "Add a block".
 * The sidebar icon next to the title (or dragging its edge narrow) folds it into a slim rail (sidebar,
 * Page structure and Add a block icons) so the website gets more room; each rail icon opens it again.
 */
export function StructurePanel({
  open,
  onOpenChange,
  width,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Panel width in px (the owner can drag it narrower). */
  width: number;
}) {
  const content = useEditorPuck((s) => s.appState.data.content);
  const itemSelector = useEditorPuck((s) => s.appState.ui.itemSelector);
  const dispatch = useEditorPuck((s) => s.dispatch);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const selectedIndex = itemSelector && (itemSelector.zone ?? ROOT_ZONE) === ROOT_ZONE ? itemSelector.index : -1;
  const select = (index: number | null) => {
    dispatch({ type: "setUi", ui: { itemSelector: index === null ? null : { index, zone: ROOT_ZONE } } });
    if (index !== null) scrollToBlock(index);
  };

  const insert = (type: BlockName) => {
    const index = selectedIndex >= 0 ? selectedIndex + 1 : content.length;
    dispatch({ type: "insert", componentType: type, destinationIndex: index, destinationZone: ROOT_ZONE });
    select(index);
  };

  const move = (from: number, to: number) => {
    if (from === to) return;
    dispatch({ type: "reorder", sourceIndex: from, destinationIndex: to, destinationZone: ROOT_ZONE });
    select(to);
  };

  const openAt = (section: "page-structure" | "add-block-list") => {
    onOpenChange(true);
    focusIn(section);
  };

  return (
    <>
      {!open && (
        <PanelRail
          label="Page"
          show={{ label: "Show page panel", icon: <SidebarLeft />, onClick: () => onOpenChange(true) }}
          items={[
            { label: "Page structure", icon: <Layer />, onClick: () => openAt("page-structure") },
            { label: "Add a block", icon: <AddSquare />, onClick: () => openAt("add-block-list") },
          ]}
        />
      )}
      {/* Hidden rather than unmounted while folded, so it reopens where it was (scroll position). */}
      <aside
        aria-label="Page"
        style={{ width }}
        className={cn("flex shrink-0 flex-col overflow-hidden rounded-[20px] bg-background shadow-card", !open && "hidden")}
      >
        <section className="p-4">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Hide page panel"
              aria-expanded
              title="Hide page panel"
              className="-ml-1.5 size-7 [&_svg]:size-4"
              onClick={() => onOpenChange(false)}
            >
              <SidebarLeft />
            </Button>
            <h2 className="-ml-1.5 flex-1 font-sans whitespace-nowrap text-[13px] font-semibold text-foreground">Page structure</h2>
            <span className="min-w-0 truncate text-[11px] font-medium text-placeholder">Drag to reorder</span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Add a section"
              title="Add a section"
              className="size-6"
              onClick={() => document.getElementById("add-block-list")?.querySelector<HTMLElement>("button")?.focus()}
            >
              <Add />
            </Button>
          </div>

          {content.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
              Your page is empty. Add a block below.
            </p>
          ) : (
            <ol id="page-structure" className="flex flex-col gap-0.5 pt-3">
              {content.map((item, index) => {
                const meta = BLOCK_META[item.type as BlockName];
                const Icon = meta.icon;
                const selected = index === selectedIndex;
                return (
                  <li
                    key={item.props.id}
                    draggable
                    onDragStart={(e) => {
                      setDragFrom(index);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(index);
                    }}
                    onDragEnd={() => {
                      setDragFrom(null);
                      setDragOver(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragFrom !== null) move(dragFrom, index);
                      setDragFrom(null);
                      setDragOver(null);
                    }}
                    className={cn(
                      "group flex h-[38px] items-center gap-2.5 rounded-xl border pr-2.5 pl-3 transition-colors",
                      selected ? "border-brand-border bg-primary-soft" : "border-transparent hover:bg-muted",
                      dragOver === index && dragFrom !== index && "border-dashed border-brand",
                      dragFrom === index && "opacity-50",
                    )}
                  >
                    <button
                      type="button"
                      aria-current={selected || undefined}
                      onClick={() => select(index)}
                      onKeyDown={(e) => {
                        if (e.altKey && e.key === "ArrowUp" && index > 0) move(index, index - 1);
                        if (e.altKey && e.key === "ArrowDown" && index < content.length - 1) move(index, index + 1);
                      }}
                      title="Alt + ↑/↓ to move"
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-2.5 text-left text-[13px] outline-none focus-visible:underline",
                        selected ? "font-semibold text-brand-deep" : "font-medium text-foreground",
                      )}
                    >
                      <Icon aria-hidden className="size-[15px] shrink-0" />
                      <span className="truncate">{meta.label}</span>
                    </button>
                    {selected && (
                      <span className="flex gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-[26px] [&_svg]:size-3.5"
                          aria-label={`Duplicate ${meta.label}`}
                          onClick={() => {
                            dispatch({ type: "duplicate", sourceIndex: index, sourceZone: ROOT_ZONE });
                            select(index + 1);
                          }}
                        >
                          <Copy />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-[26px] hover:text-danger [&_svg]:size-3.5"
                          aria-label={`Remove ${meta.label}`}
                          onClick={() => {
                            dispatch({ type: "remove", index, zone: ROOT_ZONE });
                            select(null);
                          }}
                        >
                          <Trash />
                        </Button>
                      </span>
                    )}
                    <Menu aria-hidden className="size-[15px] shrink-0 cursor-grab text-placeholder" />
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="flex min-h-0 flex-1 flex-col px-4 pt-4 pb-1.5">
          <h2 className="font-sans text-[13px] font-semibold text-foreground">Add a block</h2>
          {/* Puck spaces drawer items with --puck-space-3 (12px); Figma uses 8px between blocks. */}
          <div id="add-block-list" className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pt-2.5 pb-3 [--puck-space-3:8px]">
            <Drawer>
              {BLOCK_ORDER.map((name) => {
                const meta = BLOCK_META[name];
                const Icon = meta.icon;
                return (
                  <Drawer.Item key={name} name={name} label={meta.label}>
                    {() => (
                      <div className="flex h-[56px] cursor-grab items-center gap-2.5 rounded-[14px] border border-border bg-background pr-3 pl-2.5 shadow-card transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-button-hover">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-brand-soft text-brand">
                          <Icon aria-hidden className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold text-foreground">{meta.label}</span>
                          <span className="block truncate text-[11px] text-muted-foreground">{meta.hint}</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Add ${meta.label}`}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => insert(name)}
                        >
                          <Add className="text-brand" />
                        </Button>
                      </div>
                    )}
                  </Drawer.Item>
                );
              })}
            </Drawer>
          </div>
        </section>
      </aside>
    </>
  );
}

