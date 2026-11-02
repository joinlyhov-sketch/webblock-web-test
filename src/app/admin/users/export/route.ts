import { exportUsersCsv, type PlanCode } from "@/features/admin";
import { requireAdmin } from "@/lib/auth/session";

const PLANS: PlanCode[] = ["FREE_TRIAL", "PLUS", "PRO", "ULTRA"];

/** CSV download for the "Export CSV" button on User Accounts. Keeps the current search and plan filter. */
export async function GET(request: Request) {
  await requireAdmin();
  const params = new URL(request.url).searchParams;
  const q = params.get("q") ?? undefined;
  const plan = PLANS.find((p) => p === params.get("plan"));
  const csv = await exportUsersCsv({ q, plan });
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName(plan, q)}"`,
    },
  });
}

/** "webblock-user-accounts-pro-search-sokha-2026-10-29.csv": what was exported and when (UTC date). */
function fileName(plan: PlanCode | undefined, q: string | undefined): string {
  const slug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30);
  const search = q && slug(q);
  const parts = [
    "webblock-user-accounts",
    plan ? slug(plan) : "all",
    search && `search-${search}`,
    new Date().toISOString().slice(0, 10),
  ];
  return `${parts.filter(Boolean).join("-")}.csv`;
}
