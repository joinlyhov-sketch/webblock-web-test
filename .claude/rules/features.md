---
paths:
  - "src/features/**"
  - "src/mocks/**"
---

# Feature rules

Every feature has this shape. Copy `src/features/websites` when unsure (zod validation:
`src/features/auth/schemas.ts`).

```
features/<name>/
  components/   UI only this feature uses
  actions.ts    Server Actions (writes): require*() check first, then service.ts or api.ts
  service.ts    OPTIONAL: logic between actions/pages and api
  api.ts        data access — the ONLY file that touches mocks or the HTTP client
  schemas.ts    form validation rules
  types.ts      entity types = API DTO shape
  index.ts      public exports
```
Never create top-level `src/actions/`, `src/service/`, `src/types/` or `src/components/<feature>/`.

## service.ts (optional)
- Use it when a screen or form needs real logic: reading and validating a `FormData` with
  `schemas.ts`, checking an uploaded image, combining several `api.ts` calls into one view.
- It calls `api.ts` (its own or another feature's) and never imports `@/mocks` or the HTTP client,
  so it stays unchanged when Spring replaces the mocks.
- Read functions (`getWebsitesView`) are called by pages; write functions by `actions.ts`.
- Skip it for simple features: the action validates and calls one `api.ts` function directly.

## api.ts (the swap point)
- Function signatures must match the future Spring endpoint: same params (pass `websiteId` even if the
  mock ignores it), same return type, same errors.
- Mock implementation rules:
  - `async`, with a short delay (200–400 ms) so loading states are visible.
  - Lists return `Page<T>` from `@/lib/api/types` (`{ items, page, size, totalItems }`), never a bare array.
  - Not found / failure → `throw new ApiError({ title, status, detail })` from `@/lib/api/errors`.
  - Mutable data uses `mockCollection` from `@/lib/mock-state`; never put it on `globalThis` or in browser cookies.
  - Wrap asynchronous mock API operations and composing services with `mockApi` so nested changes share one isolated, durable snapshot.
  - Synchronous internal helpers run inside their caller's `mockApi` operation. Keep fixture definitions outside request operations.
  - Vercel requires a server-only PostgreSQL `DATABASE_URL`; local development uses the gitignored `.data` file.
- No mappers, no view models, no silent fallbacks for missing fields. Return data as-is.
- When Spring is ready, only the function bodies change (openapi-fetch call). Nothing else.

## types.ts
- One type per entity, same shape as the API JSON: camelCase, `id: string` (UUID),
  `price: string` (decimal), dates as ISO-8601 UTC `string`, nullable fields as `T | null`.
- Status enums are UPPER_SNAKE string unions, e.g. `"LIVE" | "DEPLOYING" | "DRAFT" | "FAILED"`.

## mocks
- `src/mocks/<entity>.ts` exports typed arrays (`Product[]`), importing types from the feature.
- Images are URL strings to `public/mock/...` (`"/mock/products/iced-latte.webp"`), never `import img`.
- Include edge cases: `imageUrl: null`, very long names, KHR prices, empty lists.

## index.ts
- Export only what pages need: view components, service/api read functions, types (`export type *`).
- Pages, `components/common`, `components/layout` and `config` import through `@/features/<name>`;
  inside a feature use relative imports.
- Exceptions (to avoid import cycles between index files):
  - a feature's `api.ts`/`service.ts`/`types.ts` may import another feature's `api`, `types` or
    `service` file directly (`@/features/websites/api`);
  - client components import Server Actions directly from `@/features/<name>/actions`.

## Components
- Server Components by default; `"use client"` only for interactive leaves.
- Shared code stays with its owner. Ask: "is it about one kind of data, or generic?"
  - About one feature's data (e.g. `ChooseTemplateModal`, business-details rules, `listWebsites()`):
    it stays in that feature; other features import it. Never copy it.
  - Generic, knows no feature's data: components → `src/components/common/`, form/format/URL helpers
    → `src/lib/`, client hooks → `src/hooks/`.
- `src/lib/` holds only generic building blocks: `lib/actions/result.ts` is the `ActionResult` type every
  action returns and `lib/api/` holds `ApiError`, `Page<T>` and the HTTP client — not real actions or endpoints.
