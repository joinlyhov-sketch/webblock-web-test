"use client";

import { useState } from "react";
import type { Field } from "@puckeditor/core";
import { Add, ArrowDown2, Colorfilter, Edit2, Magicpen, Setting2, SidebarRight } from "iconsax-reactjs";
import { AiAvatar } from "@/components/common/ai-avatar";
import { cn } from "@/lib/utils";
import type { BlockName, SiteRootProps } from "../../types";
import { AiChat } from "./ai-chat";
import { BLOCK_META } from "./block-meta";
import { FieldControl, fieldMeta } from "./field-control";
import { PanelRail } from "./panel-rail";
import { useEditorPuck } from "./use-editor-puck";
import { VisualStyle } from "./visual-style";

type Tab = "content" | "layout";

/** Fields of one tab, in order, with a grey group title whenever the group changes. */
function FieldList({
  fields,
  values,
  tab,
  templateId,
  onChange,
}: {
  fields: Record<string, Field>;
  values: Record<string, unknown>;
  tab: Tab;
  templateId: SiteRootProps["templateId"];
  onChange: (name: string, value: unknown) => void;
}) {
  const visible = Object.entries(fields).filter(([, field]) => {
    const meta = fieldMeta(field);
    return field.visible !== false && (meta.tab ?? "content") === tab && (!meta.templates || meta.templates.includes(templateId));
  });
  if (visible.length === 0) return null;

  const groups: { title?: string; items: [string, Field][] }[] = [];
  for (const entry of visible) {
    const title = fieldMeta(entry[1]).group;
    const last = groups.at(-1);
    if (last && last.title === title) last.items.push(entry);
    else groups.push({ title, items: [entry] });
  }

  return (
    <>
      {groups.map((group, i) => (
        <section key={`${group.title ?? "main"}-${i}`} className="flex flex-col gap-4 px-[18px] py-4">
          {group.title && <p className="-mb-1 text-xs font-medium text-placeholder">{group.title}</p>}
          {group.items.map(([name, field]) => (
            <FieldControl key={name} name={name} field={field} value={values[name]} onChange={(v) => onChange(name, v)} />
          ))}
        </section>
      ))}
    </>
  );
}

/**
 * Right panel (Figma "Panel body"): selected block's Content / Layout & Design, or site settings.
 * Dragging its edge narrow folds it into a slim rail (WebBlock AI, Content, Layout & Design icons);
 * each rail icon opens it again there.
 */
export function PropertiesPanel({
  open,
  onOpenChange,
  width,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Panel width in px (the owner can drag it narrower). */
  width: number;
}) {
  const [tab, setTab] = useState<Tab>("content");
  const [aiOpen, setAiOpen] = useState(false);
  const selectedItem = useEditorPuck((s) => s.selectedItem);
  const content = useEditorPuck((s) => s.appState.data.content);
  const root = useEditorPuck((s) => s.appState.data.root);
  const config = useEditorPuck((s) => s.config);
  const dispatch = useEditorPuck((s) => s.dispatch);
  const getSelectorForId = useEditorPuck((s) => s.getSelectorForId);

  const site = root.props as SiteRootProps;

  // Puck types root props loosely here; the page document is validated with zod on save.
  const setRootProps = (patch: Partial<SiteRootProps>) =>
    dispatch({ type: "replaceRoot", root: { ...root, props: { ...site, ...patch } as typeof root.props } });
  const setRootProp = (name: string, value: unknown) => setRootProps({ [name]: value });

  const setBlockProp = (name: string, value: unknown) => {
    if (!selectedItem) return;
    const selector = getSelectorForId(selectedItem.props.id);
    if (!selector) return;
    dispatch({
      type: "replace",
      destinationIndex: selector.index,
      destinationZone: selector.zone,
      data: { ...selectedItem, props: { ...selectedItem.props, [name]: value } },
    });
  };

  const blockName = selectedItem?.type as BlockName | undefined;
  const meta = blockName ? BLOCK_META[blockName] : undefined;
  const Icon = meta?.icon ?? Setting2;
  const index = selectedItem ? content.findIndex((c) => c.props.id === selectedItem.props.id) : -1;
  const fields = (blockName ? config.components[blockName].fields : config.root?.fields) as Record<string, Field>;
  const values = (selectedItem?.props ?? site) as Record<string, unknown>;

  const openAt = (section: "ai" | Tab) => {
    setAiOpen(section === "ai");
    if (section !== "ai") setTab(section);
    onOpenChange(true);
  };

  return (
    <>
      {!open && (
        <PanelRail
          label="Block settings"
          show={{ label: "Show settings panel", icon: <SidebarRight />, onClick: () => onOpenChange(true) }}
          items={[
            { label: "WebBlock AI", icon: <Magicpen />, onClick: () => openAt("ai") },
            { label: "Content", icon: <Edit2 />, onClick: () => openAt("content") },
            { label: "Layout & Design", icon: <Colorfilter />, onClick: () => openAt("layout") },
          ]}
        />
      )}
      {/* Hidden rather than unmounted while folded, so it reopens where it was (tab, scroll position). */}
      <aside
        aria-label="Block settings"
        style={{ width }}
        className={cn("flex shrink-0 flex-col overflow-hidden rounded-[20px] bg-background shadow-card", !open && "hidden")}
      >
        {/* Figma "Panel header · WebBlock AI switch": opens the AI chat in place of the settings. */}
        <div className="px-4 pt-3 pb-2">
          {/* The whole card is the toggle: the button's ::after stretches over the padding and the chevron, so a
              click anywhere on it works. Only the ✕ sits above it (z-10) with its own action. */}
          <div
            className={cn(
              "group/ai relative flex w-full items-center gap-2.5 rounded-[14px] border py-2 pr-2.5 pl-2",
              "transition-[background-color,border-color,scale] duration-150 ease-out motion-safe:has-[>button:first-child:active]:scale-[0.99]",
              aiOpen ? "border-brand-border bg-primary-soft" : "border-border bg-background hover:border-brand-border hover:bg-primary-soft",
            )}
          >
            <button
              type="button"
              aria-expanded={aiOpen}
              onClick={() => setAiOpen((open) => !open)}
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left outline-none after:absolute after:inset-0 after:rounded-[14px] focus-visible:after:ring-3 focus-visible:after:ring-ring/40"
            >
              <AiAvatar className="size-9" />
              <span className="min-w-0 flex-1">
                <span className={cn("block text-sm leading-5 font-semibold", aiOpen ? "text-brand-deep" : "text-foreground")}>WebBlock AI</span>
                <span className="block truncate text-xs leading-4 text-muted-foreground">
                  {aiOpen ? "Describe a change" : "Ask AI to edit your site"}
                </span>
              </span>
            </button>
            {aiOpen ? (
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setAiOpen(false)}
                className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-brand-deep outline-none transition-[background-color,scale] duration-150 hover:bg-background/70 focus-visible:ring-3 focus-visible:ring-ring/40 motion-safe:active:scale-90"
              >
                <Add aria-hidden className="size-4 rotate-45" />
              </button>
            ) : (
              <span
                aria-hidden
                className="pointer-events-none flex size-7 shrink-0 items-center justify-center rounded-full bg-segment transition-colors group-hover/ai:bg-background"
              >
                <ArrowDown2 className="size-3.5 text-foreground-soft transition-transform duration-200 group-hover/ai:translate-y-0.5" />
              </span>
            )}
          </div>
        </div>

        {aiOpen ? (
          <AiChat />
        ) : (
          <>

            <div className="flex items-center gap-2.5 px-[18px] py-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon aria-hidden className="size-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{meta?.label ?? "Site settings"}</p>
                <p className="text-xs text-muted-foreground">
                  {meta ? `Section ${index + 1} of ${content.length}` : "Business info · select a section to edit it"}
                </p>
              </div>
            </div>

            <div className="px-4 pt-1 pb-2">
              <div role="tablist" aria-label="Settings" className="flex rounded-full bg-segment p-1">
                {(
                  [
                    ["content", "Content"],
                    ["layout", "Layout & Design"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={tab === value}
                    onClick={() => setTab(value)}
                    className={cn(
                      "h-9 flex-1 rounded-full text-sm transition-[background-color,color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                      tab === value ? "bg-background font-semibold text-brand-deep shadow-button" : "font-medium text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto pb-6">
              <FieldList
                key={`${selectedItem?.props.id ?? "root"}-${tab}`}
                fields={fields}
                values={values}
                tab={tab}
                templateId={site.templateId}
                onChange={selectedItem ? setBlockProp : setRootProp}
              />
              {tab === "layout" && (
                <VisualStyle site={site} onChange={setRootProps} />
              )}
              {tab === "content" && !selectedItem && (
                <p className="px-[18px] text-xs text-muted-foreground">
                  These details appear in the header, the Visit us section, the footer and the Contact popup.
                </p>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
