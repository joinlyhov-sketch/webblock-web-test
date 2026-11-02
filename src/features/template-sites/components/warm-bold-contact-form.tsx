"use client";

import { useState } from "react";

type WarmBoldContactFormProps = {
  title: string;
  subtitle: string;
  topics: string[];
  replyNote: string;
  toEmail: string;
  brandName: string;
};

const labelClass = "wb-mono text-[11px] tracking-[1.1px] text-[var(--wb-muted)]";
const inputClass =
  "w-full border-0 border-b border-[rgba(246,236,220,0.5)] bg-transparent pb-2.5 text-[15px] text-[var(--wb-cream)] outline-none transition-colors placeholder:text-[var(--wb-muted)] focus:border-[var(--wb-amber)]";

export function WarmBoldContactForm({ title, subtitle, topics, replyNote, toEmail, brandName }: WarmBoldContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(topics[0] ?? "");
  const [message, setMessage] = useState("");

  const subject = `${topic} — message for ${brandName}`;
  const body = `${message}\n\n— ${name}${email ? ` (${email})` : ""}`;
  const href = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="flex flex-col gap-[22px] rounded-md border border-[var(--wb-line)] bg-[var(--wb-bg)] p-6 lg:p-9">
      <h3 className="wb-display text-[26px] font-semibold text-[var(--wb-cream)] lg:text-[30px]">{title}</h3>
      <p className="-mt-2 text-[15px] text-[var(--wb-muted)]">{subtitle}</p>

      <label className="flex flex-col gap-2.5">
        <span className={labelClass}>YOUR NAME</span>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sokha" autoComplete="name" />
      </label>
      <label className="flex flex-col gap-2.5">
        <span className={labelClass}>EMAIL</span>
        <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
      </label>
      <div className="flex flex-col gap-2.5">
        <span className={labelClass}>I’M ASKING ABOUT</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Topic">
          {topics.map((t) => {
            const on = t === topic;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setTopic(t)}
                className={`rounded px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wb-amber)] ${
                  on
                    ? "bg-[var(--wb-amber)] text-[var(--wb-bg)]"
                    : "border border-[var(--wb-line)] text-[var(--wb-cream)] hover:border-[var(--wb-amber)]"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
      <label className="flex flex-col gap-2.5">
        <span className={labelClass}>MESSAGE</span>
        <textarea
          className={`${inputClass} h-24 resize-none`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you have in mind…"
        />
      </label>
      <a
        href={href}
        className="flex items-center justify-center rounded bg-[var(--wb-amber)] px-6 py-3.5 text-base font-semibold text-[var(--wb-bg)] transition-colors hover:bg-[#ffc968] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wb-cream)]"
      >
        Send message →
      </a>
      <p className={`${labelClass} text-center`}>{replyNote}</p>
    </div>
  );
}
