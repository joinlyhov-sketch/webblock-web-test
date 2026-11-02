import {
  getPipelineRun,
  listLiveLogs,
  listPipelineRuns,
  PipelineView,
  type LogLevel,
  type PipelineStage,
} from "@/features/admin/monitoring";
import { nullIfNotFound } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/session";
import { parseTableQuery, type SearchParams } from "@/lib/table-query";

export const metadata = { title: "Pipeline & Generation" };

const STAGES: PipelineStage[] = ["REQUEST", "GENERATION", "RELEASE", "LIVE"];
const LEVELS: LogLevel[] = ["INFO", "WARN", "ERROR"];

export default async function AdminPipelinePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const query = await searchParams;
  const websiteId = typeof query.run === "string" && query.run ? query.run : null;

  // The run and its logs are fetched side by side (logs only matter once the site is live).
  const [runs, detail] = await Promise.all([
    listPipelineRuns({ stage: STAGES.find((s) => s === query.stage) }, parseTableQuery(query)),
    websiteId
      ? Promise.all([
          getPipelineRun(websiteId),
          listLiveLogs(websiteId, { level: LEVELS.find((l) => l === query.log) }, { page: 0, size: 6 }),
        ])
          .then(([run, logs]) => ({ run, logs: run.live ? logs : null }))
          .catch(nullIfNotFound)
      : null,
  ]);

  return <PipelineView runs={runs} searchParams={query} detail={detail} />;
}
