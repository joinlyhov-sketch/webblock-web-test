import type { ReactNode } from "react";
import type { EverydayStoreContent } from "../types/everyday-store";
import { EverydayStoreCatalog } from "./everyday-store-catalog";
import { EverydayStoreContactForm } from "./everyday-store-contact-form";
import { EverydayStoreHeader } from "./everyday-store-header";
import { EverydayStoreProductCard } from "./everyday-store-product-card";
import { everydayStoreCss } from "./everyday-store-styles";
import { telHref } from "@/lib/tel";

function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="es-ico" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

export function EverydayStoreSite({ content }: { content: EverydayStoreContent }) {
  const { business: b, hero, featured, catalog, about, visit } = content;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.address)}`;
  const tel = telHref(b.phone);
  const hoursLine = b.hours.map((h) => `${h.days} ${h.hours}`);
  const featuredProducts = featured.productIds
    .map((id) => catalog.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="es-root" id="home">
      <style dangerouslySetInnerHTML={{ __html: everydayStoreCss }} />
      <EverydayStoreHeader brand={content.brand} nav={content.nav} statusLabel={content.statusLabel} contactLabel={content.contactLabel} />

      <main>
        <section className="es-hero">
          <div className="es-wrap es-hero-grid">
            <div className="es-hero-copy">
              <h1>{hero.title}</h1>
              <p className="es-hero-body">{hero.body}</p>
              <div className="es-hero-cta">
                <a className="es-btn" href={hero.primaryCta.href}>
                  {hero.primaryCta.label}
                </a>
                <a className="es-textlink" href={hero.secondaryCta.href}>
                  {hero.secondaryCta.label}
                </a>
              </div>
            </div>
            <div className="es-hero-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.imageUrl} alt={hero.imageAlt} width={700} height={433} />
            </div>
          </div>
        </section>

        <section className="es-featured" id="popular">
          <div className="es-wrap">
            <div className="es-featured-top">
              <div className="es-head">
                <span className="es-eyebrow">{featured.eyebrow}</span>
                <h2 className="es-h2">{featured.title}</h2>
              </div>
              <a className="es-viewall-link" href="#shop">
                {featured.linkLabel} &rarr;
              </a>
            </div>
            <div className="es-featured-row">
              {featuredProducts.map((p) => (
                <EverydayStoreProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="es-viewall-wrap">
              <a className="es-viewall-btn" href="#shop">
                {featured.linkLabel} <span aria-hidden="true">&nbsp;&rarr;</span>
              </a>
            </div>
          </div>
        </section>

        <EverydayStoreCatalog
          eyebrow={catalog.eyebrow}
          title={catalog.title}
          searchPlaceholder={catalog.searchPlaceholder}
          categories={catalog.categories}
          pageSize={catalog.pageSize}
          emptyLabel={catalog.emptyLabel}
          products={catalog.products}
        />

        <section className="es-about" id="about">
          <div className="es-wrap es-about-grid">
            <div className="es-about-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={about.imageUrl} alt={about.imageAlt} width={700} height={298} loading="lazy" />
            </div>
            <div>
              <h2>{about.title}</h2>
              <p>{about.body}</p>
            </div>
          </div>
        </section>

        <section className="es-visit" id="visit">
          <div className="es-wrap">
            <div className="es-head">
              <span className="es-eyebrow">{visit.eyebrow}</span>
              <h2 className="es-h2">{visit.title}</h2>
            </div>
            <div className="es-visit-grid">
              <div className="es-mapbox">
                <a className="es-map" href={directions} target="_blank" rel="noopener noreferrer" aria-label={visit.mapLabel}>
                  <span className="es-park" style={{ left: "52%", top: "-22%", width: "30%", height: "52%" }} />
                  <span className="es-road" style={{ left: 0, right: 0, top: "43%", height: 8 }} />
                  <span className="es-road" style={{ left: 0, right: 0, top: "63%", height: 6 }} />
                  <span className="es-road" style={{ top: 0, bottom: 0, left: "41%", width: 6 }} />
                  <span className="es-road" style={{ top: 0, bottom: 0, left: "68%", width: 5 }} />
                  <span className="es-road" style={{ top: "-20%", bottom: "-20%", left: "8%", width: 6, transform: "rotate(18deg)" }} />
                  <span className="es-pin" style={{ left: "66%", top: "63%" }} />
                  <span className="es-pin-label" style={{ left: "68%", top: "50%" }}>
                    <b>{b.name}</b>
                    <span>{b.address}</span>
                  </span>
                  <span className="es-map-open">{visit.mapLabel}</span>
                </a>
                <div className="es-info">
                  <h3>{b.name}</h3>
                  <span className="es-chip-open">{content.statusLabel}</span>
                  <div className="es-rows">
                    <a className="es-row" href={directions} target="_blank" rel="noopener noreferrer">
                      <Icon>
                        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </Icon>
                      <span>
                        <span className="es-row-lab">Address</span>
                        <span className="es-row-val">{b.address}</span>
                      </span>
                    </a>
                    <div className="es-row">
                      <Icon>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </Icon>
                      <span>
                        <span className="es-row-lab">Opening hours</span>
                        {hoursLine.map((l) => (
                          <span key={l} className="es-row-val">
                            {l}
                          </span>
                        ))}
                      </span>
                    </div>
                    <a className="es-row" href={tel}>
                      <Icon>
                        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
                      </Icon>
                      <span>
                        <span className="es-row-lab">Call us</span>
                        <span className="es-row-val">{b.phone}</span>
                      </span>
                    </a>
                    <a className="es-row" href={`mailto:${b.email}`}>
                      <Icon>
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 6 9-6" />
                      </Icon>
                      <span>
                        <span className="es-row-lab">Email</span>
                        <span className="es-row-val">{b.email}</span>
                      </span>
                    </a>
                  </div>
                  <a className="es-btn es-btn-wide" href={directions} target="_blank" rel="noopener noreferrer">
                    {visit.directionsLabel} <span aria-hidden="true">&nearr;</span>
                  </a>
                </div>
              </div>
              <EverydayStoreContactForm toEmail={b.email} brandName={b.name} {...content.contactForm} />
            </div>
          </div>
        </section>
      </main>

      <footer className="es-footer">
        <div className="es-wrap es-footer-grid">
          <span className="es-footer-brand">
            {content.brand.mark} {content.brand.name}
          </span>
          <div className="es-footer-mid">
            <p>
              <a href={`mailto:${b.email}`}>{b.email}</a> &middot; <a href={tel}>{b.phone}</a> &middot;{" "}
              <a href={directions} target="_blank" rel="noopener noreferrer">
                {b.address}
              </a>
            </p>
            <p>{hoursLine.join(" · ")}</p>
            <div className="es-social">
              {content.social.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label} &nearr;
                </a>
              ))}
            </div>
          </div>
          <span className="es-footer-note">{content.footerNote}</span>
        </div>
      </footer>
    </div>
  );
}
