import type { ComponentType } from "react";
import { Element3, Grid1, Location, Message, Note, RowVertical, Text } from "iconsax-reactjs";
import type { BlockName } from "../../types";

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

/** Left panel labels, icons and the one-line description under "Add a block" (from Figma). */
export const BLOCK_META = {
  Hero: { label: "Hero", hint: "Big heading, image, button", icon: RowVertical },
  Text: { label: "Text", hint: "Heading and paragraph", icon: Text },
  ProductCards: { label: "Product Cards", hint: "A short row of featured picks", icon: Grid1 },
  AllProducts: { label: "All products", hint: "Full catalogue: categories, search, pages", icon: Element3 },
  About: { label: "About", hint: "Your story", icon: Note },
  VisitUs: { label: "Visit us", hint: "Map, hours & contact", icon: Location },
  Footer: { label: "Footer", hint: "Contact and links", icon: Message },
} satisfies Record<BlockName, { label: string; hint: string; icon: IconComponent }>;

/** Order of the "Add a block" list. */
export const BLOCK_ORDER: BlockName[] = ["Hero", "Text", "ProductCards", "AllProducts", "About", "VisitUs", "Footer"];
