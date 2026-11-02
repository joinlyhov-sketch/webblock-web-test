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

### Shared demo data on Vercel (required)

Vercel instances do not share JavaScript memory. The demo now stores mutable data through
`src/lib/mock-state.ts`: published pages, editor drafts and versions, uploaded images, websites
and ownership, products, business details, payments, subscriptions, deployment history, account
settings, notifications and admin changes. Public visitors read the same server-owned data;
they do not need the owner's browser cookies. The old payment/deployment data cookies are ignored.

Before deploying:

1. Connect a PostgreSQL database to the Vercel project. You can use an existing database or
   [a PostgreSQL integration from the Vercel Marketplace](https://vercel.com/docs/marketplace-storage).
2. Set the server-only `DATABASE_URL` (or `POSTGRES_URL`) for every Vercel environment you use.
   Use your provider's pooled, TLS-enabled connection URL. Never prefix it with `NEXT_PUBLIC_`.
3. Redeploy the app. The first request creates `webblock_demo_state` automatically; the database
   role needs permission to create that table initially, then read and update its records.
4. Save and deploy your website again. Data lost by an older memory-only instance cannot be
   recovered. New records remain available across deployments that use the same database and namespace.

`WEBBLOCK_DATA_NAMESPACE` defaults to `webblock-demo-v1`. Use separate databases or namespaces
for independent production and preview data. A missing database on Vercel returns a configuration
error instead of accepting changes that will disappear. See [.env.example](.env.example).

Without a database, local development and `next start` use `.data/webblock-state.json`, which is
gitignored and survives process restarts. `WEBBLOCK_STATE_FILE` can select another local file;
it is not a substitute for shared database storage on Vercel.

The storage layer isolates concurrent requests, retries conflicting commits, and saves nested
feature changes together. Uploaded bytes are encoded for storage and restored for public image
requests. This is a small demo backend; payment confirmation, deployment timing, login and email
remain mocks until Spring is connected. A full backend should use entity tables and object storage.

For publicly shared sites, use the production domain. A preview URL protected by
[Vercel Deployment Protection](https://vercel.com/docs/deployment-protection) requires Vercel
sign-in before a request reaches this app, regardless of the app's public `/sites/` route.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build (also type-checks) |
| `pnpm start` | Run the production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Shared-state, public-site, payment and deployment regression tests |
| `pnpm test:state` | Shared-state and concurrent write regression tests |
| `pnpm test:billing` | Payment and receipt regression tests |
| `pnpm test:deploy` | Deployment and public publishing regression tests |
| `pnpm test:production` | Real HTTP checks across a production server restart (run after `pnpm build`) |
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
