/** Scoped styles for the Everyday store template (Petal & Stem). Plain CSS, namespaced with `es-`. */
export const everydayStoreCss = `
html{scroll-behavior:smooth}
.es-root{--es-navy:#1b2b4b;--es-muted:#5a6b8c;--es-blue:#2f6bc4;--es-blue-soft:#e8effc;--es-surface:#f5f8fe;--es-line:#e5e7eb;--es-field:#9fb0d9;--es-green:#1f8a4c;--es-green-soft:#e3f5ea;--es-map:#e8f0e5;--es-park:#cce3c7;
font-family:var(--font-dm-sans),system-ui,sans-serif;color:var(--es-navy);background:#fff;min-height:100vh;-webkit-font-smoothing:antialiased}
.es-root *,.es-root *::before,.es-root *::after{box-sizing:border-box}
.es-root a{color:inherit;text-decoration:none}
.es-root h1,.es-root h2,.es-root h3,.es-root p{margin:0}
.es-root button,.es-root input,.es-root textarea{font:inherit;color:inherit}
.es-root [id]{scroll-margin-top:76px}
.es-root :focus-visible{outline:2px solid var(--es-blue);outline-offset:2px;border-radius:8px}
.es-wrap{width:100%;max-width:1296px;margin:0 auto;padding:0 16px}
@media(min-width:600px){.es-wrap{padding:0 40px}}
@media(min-width:1024px){.es-wrap{padding:0 72px}}

/* header */
.es-header{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid var(--es-line)}
.es-nav{display:flex;align-items:center;justify-content:space-between;height:66px;gap:16px}
.es-logo{font-family:var(--font-familjen-grotesk),sans-serif;font-weight:700;font-size:19px;letter-spacing:-.2px;white-space:nowrap;border-radius:8px}
.es-right{display:flex;align-items:center;gap:22px}
.es-links{display:none;align-items:center;gap:22px}
.es-link{font-size:13px;font-weight:500;color:var(--es-muted);padding:6px 0;transition:color .15s}
.es-link:hover{color:var(--es-navy)}
.es-status{display:none;align-items:center;gap:8px;font-size:12px;font-weight:600;color:var(--es-green);white-space:nowrap}
.es-status::before{content:"";width:6px;height:6px;border-radius:50%;background:#22a06b}
.es-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--es-navy);background:var(--es-navy);color:#fff!important;font-weight:600;font-size:13px;line-height:1;padding:11px 20px;border-radius:10px;cursor:pointer;transition:background .15s,transform .15s,box-shadow .15s}
.es-btn:hover{background:#2a3d66;transform:translateY(-1px);box-shadow:0 8px 18px rgba(27,43,75,.18)}
.es-burger{display:inline-flex;flex-direction:column;justify-content:center;gap:5px;width:36px;height:36px;padding:8px;background:none;border:0;cursor:pointer;border-radius:8px}
.es-burger span{display:block;height:2px;background:var(--es-navy);border-radius:2px;transition:transform .2s,opacity .2s}
.es-burger[aria-expanded="true"] span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.es-burger[aria-expanded="true"] span:nth-child(2){opacity:0}
.es-burger[aria-expanded="true"] span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.es-menu{display:none;flex-direction:column;gap:4px;padding:8px 16px 18px;border-top:1px solid var(--es-line);background:#fff}
.es-menu[data-open="true"]{display:flex}
.es-menu .es-link{font-size:15px;padding:10px 4px}
.es-menu .es-status{display:inline-flex;margin-top:6px}
@media(min-width:600px){.es-links{display:flex}.es-burger,.es-menu,.es-menu[data-open="true"]{display:none}}
@media(min-width:900px){.es-status{display:inline-flex}}
@media(max-width:599px){.es-btn-contact{padding:9px 16px;border-radius:999px}.es-right{gap:10px}}

/* hero */
.es-hero{padding:8px 0 40px}
.es-hero-grid{display:flex;flex-direction:column;gap:20px}
.es-hero-copy{display:flex;flex-direction:column;gap:16px;padding:24px 0 0}
.es-hero h1{font-size:34px;line-height:1.1;letter-spacing:-.5px;font-weight:700;font-family:var(--font-familjen-grotesk),sans-serif}
.es-hero-body{font-size:15px;line-height:1.55;color:var(--es-muted)}
.es-hero-cta{display:flex;flex-direction:column;gap:14px;align-items:center}
.es-hero-cta .es-btn{width:100%;padding:16px;border-radius:12px;font-size:15px}
.es-textlink{font-weight:600;font-size:14px;text-decoration:underline!important;text-underline-offset:4px;transition:color .15s}
.es-textlink:hover{color:var(--es-blue)}
.es-hero-img{aspect-ratio:4/3;overflow:hidden;border-radius:24px}
.es-hero-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s}
.es-hero-img:hover img{transform:scale(1.03)}
.es-hero-order{display:contents}
@media(max-width:599px){.es-hero-grid{flex-direction:column-reverse}.es-hero-grid{flex-direction:column}}
@media(min-width:600px){.es-hero-grid{flex-direction:row;align-items:center;gap:0;background:#f5f7fa;border-radius:24px;overflow:hidden}.es-hero-copy{flex:1;padding:32px 20px 32px 32px;gap:18px}.es-hero h1{font-size:36px}.es-hero-cta{flex-direction:row;align-items:center;gap:12px}.es-hero-cta .es-btn{width:auto;padding:12px 20px;border-radius:999px}.es-hero-img{width:42%;aspect-ratio:auto;align-self:stretch;min-height:320px;border-radius:0}}
@media(min-width:1024px){.es-hero{padding:12px 0 72px}.es-hero-grid{background:none;border-radius:0;overflow:visible;justify-content:space-between}.es-hero-copy{padding:0 56px 0 0;gap:16px}.es-hero h1{font-size:56px;line-height:1.04;letter-spacing:-1.2px}.es-hero-body{font-size:15px;line-height:1.4;max-width:400px}.es-hero-cta{gap:24px}.es-hero-cta .es-btn{border-radius:10px;padding:11px 16px;font-size:13px}.es-hero-img{width:570px;height:451px;min-height:0;align-self:auto;border-radius:20px;flex:none}}

/* section headings */
.es-eyebrow{display:none;font-size:10px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--es-muted);background:#fff;border:1px solid var(--es-line);border-radius:999px;padding:7px 12px}
.es-head{display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.es-h2{font-family:var(--font-familjen-grotesk),sans-serif;font-weight:700;font-size:26px;line-height:1.15;letter-spacing:-.4px}
@media(min-width:600px){.es-head{align-items:center;text-align:center}.es-h2{font-size:34px}.es-eyebrow{display:inline-flex}}
@media(min-width:1024px){.es-head{align-items:flex-start;text-align:left}.es-h2{font-size:32px}.es-eyebrow{display:none}}

/* featured */
.es-featured{padding:24px 0 56px}
.es-featured-top{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:24px}
.es-viewall-link{display:none;font-size:12px;font-weight:600;text-decoration:underline!important;text-underline-offset:3px}
.es-viewall-link:hover{color:var(--es-blue)}
.es-featured-row{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -16px;padding:0 16px 4px;scrollbar-width:none}
.es-featured-row::-webkit-scrollbar{display:none}
.es-featured-row>*{flex:0 0 70%;scroll-snap-align:start}
.es-viewall-btn{display:inline-flex;margin-top:18px;font-size:14px;font-weight:600;text-decoration:underline!important;text-underline-offset:4px}
.es-viewall-btn:hover{color:var(--es-blue)}
@media(min-width:600px){.es-featured-top{flex-direction:column;align-items:center}.es-featured-row{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;overflow:visible;margin:0;padding:0}.es-featured-row>*:nth-child(4){display:none}.es-viewall-wrap{display:flex;justify-content:center}.es-viewall-btn{margin-top:28px;border:1px solid var(--es-line);border-radius:999px;padding:12px 22px;text-decoration:none!important}.es-viewall-btn:hover{background:var(--es-surface)}}
@media(min-width:1024px){.es-featured{padding:16px 0 96px}.es-featured-top{flex-direction:row;align-items:flex-end;margin-bottom:34px}.es-featured-row{grid-template-columns:repeat(4,1fr);gap:17px}.es-featured-row>*:nth-child(4){display:block}.es-viewall-link{display:inline}.es-viewall-wrap{display:none}}

/* product card */
.es-card{display:flex;flex-direction:column;gap:10px}
.es-card-img{aspect-ratio:4/3;border-radius:14px;overflow:hidden;background:var(--es-surface);box-shadow:0 0 0 1px rgba(27,43,75,.06)}
.es-card-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}
.es-card:hover .es-card-img img{transform:scale(1.06)}
.es-card:hover .es-card-name{color:var(--es-blue)}
.es-card-cap{display:flex;align-items:flex-end;justify-content:space-between;gap:8px}
.es-card-name{font-family:var(--font-familjen-grotesk),sans-serif;font-weight:600;font-size:13px;line-height:1.2;transition:color .15s}
.es-card-note{font-size:11px;color:var(--es-muted);margin-top:2px;line-height:1.3}
.es-card-price{font-weight:700;font-size:13px;white-space:nowrap}
@media(min-width:600px){.es-card-name{font-size:15px}.es-card-note{font-size:12px}}
@media(min-width:1024px){.es-card-name{font-size:13px}.es-card-note{font-size:11px}}

/* catalog */
.es-catalog{background:var(--es-surface);padding:40px 0 48px}
.es-tools{display:flex;flex-direction:column;gap:14px;margin:20px 0 24px}
.es-search{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--es-field);border-radius:12px;padding:0 14px;height:44px;transition:box-shadow .15s}
.es-search:focus-within{box-shadow:0 0 0 3px rgba(47,107,196,.18)}
.es-search input{flex:1;min-width:0;border:0;outline:0;background:none;font-size:14px}
.es-search input::placeholder{color:var(--es-muted)}
.es-search svg{flex:none;color:var(--es-navy)}
.es-tabs{display:flex;gap:22px;overflow-x:auto;scrollbar-width:none}
.es-tabs::-webkit-scrollbar{display:none}
.es-tab{flex:none;background:none;border:0;border-bottom:2px solid transparent;padding:6px 2px;font-size:14px;font-weight:500;color:var(--es-muted);cursor:pointer;transition:color .15s,border-color .15s}
.es-tab:hover{color:var(--es-navy)}
.es-tab[aria-pressed="true"]{color:var(--es-navy);border-bottom-color:var(--es-navy)}
.es-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px 12px}
.es-empty{padding:48px 0;text-align:center;color:var(--es-muted);font-size:14px;grid-column:1/-1}
.es-pager{display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:32px}
.es-pager-info{font-size:12px;color:var(--es-muted)}
.es-pager-info b{color:var(--es-navy)}
.es-pages{display:flex;gap:6px;align-items:center}
.es-page{min-width:34px;height:34px;padding:0 10px;display:inline-flex;align-items:center;justify-content:center;gap:6px;background:none;border:1px solid transparent;border-radius:10px;font-size:13px;font-weight:500;color:var(--es-muted);cursor:pointer;transition:background .15s,color .15s,border-color .15s}
.es-page:hover:not(:disabled){background:#fff;color:var(--es-navy);border-color:var(--es-line)}
.es-page[aria-current="page"]{background:var(--es-navy);color:#fff;border-color:var(--es-navy)}
.es-page-edge{border-color:var(--es-line);background:#fff;color:var(--es-navy)}
.es-page:disabled{opacity:.4;cursor:default}
.es-page-label{display:none}
.es-gap{color:var(--es-muted);padding:0 4px}
@media(min-width:600px){.es-catalog{padding:56px 0}.es-tools{flex-direction:row;align-items:center;justify-content:space-between}.es-search{width:300px;border-radius:999px}.es-tabs{gap:8px}.es-tab{border:1px solid var(--es-line);background:#fff;border-radius:999px;padding:8px 14px;font-size:13px;color:var(--es-navy)}.es-tab[aria-pressed="true"]{background:var(--es-navy);color:#fff;border-color:var(--es-navy)}.es-grid{grid-template-columns:repeat(3,1fr);gap:24px 20px}}
@media(min-width:1024px){.es-catalog{padding:72px 0 56px;background:#fff}.es-tools{margin:22px 0 24px}.es-search{width:285px;height:36px;border-radius:8px;background:var(--es-surface);padding:0 12px}.es-search input{font-size:12px}.es-tabs{gap:20px}.es-tab{border:0;border-bottom:2px solid transparent;background:none;border-radius:0;padding:4px 0;font-size:12px;color:var(--es-muted)}.es-tab[aria-pressed="true"]{background:none;color:var(--es-navy);border-bottom-color:var(--es-navy)}.es-grid{grid-template-columns:repeat(4,1fr);gap:28px 17px}.es-pager{flex-direction:row-reverse;justify-content:space-between;margin-top:34px}.es-page-label{display:inline}.es-page-edge{border-radius:8px}}

/* about */
.es-about{padding:40px 0 48px}
.es-about-grid{display:flex;flex-direction:column;gap:20px}
.es-about-img{border-radius:20px;overflow:hidden;aspect-ratio:700/298}
.es-about-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s}
.es-about-img:hover img{transform:scale(1.04)}
.es-about h2{font-family:var(--font-familjen-grotesk),sans-serif;font-weight:700;font-size:26px;letter-spacing:-.4px;margin-bottom:10px}
.es-about p{font-size:15px;line-height:1.6;color:var(--es-muted);max-width:560px}
@media(min-width:600px){.es-about{padding:56px 0}.es-about-grid{flex-direction:row;align-items:center;gap:32px}.es-about-img{flex:none;width:260px;height:300px;aspect-ratio:auto}.es-about h2{font-size:32px}}
@media(min-width:1024px){.es-about{padding:56px 0 64px}.es-about-grid{gap:54px}.es-about-img{width:480px;height:361px}.es-about h2{font-size:28px}.es-about p{font-size:14px;line-height:1.55}}

/* visit */
.es-visit{background:var(--es-surface);padding:36px 0 48px}
.es-visit .es-head{align-items:center;text-align:center}
.es-visit .es-eyebrow{display:inline-flex;color:var(--es-blue);background:var(--es-blue-soft);border-color:transparent;font-weight:700}
.es-visit-grid{display:flex;flex-direction:column;gap:16px;margin-top:28px}
.es-mapbox{display:flex;flex-direction:column;gap:16px}
.es-map{position:relative;display:block;overflow:hidden;background:var(--es-map);border-radius:24px;height:215px;transition:box-shadow .2s}
.es-map:hover{box-shadow:0 10px 28px rgba(27,43,75,.12)}
.es-road{position:absolute;background:#fff}
.es-park{position:absolute;border-radius:50%;background:var(--es-park)}
.es-pin{position:absolute;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:rgba(47,107,196,.25);display:grid;place-items:center}
.es-pin::after{content:"";width:14px;height:14px;border-radius:50%;background:var(--es-blue);border:2px solid #fff;box-sizing:border-box}
.es-pin-label{position:absolute;background:#fff;border-radius:10px;padding:8px 14px;box-shadow:0 4px 12px rgba(60,120,207,.14);white-space:nowrap}
.es-pin-label b{display:block;font-size:13px;font-weight:600}
.es-pin-label span{font-size:11px;color:var(--es-muted)}
.es-map-open{position:absolute;right:12px;bottom:12px;background:#fff;color:var(--es-blue);font-size:12px;font-weight:600;border-radius:999px;padding:8px 14px;box-shadow:0 4px 12px rgba(60,120,207,.14)}
.es-info{background:#fff;border-radius:18px;padding:22px;box-shadow:0 10px 30px rgba(27,43,75,.1)}
.es-info h3{font-family:var(--font-familjen-grotesk),sans-serif;font-size:20px;font-weight:700;letter-spacing:-.2px}
.es-chip-open{display:inline-flex;align-items:center;gap:6px;margin:8px 0 14px;font-size:11px;font-weight:500;color:var(--es-green);background:var(--es-green-soft);border-radius:999px;padding:4px 10px}
.es-chip-open::before{content:"";width:5px;height:5px;border-radius:50%;background:#22a06b}
.es-rows{border-top:1px solid var(--es-line);padding-top:14px;display:flex;flex-direction:column;gap:14px;margin-bottom:16px}
.es-row{display:flex;gap:12px;align-items:flex-start;border-radius:10px}
a.es-row:hover .es-row-val{color:var(--es-blue)}
.es-ico{flex:none;width:28px;height:28px;border-radius:50%;background:var(--es-blue-soft);color:var(--es-blue);display:grid;place-items:center}
.es-row-lab{font-size:10px;color:var(--es-muted)}
.es-row-val{font-size:12px;font-weight:500;line-height:1.5;transition:color .15s;display:block}
.es-btn-wide{width:100%;padding:13px;border-radius:999px;font-size:13px}
.es-form{background:#fff;border:1px solid var(--es-line);border-radius:24px;padding:28px 22px}
.es-form h3{font-family:var(--font-familjen-grotesk),sans-serif;font-size:22px;font-weight:700;letter-spacing:-.3px}
.es-form-sub{font-size:12px;color:var(--es-muted);margin:6px 0 16px;line-height:1.4}
.es-label{display:block;font-size:11px;font-weight:500;margin:0 0 6px}
.es-field{display:block;width:100%;background:var(--es-surface);border:1px solid var(--es-field);border-radius:10px;padding:0 12px;height:36px;font-size:12px;margin-bottom:14px;outline:0;transition:box-shadow .15s}
textarea.es-field{height:90px;padding:10px 12px;resize:vertical}
.es-field:focus{box-shadow:0 0 0 3px rgba(47,107,196,.2)}
.es-field::placeholder{color:var(--es-muted)}
.es-topics{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.es-topic{background:#fff;border:1px solid var(--es-muted);border-radius:999px;padding:6px 12px;font-size:11px;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
.es-topic:hover{background:var(--es-surface)}
.es-topic[aria-pressed="true"]{background:var(--es-blue-soft);border-color:var(--es-blue);color:var(--es-blue)}
.es-form .es-btn{width:100%;padding:13px;border-radius:999px;font-size:12px}
.es-reply{text-align:center;font-size:11px;color:var(--es-muted);margin-top:14px}
@media(min-width:600px){.es-visit{padding:56px 0}.es-map{height:260px}.es-info{padding:24px}.es-form{padding:28px}}
@media(min-width:1024px){.es-visit{padding:44px 0 56px}.es-visit-grid{flex-direction:row;align-items:stretch;gap:18px;margin-top:40px}.es-mapbox{position:relative;display:block;flex:1;min-height:506px}.es-map{position:absolute;inset:0;height:auto}.es-info{position:absolute;left:18px;bottom:0;width:285px}.es-form{width:360px;flex:none}}

/* footer */
.es-footer{border-top:1px solid var(--es-line);padding:28px 0 32px;background:#fff}
.es-footer-grid{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;font-size:12px;color:var(--es-muted)}
.es-footer-brand{font-family:var(--font-familjen-grotesk),sans-serif;font-weight:700;font-size:16px;color:var(--es-navy)}
.es-footer a:hover{color:var(--es-navy)}
.es-social{display:flex;gap:16px;font-weight:600;color:var(--es-blue)}
.es-social a:hover{text-decoration:underline!important}
.es-footer-mid{display:flex;flex-direction:column;align-items:center;gap:8px}
@media(min-width:1024px){.es-footer{padding:36px 0 40px;border-top:0}.es-footer-grid{flex-direction:row;justify-content:space-between;align-items:flex-start;font-size:11px}.es-footer-brand{font-size:12px;flex:1;text-align:left}.es-footer-mid{flex:2}.es-footer-note{flex:1;text-align:right}}

@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.es-root *{transition:none!important}}
`;
