# WebBlock Web

The frontend of **WebBlock**, a platform where small businesses build and publish a simple website
(products, business info, contact) on their own `<name>.webblock.com` subdomain.

This repository has three parts:

- **User portal**: sign up, pick a template, edit the site in the studio editor, manage products and
  business info, deploy, and handle the subscription.
- **Admin portal**: users, websites, subscriptions and plans, notifications, and monitoring
  (activity and deploy pipeline).
- **Public sites**: the generated business websites. They are **non-transactional**: no cart, checkout,
  booking or payment. Their buttons only call, email, open Google Maps directions, or link to an external site.

> **Backend status:** the Spring Boot API is not built yet. Every screen runs on mock data behind
> `src/features/*/api.ts`. That file is the only thing to change when the real API is ready.

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (design tokens in `src/app/globals.css`) |
| UI | shadcn/ui (Radix) · icons from `iconsax-reactjs` |
| Editor | Puck (`@puckeditor/core`) |
| Charts / toasts / motion | Recharts · Sonner · Motion (always through the wrappers in `src/components/common`) |
| Validation | Zod |
| Package manager | **pnpm** (only pnpm; npm and yarn are blocked) |

## Getting started

**Requirements:** Node.js 24 (see `.nvmrc`) and pnpm (version pinned in `package.json` →
`packageManager`; `corepack enable` installs the right one).

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

### Signing in (mock)

There is no real login yet. On `/sign-in`, use the **Enter as User** or **Enter as Admin** buttons.
They set a mock session cookie (`wb_role`) and take you to `/websites` or `/admin`.

### Mock billing on Vercel

Demo payment snapshots are saved in the HTTP-only `wb_mock_payments` cookie so a different
Vercel instance can reconstruct the payment success screen, subscription and receipt history.
The cookie lasts 30 days and retains up to three recent orders, within the browser cookie size
limit. Start a new payment after deploying this fix: orders created by the old memory-only
implementation cannot be recovered after that server instance is gone. Clearing cookies or
opening the link in another browser also removes access to those demo orders.

This is mock session storage, like `wb_role`; it is not verified bank payment data. Real billing
must use the Spring API with database storage and bank-confirmed status. No extra Vercel
environment variables are needed for the current demo.

Run `pnpm test:billing` to test payment rendering and account recovery across isolated instances.

### Mock deployments on Vercel

The HTTP-only `wb_mock_deployments` cookie keeps up to six recent demo deployment snapshots
for 30 days, within the browser cookie size limit. Progress and completion can be reconstructed
after a server instance changes, and duplicate starts reuse the original deployment ID.
Deployments created before this fix cannot be recovered after their server instance is gone;
those links show a recovery screen with a link back to the editor. Start a new deployment
after redeploying this fix. Real deployment records and published content must live in the backend.

Run `pnpm test:deploy` to test deployment progress, completion and recovery across isolated instances.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build (also type-checks) |
| `pnpm start` | Run the production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `node .claude/hooks/invariants.mjs --all` | Project rule checks (see [Rules](#rules)) |

## Project structure

```
src/
  app/                 Routes only. Thin page.tsx files that load data through a feature
    (auth)/            sign-in, register, OTP, password reset
    (project)/         user dashboard: websites, templates, settings, support
    (studio)/          website and template editor
    (billing)/         plans and subscription payment
    (site)/ sites/     generated public websites and template previews
    portal/            per-website portal: info, products, monitoring
    admin/             admin portal
    api/               mock-only route handlers (mock auth, mock media)
  features/<name>/     business code, one folder per feature
  components/ui/       shadcn/ui primitives
  components/common/   shared design-system components (DataTable, Modal, charts...)
  components/layout/   sidebars and app shells
  lib/                 API client and errors, auth session, formatting, table/URL helpers
  mocks/               fake data (only features/*/api.ts may import it)
  config/              navigation and site constants
  hooks/               shared client hooks
public/mock/           fake images used by the mocks
```

Every feature has the same shape. `src/features/websites` is the reference to copy:

```
features/<name>/
  components/   UI used only by this feature
  actions.ts    "use server" writes: auth check → service/api → revalidatePath
  service.ts    optional: form validation and combining several api calls
  api.ts        data access (mock now, Spring API later)
  schemas.ts    form validation (zod)
  types.ts      entity types, same shape as the API DTOs
  index.ts      public exports; pages import a feature only from here
```

Imports flow one way: `app → features → components/common → components/ui → packages`.

## Rules

These are checked automatically (`.claude/hooks/invariants.mjs`) on every edit, in `/verify`, and in CI:

1. **Zero-transaction websites:** no cart, checkout, payment form, booking or WhatsApp in website or
   editor code. Subscription billing (KHQR via WeBill365) lives only in `features/billing` and only shows the QR
   returned by the API. The backend talks to WeBill; the frontend never calls it.
2. **The backend owns the logic:** retries, deploy states, OTP, SSL and payment. The frontend
   triggers actions and shows results.
3. **Every Server Action starts with an auth check:** `requireAdmin()`, `requireWebsiteOwner(id)`
   or `requireUser()`.
4. **Mock data matches the API DTOs:** camelCase, UUID string ids, prices as strings, ISO-8601 UTC dates.

Full conventions (design tokens, fonts, loading/empty/error states, formatting) are in
[`CLAUDE.md`](CLAUDE.md) and [`.claude/rules/`](.claude/rules).

## Contributing

- **Branches:** create `feature/<short-name>` from `dev` and open a pull request into `dev`.
  Never commit directly to `dev` or `Master`. `Master` is for submission and only the designated
  teammate merges into it.
- **Before opening a PR:** `pnpm lint`, `pnpm build` and `node .claude/hooks/invariants.mjs --all`
  must pass.
- **CI** (`.github/workflows/ci.yml`) runs on pushes to `dev`/`Master` and on PRs into them:
  invariant checks and their tests, lint, build, and a gitleaks secret scan.
- Commit `pnpm-lock.yaml` whenever dependencies change. Never commit `.env`.
