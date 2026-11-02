@AGENTS.md

# WebBlock Web (platform frontend)

Next.js App Router + TypeScript + Tailwind. Backend is Spring Boot (not built yet):
every screen runs on mock data behind `features/*/api.ts`, ready to swap to the real API.

## Commands
- `pnpm dev` — dev server
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm lint` — ESLint
- `pnpm build` — production build
- Package manager is **pnpm** (version pinned in `package.json` `packageManager`; commit `pnpm-lock.yaml`).
  Never use npm or yarn here. Dependency build scripts must be approved (`pnpm approve-builds`,
  stored in `pnpm-workspace.yaml`).
- After each change: `/verify quick` (seconds). Before saying a task is done, committing or pushing: `/verify` (includes the build)

## Map
| Folder | Holds |
|---|---|
| `src/app/` | ROUTES only. Thin `page.tsx`: fetch via a feature, render it |
| `src/features/<name>/` | Business code. Same shape in every feature (see below) |
| `src/components/ui/` | Layer 1 shadcn/ui primitives (button, table, pagination). No business logic |
| `src/components/common/` | Layer 2 design system (DataTable, StatusBadge, Modal, Toast, charts) |
| `src/components/layout/` | Sidebars and app shells |
| `src/lib/` | API client, ApiError, ActionResult, auth session, format, table-query (URL page/sort) |
| `src/mocks/` | Fake data (plain arrays). ONLY `features/*/api.ts` may import it |
| `public/mock/` | Fake images. Referenced as URL strings in mocks |
| `src/config/` | Sidebar nav items, site constants |
| `src/hooks/` | Generic client hooks shared by features (e.g. `use-url-param`) |

Feature shape (no top-level `src/actions`, `src/service` or `src/types` — everything lives in the feature):
```
features/<name>/
  components/   UI only this feature uses
  actions.ts    "use server" writes: require*() → service (or api) → revalidatePath
  service.ts    OPTIONAL logic between actions and api: reads/validates forms with schemas.ts,
                combines several api calls into one screen's data. Never imports mocks.
                Skip it when an action only validates and calls one api function.
  api.ts        data access: mock now, Spring later (the ONLY swap point)
  schemas.ts    form validation rules
  types.ts      one type per entity, same shape as the API (no mappers)
  index.ts      public exports — pages import a feature only through this
```
Flow: `actions.ts` (who may do it) → `service.ts` (what to do) → `api.ts` (where the data is).

**Reference feature: `src/features/websites`** (has every file: actions, service, api, schemas, types,
components, index). When building any new feature, copy its patterns. For form validation copy the zod
style of `src/features/auth/schemas.ts` (websites still uses hand-written checks).

## Import direction (never reverse)
`app → features → components/common → components/ui → npm packages`
`features → lib` · `features/*/api.ts → mocks`
Never import `sonner`, `recharts`, `@radix-ui/*` or Puck directly: use the wrappers in `components/`.

## Invariants (enforced by `.claude/hooks/invariants.mjs` on every edit and in `/verify`)
1. ZERO-TRANSACTION: no cart, checkout, payment form, booking, or WhatsApp in website/editor code.
   Website CTAs only: `tel:`, `mailto:`, Google Maps directions, external `https://` links.
   Platform subscription billing (KHQR via WeBill365) lives only in `features/billing`, and it only
   DISPLAYS the QR returned by the API. The backend talks to WeBill; never call it from the frontend.
2. Backend owns logic: retries, deploy state machine, OTP, SSL, payment. Frontend triggers and displays.
3. Every Server Action starts with the right check: `requireAdmin()` in features/admin,
   `requireWebsiteOwner(websiteId)` when it acts on a website, otherwise `requireUser()`.
4. Mock data uses the API DTO shape (camelCase, UUID string ids, price as string, ISO-8601 UTC dates).

## Conventions
- Server Components by default. `"use client"` only on leaves: forms, modals, toggles, menus.
- Reads in Server Components via `api.ts`. Writes via Server Actions. Never fetch data in actions.
- Filters, tabs, search, pagination live in URL `searchParams`.
- Mock functions: async, short delay, return `Page<T>` for lists, throw `ApiError` on failure.
- Every list screen has loading, empty and error states.
- Format at render with `lib/format.ts` (USD/KHR, dates, 12-hour time).
- Named exports. kebab-case file names. No `any`.
- Reuse a `components/common` component before creating a new one.

## Design (from Figma)
Headings Familjen Grotesk, body DM Sans. White background, one accent `#4379D6`,
neutral borders `#E5E7EB`. Page titles in `#4379D6`. Tokens live in `src/app/globals.css`
`@theme` — never hardcode hex values in components. Product images are 4:3.
UI library: **shadcn/ui only** (no Mantine/MUI). Icons: **`iconsax-reactjs`** only.
Details and component usage: `.claude/rules/components.md`.

## Workflow
- New feature: `/new-feature <name>` · Figma screen → code: `/figma-to-screen <figma-url>`
- Bugs: `/investigate` — no fix without a reproduction first.
- Review before committing: ask the `code-reviewer` and `invariant-auditor` agents.
- CI (`.github/workflows/ci.yml`) runs the invariant checks, their tests, lint, build and gitleaks
  on pushes to `dev`/`Master` and pull requests into them.
- Branches (names are case-sensitive):
  - `Master` — submission only. Only the designated teammate merges `dev` into `Master`. Never commit to it.
  - `dev` — integration. Never commit to it directly; changes arrive by pull request.
  - `feature/<name>` — one per feature, created from `dev`, short kebab-case name
    (e.g. `feature/products`, `feature/admin-users`) → pull request into `dev`.
- Never edit `.claude/hooks/` to make a check pass; if a rule looks wrong, stop and ask.
- Commits and pull requests carry no Claude attribution: no `Co-Authored-By: Claude` trailer, no
  "Generated with Claude Code" line, no session link (also turned off in `.claude/settings.json` `attribution`).
