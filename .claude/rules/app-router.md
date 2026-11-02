---
paths:
  - "src/app/**"
  - "src/proxy.ts"
---

# App Router rules

- `app/` is routing only. A `page.tsx` does three things: read `params`/`searchParams`,
  call a feature's `api.ts` function, render a feature component. No business logic, no JSX longer
  than ~30 lines, no inline data.
- Pages and layouts are Server Components. Never put `"use client"` on a page or layout.
- `params` and `searchParams` are Promises: `const { websiteId } = await params;`
- Import features only through their `index.ts`: `import { listProducts, ProductsView } from "@/features/products";`
- Filters, tabs, search, pagination, grid/list view → URL `searchParams`, not React state.
- Each route group has `loading.tsx` (skeleton) and `error.tsx` (`"use client"`, shows message + retry).
- Route groups and their shells:
  - `(landing-page)` landing · `(auth)` auth pages · `(project)` user sidebar
  - `(studio)` full-screen editor/preview/deploy and template preview, no sidebar
  - `(billing)` plans and KHQR (WeBill365) payment screens, own full-page layout
  - `(site)` the sample template websites (`/template-sites/[templateId]`), rendered like a customer site
  - `portal/[websiteId]` Owner Portal sidebar · `admin/` Admin Portal sidebar
- Page content padding: 15px from the sidebar and 15px from the right edge.
- `proxy.ts` is an optimistic redirect only (session cookie present? admin role?).
  Real authorization happens in `require*()` inside pages and actions.

```tsx
// Example: thin page
export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ websiteId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { websiteId } = await params;
  const query = await searchParams;
  await requireWebsiteOwner(websiteId);
  // URL ?page is 1-based; parseTableQuery returns the 0-based page, size and sort for api.ts.
  const data = await listProducts(websiteId, parseTableQuery(query));
  return <ProductsView websiteId={websiteId} data={data} searchParams={query} />;
}
```
`SearchParams` and `parseTableQuery` come from `@/lib/table-query`. Pass `searchParams` down to
`DataTable` so its page and sort links keep the other params (filters, search).
