// Makes the editor enforce the same rules as the save/deploy validation (schemas.ts), so a limit
// can never be passed silently and then block Deploy. The schema stays the single source of truth:
// this walks it and attaches each field's limit and rule to the matching Puck field.
import type { Config, Field, Fields } from "@puckeditor/core";
import { z } from "zod";
import { blocksSchema, siteRootSchema } from "../../schemas";
import type { BlockProps, SiteRootProps } from "../../types";
import type { FieldMeta } from "../puck-config";
import { ValidatedInput } from "./validated-input";

type Shape = Record<string, z.ZodType>;

/** nullable / optional wrappers hide the real schema. */
function unwrap(schema: z.ZodType): z.ZodType {
  let current = schema;
  while (current instanceof z.ZodNullable || current instanceof z.ZodOptional) {
    current = current.unwrap() as z.ZodType;
  }
  return current;
}

function maxLengthOf(schema: z.ZodType): number | undefined {
  const inner = unwrap(schema);
  return inner instanceof z.ZodString
    ? (inner.maxLength ?? undefined)
    : undefined;
}

/** `.max(n)` on an array schema (zod keeps it as a "max_length" check). */
function maxItemsOf(schema: z.ZodType): number | undefined {
  type Check = { _zod: { def: { check: string; maximum?: number } } };
  const checks =
    (unwrap(schema) as unknown as { _zod: { def: { checks?: Check[] } } })._zod
      .def.checks ?? [];
  return checks.find((check) => check._zod.def.check === "max_length")?._zod.def
    .maximum;
}

/** The message shown under a field, or `null` when the value is fine. */
export function ruleMessage(
  rule: z.ZodType | undefined,
  value: unknown,
): string | null {
  if (!rule) return null;
  const result = rule.safeParse(value);
  if (result.success) return null;
  const issue = result.error.issues[0];
  if (issue.code === "too_small") return "This can’t be empty.";
  if (issue.code === "too_big")
    return `Keep it to ${issue.maximum} characters or fewer.`;
  return issue.message;
}

function decorate(fields: Fields, shape: Shape, inList = false): Fields {
  const next: Record<string, Field> = { ...(fields as Record<string, Field>) };
  for (const [key, field] of Object.entries(next)) {
    const schema = shape[key];
    if (!schema) continue;
    const meta = (field.metadata ?? {}) as FieldMeta;

    if (field.type === "text" || field.type === "textarea") {
      const withRule: FieldMeta = {
        ...meta,
        rule: schema,
        maxLength: meta.maxLength ?? maxLengthOf(schema),
      };
      // Puck draws list items itself and has no character limit, so list rows use our own input.
      next[key] = inList
        ? ({
            type: "custom",
            label: field.label,
            render: ValidatedInput,
            metadata: {
              ...withRule,
              placeholder:
                field.type === "text" ? field.placeholder : undefined,
            },
          } as Field)
        : ({ ...field, metadata: withRule } as Field);
    } else if (field.type === "array") {
      const list = unwrap(schema);
      if (!(list instanceof z.ZodArray)) continue;
      const item = unwrap(list.element as z.ZodType);
      next[key] = {
        ...field,
        max: maxItemsOf(schema) ?? field.max,
        arrayFields:
          item instanceof z.ZodObject
            ? decorate(field.arrayFields as Fields, item.shape as Shape, true)
            : field.arrayFields,
      } as Field;
    }
  }
  return next as Fields;
}

/** Same config, with every text field limited and checked by the save/deploy schema. Editor only. */
export function applyFieldRules(
  config: Config<BlockProps, SiteRootProps>,
): Config<BlockProps, SiteRootProps> {
  const blockShapes = new Map<string, Shape>(
    blocksSchema.options.map((option) => [
      option.shape.type.value,
      option.shape.props.shape as Shape,
    ]),
  );
  const components = Object.fromEntries(
    Object.entries(config.components).map(([name, component]) => {
      const shape = blockShapes.get(name);
      const decorated =
        shape && component.fields
          ? {
              ...component,
              fields: decorate(component.fields as Fields, shape),
            }
          : component;
      return [name, decorated];
    }),
  ) as typeof config.components;

  return {
    ...config,
    root: config.root?.fields
      ? {
          ...config.root,
          fields: decorate(
            config.root.fields as Fields,
            siteRootSchema.shape as Shape,
          ),
        }
      : config.root,
    components,
  } as Config<BlockProps, SiteRootProps>;
}
