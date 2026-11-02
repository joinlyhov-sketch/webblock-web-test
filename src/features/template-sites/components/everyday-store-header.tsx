"use client";

import { useState } from "react";
import type { EverydayStoreLink } from "../types/everyday-store";

type Props = {
  brand: { name: string; mark: string };
  nav: EverydayStoreLink[];
  statusLabel: string;
  contactLabel: string;
};

export function EverydayStoreHeader({ brand, nav, statusLabel, contactLabel }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="es-header">
      <div className="es-wrap es-nav">
        <a className="es-logo" href="#home" onClick={close}>
          {brand.mark} {brand.name}
        </a>
        <div className="es-right">
          <nav className="es-links" aria-label="Main">
            {nav.map((l) => (
              <a key={l.href} className="es-link" href={l.href}>
                {l.label}
              </a>
            ))}
            <span className="es-status">{statusLabel}</span>
          </nav>
          <a className="es-btn es-btn-contact" href="#contact" onClick={close}>
            {contactLabel}
          </a>
          <button
            type="button"
            className="es-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="es-mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <div id="es-mobile-menu" className="es-menu" data-open={open}>
        {nav.map((l) => (
          <a key={l.href} className="es-link" href={l.href} onClick={close}>
            {l.label}
          </a>
        ))}
        <span className="es-status">{statusLabel}</span>
      </div>
    </header>
  );
}
