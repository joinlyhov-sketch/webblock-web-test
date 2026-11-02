# Responsive verification — 2026-11-02

Continued from `D:\responsive-codex\responsive-notes.md`. Existing uncommitted changes and tests were preserved. Installed Next.js guides for layouts, CSS, viewport configuration, and TypeScript were read before editing.

## Changes by route

| Routes | Files | Problem and fix |
| --- | --- | --- |
| `/websites`, `/templates`, `/settings/*`, `/support` | `src/components/layout/{bottom-nav,mobile-header,app-sidebar-shell}.tsx`, `src/app/(project)/layout.tsx` | Shared glass header and bottom navigation below 1024px, using existing navigation definitions. Account controls remain reachable; content reserves safe-area clearance. |
| `/admin/*` | `src/components/layout/{admin-sidebar,sidebar-shell}.tsx`, `src/app/admin/layout.tsx`, `src/features/admin/components/{admin-page-header,notifications-view}.tsx` | Tablet sidebar replaced by bottom tabs; Monitoring opens a sheet. Notification inbox width constrained for long content. |
| `/portal/[websiteId]/*` | `src/components/layout/owner-sidebar-shell.tsx`, `src/app/portal/[websiteId]/layout.tsx` | Shared mobile navigation and account sheet retain links to the editor, website, and My Websites. |
| Admin lists and billing history | `src/components/common/{data-table,compact-table}.tsx`, `src/app/globals.css` | Wide phone tables use labeled cards; tablet tables scroll locally with a sticky first column. Touch controls are at least 44px. |
| Product, business information, support, account forms | Respective feature forms, `src/app/globals.css` | Phone columns stack, input text is at least 16px, and long forms keep submit controls reachable. |
| Dialogs and detail sheets | `src/components/common/modal.tsx`, `src/components/ui/dialog.tsx`, `src/app/globals.css` | Phone bottom sheets scroll internally and reset centered translations so content stays onscreen. |
| `/billing/plans`, `/billing/pay/[orderId]` | `src/features/billing/components/{billing-shell,fit-screen,payment-parts}.tsx` | Mobile billing content uses normal-size scrollable layout. Continuation review found a domain spilling outside its summary tile; it now wraps below 1024px, with the monthly price kept together. |
| `/websites/[websiteId]/edit` and studio previews | `src/features/editor/components/editor/{website-editor,editor-top-bar,editor-canvas}.tsx` | Phone/tablet editor panels open as sheets, the toolbar wraps, and the separate studio layout has no bottom navigation. |
| Landing, auth, public site and legal pages | Landing components, route loading files, `src/components/common/page-skeleton.tsx`, `src/app/layout.tsx` | Responsive navigation, headings, skeletons, spacing, viewport safe-area support, and reduced-motion behavior. |

## Validation

- Production server: `http://localhost:3001`. No server on port 3000 was stopped.
- Playwright MCP used with a visible browser for manual layout, payment, and editor-panel review.
- Original three failing 360×740 checks rerun: **5 passed**, including auth setup.
- Full headed suite: **395 passed, 1 failed in 32.9 minutes**. All responsive checks at the six requested sizes passed. The failure was the duplicate `/websites` check in the existing `user` project timing out at `page.waitForLoadState("networkidle")`; its trace contains successful requests and no console errors. **The unchanged rerun passed in 4.3 seconds (3 passed including auth setup, 6.5 seconds total).** This is recorded as an intermittent network-idle timeout, not a confirmed product defect. The original failure artifacts and full HTML report are preserved.
- Follow-up payment and editor-panel checks on the rebuilt app: **11 passed, 3 intentionally skipped in 2.6 minutes**, including 2 auth setup checks. Payment passed at all six viewport sizes; both editor panels passed at 360px, 390px, and 768px. The 3 skipped desktop sheet cases use inline panels, covered by the existing editor tests.
- Final production build and TypeScript checks passed, including the payment text fix.
- Lint: no errors; existing unused `Lock1` import warning in `plans-view.tsx`.

## Desktop review

Compared admin Overview, My Websites, and owner Products at 1024×768, 1280×800, and 1536×864 against the saved baseline screenshots. Sidebar and grid geometry, content spacing, colors, typography, and card styling are visually consistent. My Websites baseline has a previously created mock website, a paid plan, and a different avatar; restarting the mock server restored seeded data. Those images are therefore unsuitable for exact pixel equality. Owner Products differences are confined to the mock avatar; admin charts and relative-time content also produce small image differences.

## Artifacts and reproduction

- Route/viewport screenshots: `test-results/screenshots/`.
- Baselines: `test-results/screenshots/baseline/`.
- Desktop review: `test-results/screenshots/desktop-review/`.
- Full-run videos and traces: `test-results/runs/`.
- Full HTML report: `playwright-report/index.html`.
- Follow-up HTML report: `test-results/follow-up-report/index.html`; videos/traces: `test-results/follow-up-runs/`.
- Timeout rerun report: `test-results/rerun-report/index.html`; artifacts: `test-results/rerun-runs/`.
- Follow-up specs: `tests/responsive-flows.spec.ts`.

```powershell
$env:PORT='3001'
npx playwright test --headed --workers=1
npx playwright test --ui
```

## Coverage limits

- Chromium with the six requested viewport sizes; physical devices, Safari/WebKit, Firefox, virtual keyboards, and real notch/safe-area rendering were not exercised.
- Mock users and seeded websites/templates were used. Real authentication, real bank payments, email delivery, and production deployment were not tested.
- Follow-up checks exercise the production mock's waiting/paid screens and automatic redirect. Expired codes and regeneration are not covered: the development-only `?mock=expire` shortcut is disabled in production. Live bank confirmation is not tested.
- Screenshots review representative desktop shells; no exact pixel-equality claim across every route or mock data state.
- Playwright UI replay was omitted after the user asked to finish faster; headed CLI checks and MCP visual review were completed instead.
