// Validates the page document before it is saved. This is where website links are enforced:
// buttons can only use the CtaAction list, social links must be https://, no free-form hrefs.
import { z } from "zod";

const text = (max: number) => z.string().max(max);
const imageUrl = z
  .string()
  .max(500)
  .refine(
    (v) => v.startsWith("/") || v.startsWith("https://"),
    "Images must be uploaded files or https:// links.",
  )
  .nullable();
const hexColor = z
  .string()
  .regex(/^#[0-9a-f]{6}$/i, "Colours use the #rrggbb format.")
  .nullable();
const httpsUrl = z.union(
  [
    z.literal(""),
    z
      .url({ protocol: /^https$/, error: "Links must start with https://" })
      .max(300),
  ],
  {
    error: "Links must start with https://",
  },
);

const ctaAction = z.enum(["shop", "visit", "call", "email", "directions"]);
const layout = {
  align: z.enum(["left", "center", "right"]),
  spacing: z.enum(["tight", "normal", "roomy"]),
};
const columns = z.enum(["2", "3", "4"]);
const id = z.string().min(1).max(100);

const product = z.object({
  name: text(80).min(1, "Every product needs a name."),
  description: text(160),
  price: z
    .string()
    .regex(/^\d{1,9}(\.\d{1,2})?$/, "Prices are numbers like 6.00."),
  category: text(40),
  imageUrl,
});

export const blocksSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("Hero"),
    props: z.object({
      id,
      ...layout,
      eyebrow: text(60),
      heading: text(60).min(1, "The hero needs a heading."),
      description: text(400),
      primaryLabel: text(40),
      primaryAction: ctaAction,
      secondaryLabel: text(40),
      secondaryAction: ctaAction,
      imageUrl,
      sideImages: z.array(z.object({ imageUrl, label: text(30).optional() })).max(4),
      highlights: z.array(z.object({ text: text(60) })).max(3),
      badge: text(40),
    }),
  }),
  z.object({
    type: z.literal("Text"),
    props: z.object({
      id,
      ...layout,
      eyebrow: text(60),
      heading: text(80),
      body: text(2000),
      imageUrl: imageUrl.optional(),
    }),
  }),
  z.object({
    type: z.literal("ProductCards"),
    props: z.object({
      id,
      ...layout,
      columns,
      eyebrow: text(60),
      heading: text(60),
      viewAllLabel: text(40),
      products: z.array(product).max(12),
    }),
  }),
  z.object({
    type: z.literal("AllProducts"),
    props: z.object({
      id,
      ...layout,
      columns,
      eyebrow: text(60),
      heading: text(60),
      searchPlaceholder: text(60),
      categories: z.array(z.object({ name: text(40).min(1) })).max(12),
      products: z.array(product).max(200),
      pageSize: z.number().int().min(2).max(24),
    }),
  }),
  z.object({
    type: z.literal("About"),
    props: z.object({
      id,
      ...layout,
      eyebrow: text(60),
      heading: text(80),
      body: text(2000),
      imageUrl,
      secondImageUrl: imageUrl.optional(),
      caption: text(120),
      stats: z.array(z.object({ value: text(12), label: text(40) })).max(3),
    }),
  }),
  z.object({
    type: z.literal("VisitUs"),
    props: z.object({ id, ...layout, eyebrow: text(60), heading: text(60) }),
  }),
  z.object({
    type: z.literal("Footer"),
    props: z.object({ id, ...layout, tagline: text(120) }),
  }),
]);

export const siteRootSchema = z.object({
  templateId: z.enum([
    "everyday-store",
    "sweet-pastel",
    "warm-bold",
    "clean-mono",
    "jackets",
    "keyboards",
    "iced-coffee",
  ]),
  businessName: text(60).min(1, "Add your business name."),
  statusText: text(60),
  hours: text(40),
  hoursDetail: text(160),
  address: text(160),
  phones: z
    .array(
      z.object({
        number: z
          .string()
          .regex(
            /^[+()\d\s-]{6,20}$/,
            "Phone numbers use digits only, e.g. 012 345 678.",
          ),
      }),
    )
    .max(3),
  email: z.union(
    [z.literal(""), z.email("Enter a valid email address.").max(120)],
    {
      error: "Enter a valid email address.",
    },
  ),
  telegram: z
    .string()
    .regex(
      /^@?[A-Za-z0-9_]{0,32}$/,
      "Telegram usernames use letters, numbers and _.",
    ),
  facebookUrl: httpsUrl,
  instagramUrl: httpsUrl,
  // Set from Business information (Owner Portal), never typed in the editor. Optional for older pages.
  logoUrl: z.string().nullable().optional(),
  currency: z.enum(["USD", "KHR"]),
  palette: z.enum(["original", "lavender", "bakery", "sage"]),
  accentColor: hexColor,
  backgroundColor: hexColor,
  textColor: hexColor,
  font: z.enum(["original", "editorial", "clean", "rounded"]),
  buttonStyle: z.enum(["square", "rounded", "pill"]),
});

/** The whole Puck document. Unknown block types or props are rejected. */
export const pageDataSchema = z.object({
  root: z.object({ props: siteRootSchema }),
  content: z.array(blocksSchema).max(40),
  zones: z.record(z.string(), z.array(blocksSchema)).optional(),
});

/** What the owner types into the WebBlock AI composer. */
export const aiPromptSchema = z
  .string()
  .trim()
  .min(1, "Type what you want to change.")
  .max(500, "Keep it under 500 characters.");
