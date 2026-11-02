"use client";

import { useState } from "react";

type Props = { email: string; title: string; intro: string; topics: string[]; replyNote: string };

const CHIP_TINTS = ["bg-(--sp-butter)", "bg-(--sp-mint)", "bg-(--sp-lilac)", "bg-(--sp-pink-soft)"];
const fieldClass =
  "w-full rounded-full border border-(--sp-border) bg-(--sp-cream) px-5 text-[15px] text-(--sp-ink) outline-none placeholder:text-(--sp-muted-2) focus-visible:ring-2 focus-visible:ring-(--sp-pink)";

export function SweetPastelContact({ email, title, intro, topics, replyNote }: Props) {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [topic, setTopic] = useState(topics[0] ?? "");
  const [message, setMessage] = useState("");

  const body = `${message}\n\nFrom: ${name}${from ? ` <${from}>` : ""}`;
  const href = `mailto:${email}?subject=${encodeURIComponent(`${topic} question`)}&body=${encodeURIComponent(body)}`;

  return (
    <div id="contact" className="flex scroll-mt-24 flex-col gap-5 rounded-[32px] bg-white p-6 md:p-8 lg:w-[400px] lg:shrink-0 xl:w-[480px]">
      <h3 className="font-(family-name:--font-fredoka) text-[26px] font-bold text-(--sp-ink) md:text-[30px]">{title}</h3>
      <p className="text-[15px] text-(--sp-muted-2)">{intro}</p>
      <label className="flex flex-col gap-2 text-[13px] font-medium text-(--sp-ink)">
        Your name
        <input className={`${fieldClass} h-12`} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sokha" autoComplete="name" />
      </label>
      <label className="flex flex-col gap-2 text-[13px] font-medium text-(--sp-ink)">
        Email
        <input
          className={`${fieldClass} h-12`}
          type="email"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>
      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-medium text-(--sp-ink)">I’m asking about</span>
        <div className="flex flex-wrap gap-2">
          {topics.map((t, i) => (
            <button
              key={t}
              type="button"
              aria-pressed={t === topic}
              onClick={() => setTopic(t)}
              className={`rounded-full px-4 py-2 text-[14px] font-medium transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-(--sp-ink) focus-visible:outline-none ${
                t === topic ? "bg-(--sp-pink) text-white" : `${CHIP_TINTS[(i + 3) % 4]} text-(--sp-ink)`
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <label className="flex flex-col gap-2 text-[13px] font-medium text-(--sp-ink)">
        Message
        <textarea
          className={`${fieldClass} h-[120px] resize-none rounded-3xl py-3.5`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you have in mind…"
        />
      </label>
      <a
        href={href}
        className="flex items-center justify-center rounded-full bg-(--sp-pink) px-6 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-(--sp-pink-dark) focus-visible:ring-2 focus-visible:ring-(--sp-ink) focus-visible:outline-none"
      >
        Send message →
      </a>
      <p className="text-center text-[13px] text-(--sp-muted-2)">{replyNote}</p>
    </div>
  );
}
