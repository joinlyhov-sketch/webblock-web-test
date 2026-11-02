"use client";

// The one Puck config, shared by the editor, the preview and the published site, so a saved page
// always renders the same everywhere. Blocks are template-agnostic: each one renders the design of
// the template stored in the root props (`templateId`).
import { useMemo, type ComponentType } from "react";
import type { Config, CustomField, Field, Fields } from "@puckeditor/core";
import type { ZodType } from "zod";
import type {
  BlockName,
  BlockProps,
  CtaAction,
  SiteRootProps,
  TemplateKey,
} from "../types";
import { HighlightsField } from "./editor/highlights-field";
import { ImageField } from "./editor/image-field";
import { ImagesField } from "./editor/images-field";
import { SAMPLE_CATALOGUE, SAMPLE_CATEGORIES, SAMPLE_FEATURED } from "./site/sample-products";
import { SiteRoot } from "./site/site-root";
import { useSite } from "./site/site-context";
import { templateDesigns } from "./site/templates";

/** Extra info the editor panel reads from each field's `metadata`. */
export type FieldMeta = {
  /** "Content" (default) or "Layout & Design" tab. */
  tab?: "content" | "layout";
  /** Small grey group title shown above the field ("Buttons", "Image"…). */
  group?: string;
  /** Only shown when the page uses one of these templates. */
  templates?: TemplateKey[];
  /** Character counter, e.g. "32 / 60". */
  maxLength?: number;
  /** Adds a grey "(optional)" after the label. */
  optional?: boolean;
  /** Filled in from the business details form: shown but not editable here. */
  locked?: boolean;
  /** The schema rule for this field (set by `applyFieldRules`): drives the inline error. */
  rule?: ZodType;
};

const meta = (m: FieldMeta) => ({ metadata: m });

const text = (label: string, m: FieldMeta = {}, placeholder?: string): Field =>
  ({ type: "text", label, placeholder, ...meta(m) }) as Field;
const textarea = (label: string, m: FieldMeta = {}): Field =>
  ({ type: "textarea", label, ...meta(m) }) as Field;

export const imageField = (
  label: string,
  m: FieldMeta = {},
): CustomField<string | null> => ({
  type: "custom",
  label,
  render: ImageField,
  ...meta({ group: "Image", ...m }),
});

const CTA_OPTIONS: { label: string; value: CtaAction }[] = [
  { label: "Go to products", value: "shop" },
  { label: "Go to Visit us", value: "visit" },
  { label: "Call us", value: "call" },
  { label: "Email us", value: "email" },
  { label: "Get directions", value: "directions" },
];
const cta = (label: string): Field => ({
  type: "select",
  label,
  options: CTA_OPTIONS,
  ...meta({ group: "Buttons" }),
});

const layoutFields = {
  align: {
    type: "radio",
    label: "Content alignment",
    options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ],
    ...meta({ tab: "layout", group: "Layout" }),
  },
  spacing: {
    type: "radio",
    label: "Spacing",
    options: [
      { label: "Tight", value: "tight" },
      { label: "Normal", value: "normal" },
      { label: "Roomy", value: "roomy" },
    ],
    ...meta({ tab: "layout", group: "Layout" }),
  },
} satisfies Record<string, Field>;

const columnsField: Field = {
  type: "radio",
  label: "Columns",
  options: [
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
  ],
  ...meta({ tab: "layout", group: "Layout" }),
};

/**
 * Products are managed in the Owner Portal after the website is generated, so the editor does not offer
 * them (`visible: false`): the blocks only show their sample products and categories.
 */
const productFields: Field = {
  visible: false,
  type: "array",
  label: "Products",
  arrayFields: {
    name: text("Name"),
    description: text("Short description", { maxLength: 200 }),
    price: text("Price", {}, "e.g. 6.00"),
    category: text("Category"),
    imageUrl: imageField("Photo"),
  },
  defaultItemProps: {
    name: "New product",
    description: "",
    price: "0.00",
    category: "",
    imageUrl: null,
  },
  getItemSummary: (item: { name?: string }) => item.name || "Product",
  ...meta({ group: "Products" }),
};

/** The most products an All products block shows in the editor canvas, even if its page size is larger. */
const EDITOR_ALL_PRODUCTS_LIMIT = 8;

/** Renders the current template's design for a block. */
function TemplateBlock({
  name,
  props,
  isEditing,
}: {
  name: BlockName;
  props: object;
  isEditing: boolean;
}) {
  const site = useSite();
  const Design = templateDesigns[site.templateId][name] as ComponentType<{
    isEditing: boolean;
  }>;
  // Product blocks in the editor canvas only show what the block itself shows at a glance: one row for
  // Product Cards (as many as its columns) and one page for All products (its "Products per page", at most EDITOR_ALL_PRODUCTS_LIMIT), however
  // many products the owner has in the portal. The preview and the live site get the full list, and the
  // saved page is untouched (the portal's products are filled in again when it is served and deployed).
  // Lists are memoised so the block gets the same array between renders.
  const products = productsOf(props);
  const limit = name === "AllProducts" ? Math.min(pageSizeOf(props), EDITOR_ALL_PRODUCTS_LIMIT) : columnsOf(props);
  const shown = useMemo(() => products.slice(0, limit), [products, limit]);
  const featured = useMemo(() => SAMPLE_FEATURED.slice(0, limit), [limit]);
  if (isEditing && isProductBlock(name)) {
    // A block without products (e.g. just dragged in) shows sample ones, so the owner sees the real layout.
    if (products.length === 0) {
      const sample =
        name === "ProductCards"
          ? { ...props, products: featured }
          : { ...props, products: SAMPLE_CATALOGUE, categories: SAMPLE_CATEGORIES };
      return <Design {...sample} isEditing={isEditing} />;
    }
    return <Design {...{ ...props, products: shown }} isEditing={isEditing} />;
  }
  return <Design {...props} isEditing={isEditing} />;
}

const isProductBlock = (name: BlockName): name is "ProductCards" | "AllProducts" =>
  name === "ProductCards" || name === "AllProducts";
const productsOf = (props: object): unknown[] => ("products" in props && Array.isArray(props.products) ? props.products : []);
const pageSizeOf = (props: object) => ("pageSize" in props ? Number(props.pageSize) || 8 : 8);
const columnsOf = (props: object) => ("columns" in props ? Number(props.columns) || 3 : 3);

function render(name: BlockName) {
  return function BlockRender({
    puck,
    ...props
  }: {
    puck: { isEditing: boolean };
  }) {
    return (
      <TemplateBlock name={name} props={props} isEditing={puck.isEditing} />
    );
  };
}

const ALL_LAYOUT = { align: "left", spacing: "normal" } as const;

export const puckConfig: Config<BlockProps, SiteRootProps> = {
  root: {
    fields: {
      businessName: text("Business name", { group: "Business", locked: true }),
      statusText: text(
        "Status badge",
        { group: "Business", optional: true },
        "e.g. Open now · until 6:00 PM",
      ),
      hours: text(
        "Opening hours (short)",
        { group: "Hours", locked: true },
        "e.g. 9:00 AM – 6:00 PM",
      ),
      hoursDetail: text("Opening hours (week)", { group: "Hours", locked: true }),
      address: text("Address", { group: "Contact", locked: true }),
      phones: {
        type: "array",
        label: "Phone numbers",
        arrayFields: { number: text("Number") },
        defaultItemProps: { number: "" },
        getItemSummary: (item: { number?: string }) => item.number || "Phone",
        ...meta({ group: "Contact", locked: true }),
      },
      email: text("Email", { group: "Contact", locked: true }),
      telegram: text(
        "Telegram username",
        { group: "Contact", optional: true },
        "without @",
      ),
      facebookUrl: text(
        "Facebook link",
        { group: "Social", optional: true },
        "https://",
      ),
      instagramUrl: text(
        "Instagram link",
        { group: "Social", optional: true },
        "https://",
      ),
      // `currency` has no field: prices use the site's currency from the page data, not an editor setting.
      // Rendered as swatches in "Layout & Design · Visual style"; options are listed in the panel.
      palette: { type: "text", ...meta({ tab: "layout" }), visible: false },
      accentColor: { type: "text", ...meta({ tab: "layout" }), visible: false },
      backgroundColor: {
        type: "text",
        ...meta({ tab: "layout" }),
        visible: false,
      },
      textColor: { type: "text", ...meta({ tab: "layout" }), visible: false },
      font: { type: "text", ...meta({ tab: "layout" }), visible: false },
      buttonStyle: { type: "text", ...meta({ tab: "layout" }), visible: false },
    } as Fields<SiteRootProps>,
    render: ({ children, ...site }) => (
      <SiteRoot site={site as SiteRootProps}>{children}</SiteRoot>
    ),
  },

  components: {
    Hero: {
      label: "Hero",
      fields: {
        eyebrow: text(
          "Small label",
          { optional: true },
          "Optional · leave empty to hide",
        ),
        heading: textarea("Heading", { maxLength: 30 }),
        description: textarea("Description", { maxLength: 200 }),
        primaryLabel: text("Main button text", { group: "Buttons" }),
        primaryAction: cta("Main button goes to"),
        secondaryLabel: text("Second button text", {
          group: "Buttons",
          optional: true,
        }),
        secondaryAction: cta("Second button goes to"),
        imageUrl: imageField("Image", {
          templates: [
            "everyday-store",
            "sweet-pastel",
            "warm-bold",
            "clean-mono",
            "jackets",
            "keyboards",
          ],
        }),
        sideImages: {
          type: "custom",
          label: "Side photos",
          render: ({ value, onChange, readOnly, id }) => (
            <ImagesField id={id} value={value} onChange={onChange} readOnly={readOnly} max={2} />
          ),
          ...meta({ group: "Image", templates: ["sweet-pastel", "jackets", "iced-coffee", "plates"] }),
        } as CustomField<{ imageUrl: string | null; label?: string }[]>,
        highlights: {
          type: "custom",
          label: "Highlights",
          render: ({ value, onChange, readOnly, id }) => (
            <HighlightsField id={id} value={value} onChange={onChange} readOnly={readOnly} max={3} />
          ),
          ...meta({
            group: "Extras",
            templates: ["sweet-pastel", "warm-bold", "clean-mono", "jackets", "iced-coffee", "plates"],
          }),
        } as CustomField<{ text: string }[]>,
        badge: text("Badge", {
          group: "Extras",
          optional: true,
          templates: ["warm-bold", "clean-mono", "jackets", "iced-coffee", "plates"],
        }),
        ...layoutFields,
      },
      defaultProps: {
        eyebrow: "",
        heading: "A short, clear headline.",
        description:
          "One or two sentences about what you offer and why people love it.",
        primaryLabel: "See products",
        primaryAction: "shop",
        secondaryLabel: "Contact us",
        secondaryAction: "visit",
        imageUrl: null,
        sideImages: [],
        highlights: [],
        badge: "",
        ...ALL_LAYOUT,
      },
      render: render("Hero"),
    },

    Text: {
      label: "Text",
      fields: {
        eyebrow: text(
          "Small label",
          { optional: true },
          "Optional · leave empty to hide",
        ),
        heading: textarea("Heading", { maxLength: 30 }),
        body: textarea("Paragraph", { maxLength: 200 }),
        // Optional on older pages, so Puck sees `string | null | undefined`.
        imageUrl: imageField("Image", { templates: ["keyboards"] }) as unknown as Field<string | null | undefined>,
        ...layoutFields,
      },
      defaultProps: {
        eyebrow: "",
        heading: "Tell your story",
        body: "Write a few sentences for your visitors. Keep it short and friendly.",
        align: "center",
        spacing: "normal",
      },
      render: render("Text"),
    },

    ProductCards: {
      label: "Product Cards",
      fields: {
        eyebrow: text(
          "Small label",
          { optional: true },
          "Optional · leave empty to hide",
        ),
        heading: textarea("Heading", { maxLength: 30 }),
        viewAllLabel: text("“View all” link text", { optional: true }),
        products: productFields,
        columns: columnsField,
        ...layoutFields,
      },
      defaultProps: {
        eyebrow: "",
        heading: "Popular this week",
        viewAllLabel: "View all products",
        products: [],
        columns: "3",
        ...ALL_LAYOUT,
      },
      render: render("ProductCards"),
    },

    AllProducts: {
      label: "All products",
      fields: {
        eyebrow: text(
          "Small label",
          { optional: true },
          "Optional · leave empty to hide",
        ),
        heading: textarea("Heading", { maxLength: 30 }),
        searchPlaceholder: text("Search placeholder"),
        categories: {
          visible: false,
          type: "array",
          label: "Categories",
          arrayFields: { name: text("Name") },
          defaultItemProps: { name: "New category" },
          getItemSummary: (item: { name?: string }) => item.name || "Category",
          ...meta({ group: "Products" }),
        },
        products: productFields,
        pageSize: {
          type: "number",
          label: "Products per page",
          min: 2,
          max: 24,
          ...meta({ tab: "layout", group: "Layout" }),
        },
        columns: columnsField,
        ...layoutFields,
      },
      defaultProps: {
        eyebrow: "",
        heading: "All products",
        searchPlaceholder: "Search products…",
        categories: [],
        products: [],
        pageSize: 6,
        columns: "3",
        ...ALL_LAYOUT,
      },
      render: render("AllProducts"),
    },

    About: {
      label: "About",
      fields: {
        eyebrow: text(
          "Small label",
          { optional: true },
          "Optional · leave empty to hide",
        ),
        heading: textarea("Heading", { maxLength: 30 }),
        body: textarea("Your story", { maxLength: 200 }),
        caption: text("Caption", {
          optional: true,
          templates: ["warm-bold", "clean-mono", "jackets", "keyboards", "iced-coffee", "plates"],
        }),
        stats: {
          type: "array",
          label: "Numbers",
          arrayFields: { value: text("Number"), label: text("Label") },
          defaultItemProps: { value: "10+", label: "years open" },
          getItemSummary: (item: { value?: string; label?: string }) =>
            `${item.value ?? ""} ${item.label ?? ""}`.trim() || "Number",
          max: 3,
          ...meta({
            group: "Extras",
            templates: ["sweet-pastel", "clean-mono"],
          }),
        },
        imageUrl: imageField("Image"),
        secondImageUrl: imageField("Second image", { templates: ["keyboards"] }) as unknown as Field<string | null | undefined>,
        ...layoutFields,
      },
      defaultProps: {
        eyebrow: "",
        heading: "About us",
        body: "Who you are, how you started and what makes you different.",
        caption: "",
        stats: [],
        imageUrl: null,
        ...ALL_LAYOUT,
      },
      render: render("About"),
    },

    VisitUs: {
      label: "Visit us",
      fields: {
        eyebrow: text(
          "Small label",
          { optional: true },
          "Optional · leave empty to hide",
        ),
        heading: textarea("Heading", { maxLength: 30 }),
        ...layoutFields,
      },
      defaultProps: { eyebrow: "", heading: "Come and see us", ...ALL_LAYOUT },
      render: render("VisitUs"),
    },

    Footer: {
      label: "Footer",
      fields: {
        tagline: text("Short line under the name", { optional: true }),
        ...layoutFields,
      },
      defaultProps: { tagline: "", align: "center", spacing: "normal" },
      render: render("Footer"),
    },
  },
};
