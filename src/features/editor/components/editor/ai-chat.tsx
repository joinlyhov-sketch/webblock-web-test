"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Add, ArrowUp, Colorfilter, Edit2 } from "iconsax-reactjs";
import { AiAvatar } from "@/components/common/ai-avatar";
import { toast } from "@/components/common/toast";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { askAiAction } from "../../actions";
import type { AiMessage, BlockName } from "../../types";
import { BLOCK_META } from "./block-meta";
import { BLOCK_SUGGESTIONS, SITE_SUGGESTIONS, type AiSuggestionKind } from "./ai-suggestions";
import { useMedia } from "./editor-context";
import { useEditorPuck } from "./use-editor-puck";

const SUGGESTION_ICON = {
  write: Edit2,
  style: Colorfilter,
  add: Add,
} satisfies Record<AiSuggestionKind, unknown>;

/**
 * Empty chat: a centred welcome and three ideas for the selected section (or the whole site), so the
 * panel isn't a tall blank space before the first message. Picking an idea sends it straight away.
 */
function Welcome({ onPick }: { onPick: (prompt: string) => void }) {
  const selectedType = useEditorPuck((s) => s.selectedItem?.type) as BlockName | undefined;
  const suggestions = selectedType ? BLOCK_SUGGESTIONS[selectedType] : SITE_SUGGESTIONS;
  const sectionLabel = selectedType ? BLOCK_META[selectedType].label : null;

  return (
    <div className="flex flex-1 flex-col justify-center gap-6 py-4">
      <div className="flex flex-col items-center gap-3 text-center motion-safe:animate-fade-up">
        <AiAvatar className="size-12" />
        <div>
          <p className="font-heading text-lg leading-6 font-semibold text-foreground">What should we change?</p>
          <p className="mt-1 text-[13px] leading-5 text-muted-foreground">Describe it and I’ll edit your site for you.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="px-1 text-xs font-medium text-placeholder">
          {sectionLabel ? `Ideas for the ${sectionLabel} section` : "Ideas to get started"}
        </p>
        {/* Keyed by section so the ideas animate in again when another section is selected. */}
        <ul key={selectedType ?? "site"} className="flex flex-col gap-2">
          {suggestions.map((suggestion, i) => {
            const Icon = SUGGESTION_ICON[suggestion.kind];
            return (
              <li key={suggestion.prompt} className="motion-safe:animate-row-in" style={{ animationDelay: `${80 + i * 50}ms` }}>
                <button
                  type="button"
                  onClick={() => onPick(suggestion.prompt)}
                  className="flex w-full items-center gap-3 rounded-[14px] border border-border bg-background px-3 py-2.5 text-left text-[13px] leading-5 text-foreground outline-none transition-[background-color,border-color,scale] duration-150 hover:border-brand-border hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/40 motion-safe:active:scale-[0.99]"
                >
                  <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <Icon variant="Outline" className="size-3.5" />
                  </span>
                  {suggestion.prompt}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Figma "AI Agent tab": chat history (user bubbles right, AI replies left) and the prompt pill. */
export function AiChat() {
  const { websiteId } = useMedia();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [pending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  /** Sends the typed prompt, or `idea` when a suggestion is picked. */
  function send(idea?: string) {
    const text = (idea ?? prompt).trim();
    if (!text || pending) return;
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "USER", text, createdAt: new Date().toISOString() },
    ]);
    if (idea === undefined) setPrompt("");
    startTransition(async () => {
      const result = await askAiAction(websiteId, text);
      if (!result.ok) {
        toast.error("WebBlock AI couldn't answer", result.message);
        return;
      }
      setMessages((current) => [...current, result.data]);
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div role="log" aria-label="WebBlock AI chat" aria-live="polite" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-3 pb-2">
        {messages.length === 0 ? (
          <Welcome onPick={send} />
        ) : (
          // Pushes the conversation to the bottom, next to the prompt, like a messaging app.
          <div aria-hidden className="flex-1" />
        )}
        {messages.map((message, index) => {
          const user = message.role === "USER";
          // Messages from the same sender sit close together; only the last one of a group gets the tail,
          // the avatar and the time.
          const startsGroup = messages[index - 1]?.role !== message.role;
          const endsGroup = messages[index + 1]?.role !== message.role && !(pending && !user);
          const showTime = endsGroup && message.createdAt !== "";
          return (
            <div
              key={message.id}
              className={cn(
                "group flex max-w-full items-end gap-2.5 motion-safe:animate-message-in",
                startsGroup ? "mt-4" : "mt-1",
                user ? "origin-bottom-right self-end pr-2" : "origin-bottom-left self-start",
              )}
            >
              {!user &&
                (endsGroup ? (
                  <AiAvatar className={showTime ? "mb-[22px]" : undefined} />
                ) : (
                  <span aria-hidden className="w-8 shrink-0" />
                ))}
              <div className={cn("flex min-w-0 flex-col gap-1.5", user ? "items-end" : "items-start")}>
                <p
                  className={cn(
                    "relative max-w-[250px] rounded-[20px] px-4 py-2.5 text-[13px] leading-5 break-words whitespace-pre-wrap",
                    user ? "bg-brand-strong text-primary-foreground" : "bg-segment text-foreground",
                    !startsGroup && (user ? "rounded-tr-[6px]" : "rounded-tl-[6px]"),
                    !endsGroup && (user ? "rounded-br-[6px]" : "rounded-bl-[6px]"),
                    endsGroup &&
                      (user
                        ? "before:absolute before:-right-2 before:bottom-0 before:h-4 before:w-4 before:rounded-bl-[16px] before:bg-brand-strong after:absolute after:-right-[10px] after:bottom-0 after:h-4 after:w-[10px] after:rounded-bl-[10px] after:bg-background"
                        : "before:absolute before:-left-2 before:bottom-0 before:h-4 before:w-4 before:rounded-br-[16px] before:bg-segment after:absolute after:-left-[10px] after:bottom-0 after:h-4 after:w-[10px] after:rounded-br-[10px] after:bg-background"),
                  )}
                >
                  {message.text}
                </p>
                {showTime && (
                  <div className="flex items-center gap-2 px-1">
                    <time dateTime={message.createdAt} className="text-[11px] leading-4 text-muted-foreground">
                      {formatTime(message.createdAt)}
                    </time>
                                      </div>
                )}
              </div>
            </div>
          );
        })}
        {pending && (
          <div className="mt-4 flex origin-bottom-left items-end gap-2.5 self-start motion-safe:animate-message-in">
            <AiAvatar />
            <p role="status" className="flex h-8 items-center gap-1 rounded-full border border-border bg-background px-3.5 shadow-button">
              <span className="sr-only">WebBlock AI is typing</span>
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  aria-hidden
                  className="size-1 rounded-full bg-muted-foreground motion-safe:animate-typing-dot"
                  style={{ animationDelay: `${dot * 180}ms` }}
                />
              ))}
            </p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="px-4 pt-3 pb-5"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-background py-1.5 pr-1.5 pl-[18px] shadow-card focus-within:border-brand">
          <input
            aria-label="Ask WebBlock AI"
            placeholder="Make the heading warmer…"
            value={prompt}
            maxLength={500}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[13px] leading-5 text-foreground outline-none placeholder:text-placeholder"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!prompt.trim() || pending}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-strong text-primary-foreground outline-none transition-colors hover:bg-brand-deep focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50"
          >
            <ArrowUp variant="Outline" aria-hidden className="size-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
