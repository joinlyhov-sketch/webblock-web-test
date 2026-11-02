/** RFC 7807 problem details, as returned by the Spring API. */
export type Problem = {
  title: string;
  status: number;
  detail?: string;
};

export class ApiError extends Error {
  readonly title: string;
  readonly status: number;
  readonly detail?: string;

  constructor(problem: Problem) {
    super(problem.detail ?? problem.title);
    this.name = "ApiError";
    this.title = problem.title;
    this.status = problem.status;
    this.detail = problem.detail;
  }
}

/**
 * For `.catch()`: a 404 becomes `null`, anything else is rethrown. Used for URL-driven popups
 * (`?user=<id>`): a stale or mistyped id just shows the list without the popup instead of an error page.
 */
export function nullIfNotFound(e: unknown): null {
  if (e instanceof ApiError && e.status === 404) return null;
  throw e;
}
