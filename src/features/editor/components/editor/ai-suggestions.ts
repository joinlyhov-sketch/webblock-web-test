import type { BlockName } from "../../types";

/** Wording change, look change, or something new: picks the suggestion's icon. */
export type AiSuggestionKind = "write" | "style" | "add";

export type AiSuggestion = { kind: AiSuggestionKind; prompt: string };

/** Ideas shown in the empty WebBlock AI chat when nothing is selected (site settings). */
export const SITE_SUGGESTIONS: AiSuggestion[] = [
  { kind: "write", prompt: "Make the hero heading warmer" },
  { kind: "style", prompt: "Try a softer colour palette" },
  { kind: "write", prompt: "Write a friendlier About story" },
];

/** Ideas for the selected section. Wording only for things the block can really change. */
export const BLOCK_SUGGESTIONS = {
  Hero: [
    { kind: "write", prompt: "Rewrite the heading to sound warmer" },
    { kind: "write", prompt: "Make the description shorter" },
    { kind: "add", prompt: "Add a second button: Get directions" },
  ],
  Text: [
    { kind: "write", prompt: "Give this section a catchier heading" },
    { kind: "write", prompt: "Shorten the text to two sentences" },
    { kind: "style", prompt: "Center this section" },
  ],
  ProductCards: [
    { kind: "write", prompt: "Write a catchier heading" },
    { kind: "write", prompt: "Shorten the product descriptions" },
    { kind: "style", prompt: "Show 3 products per row" },
  ],
  AllProducts: [
    { kind: "write", prompt: "Shorten the product descriptions" },
    { kind: "write", prompt: "Put the categories in A–Z order" },
    { kind: "style", prompt: "Show 4 products per row" },
  ],
  About: [
    { kind: "write", prompt: "Make our story sound friendlier" },
    { kind: "write", prompt: "Shorten it to one paragraph" },
    { kind: "add", prompt: "Add a stat about our years in business" },
  ],
  VisitUs: [
    { kind: "write", prompt: "Make the heading more welcoming" },
    { kind: "style", prompt: "Center this section" },
    { kind: "style", prompt: "Give it more space around it" },
  ],
  Footer: [
    { kind: "write", prompt: "Write a short, friendly tagline" },
    { kind: "style", prompt: "Center the footer" },
    { kind: "style", prompt: "Make the footer tighter" },
  ],
} satisfies Record<BlockName, AiSuggestion[]>;
