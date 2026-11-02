// Turns the first validation problem of a page document into a sentence the owner can act on:
// which block, which field, and what to change. Pure: no client or server imports.
import type { z } from "zod";

/** "ProductCards" or "heading" becomes "Product Cards" / "Heading". */
function words(name: string): string {
  const spaced = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function valueAt(data: unknown, path: PropertyKey[]): unknown {
  return path.reduce<unknown>(
    (value, key) => (value as Record<PropertyKey, unknown> | undefined)?.[key],
    data,
  );
}

/** e.g. "About block (section 4) › Heading is too long: 135 of 80 characters. Shorten it and try again." */
export function describeIssue(
  issue: z.core.$ZodIssue | undefined,
  data: unknown,
): string {
  if (!issue) return "Some content is not valid.";
  const { path } = issue;

  let where = "Page settings";
  let rest = path;
  if (path[0] === "content" && typeof path[1] === "number") {
    const block = valueAt(data, ["content", path[1]]) as
      { type?: string } | undefined;
    where = `${block?.type ? words(block.type) : "A"} block (section ${path[1] + 1})`;
    rest = path.slice(2);
  }
  // Skip the "props" wrapper, then name the field; list items read "Stats item 2".
  const keys = rest.filter((key) => key !== "props");
  const field = keys.length
    ? keys
        .map((key) =>
          typeof key === "number" ? `item ${key + 1}` : words(String(key)),
        )
        .join(" ")
    : "Content";

  if (issue.code === "too_big" && issue.origin === "string") {
    const actual = String(valueAt(data, path) ?? "").length;
    return `${where} › ${field} is too long: ${actual} of ${issue.maximum} characters allowed. Shorten it and try again.`;
  }
  if (issue.code === "too_small" && issue.origin === "string") {
    return `${where} › ${field} can't be empty. Fill it in and try again.`;
  }
  return `${where} › ${field}: ${issue.message}`;
}
