"use client";

import { useState } from "react";

type Props = {
  toEmail: string;
  brandName: string;
  title: string;
  subtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  topicLabel: string;
  topics: string[];
  messageLabel: string;
  messagePlaceholder: string;
  sendLabel: string;
  replyNote: string;
};

export function EverydayStoreContactForm(p: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(p.topics[0] ?? "");
  const [message, setMessage] = useState("");

  const subject = `${topic} - ${p.brandName}`;
  const body = `${message}\n\n${name}${email ? ` (${email})` : ""}`;
  const href = `mailto:${p.toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div id="contact" className="es-form">
      <h3>{p.title}</h3>
      <p className="es-form-sub">{p.subtitle}</p>
      <label className="es-label" htmlFor="es-name">
        {p.nameLabel}
      </label>
      <input id="es-name" className="es-field" value={name} placeholder={p.namePlaceholder} onChange={(e) => setName(e.target.value)} />
      <label className="es-label" htmlFor="es-email">
        {p.emailLabel}
      </label>
      <input id="es-email" type="email" className="es-field" value={email} placeholder={p.emailPlaceholder} onChange={(e) => setEmail(e.target.value)} />
      <span className="es-label">{p.topicLabel}</span>
      <div className="es-topics" role="group" aria-label={p.topicLabel}>
        {p.topics.map((t) => (
          <button key={t} type="button" className="es-topic" aria-pressed={t === topic} onClick={() => setTopic(t)}>
            {t}
          </button>
        ))}
      </div>
      <label className="es-label" htmlFor="es-message">
        {p.messageLabel}
      </label>
      <textarea id="es-message" className="es-field" value={message} placeholder={p.messagePlaceholder} onChange={(e) => setMessage(e.target.value)} />
      <a className="es-btn" href={href}>
        {p.sendLabel} <span aria-hidden="true">&rarr;</span>
      </a>
      <p className="es-reply">{p.replyNote}</p>
    </div>
  );
}
