"use client";

import { useState } from "react";

type Props = { title: string; intro: string; topics: string[]; replyNote: string; toEmail: string };

export function CleanMonoContactForm({ title, intro, topics, replyNote, toEmail }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(topics[0] ?? "");
  const [message, setMessage] = useState("");

  const subject = `${topic} question`;
  const body = `${message}\n\n— ${name}${email ? ` (${email})` : ""}`;
  const href = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const field =
    "w-full border border-(--cm-ink) bg-white px-4 text-[15px] text-(--cm-ink) outline-none placeholder:text-(--cm-muted) focus:ring-2 focus:ring-(--cm-accent)";
  const label = "cm-mono text-[12px] tracking-[0.06em] text-(--cm-muted)";

  return (
    <div className="flex w-full flex-col gap-5 border border-(--cm-ink) bg-white p-6 sm:p-8 lg:w-[480px] lg:shrink-0">
      <h3 className="cm-display text-[26px] font-bold text-(--cm-ink) lg:text-[30px]">{title}</h3>
      <p className="text-[15px] text-(--cm-muted)">{intro}</p>

      <label className="flex flex-col gap-2">
        <span className={label}>YOUR NAME</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sokha" className={`${field} h-12`} />
      </label>
      <label className="flex flex-col gap-2">
        <span className={label}>EMAIL</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={`${field} h-12`} />
      </label>

      <div className="flex flex-col gap-2.5">
        <span className={label}>I’M ASKING ABOUT</span>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={t === topic}
              onClick={() => setTopic(t)}
              className={`border border-(--cm-ink) px-4 py-2 text-[14px] font-medium transition-colors ${
                t === topic ? "bg-(--cm-ink) text-white" : "bg-white text-(--cm-ink) hover:bg-(--cm-soft)"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className={label}>MESSAGE</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you have in mind…"
          className={`${field} h-[120px] resize-none py-3.5`}
        />
      </label>

      <a
        href={href}
        className="flex items-center justify-center bg-(--cm-ink) px-7 py-4 text-[16px] font-semibold text-white transition-opacity hover:opacity-85"
      >
        Send message →
      </a>
      <p className="text-center text-[13px] text-(--cm-muted)">{replyNote}</p>
    </div>
  );
}
