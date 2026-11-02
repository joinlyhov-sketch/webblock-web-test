import { cleanMonoContent } from "@/mocks/template-sites/clean-mono";
import { everydayStoreContent } from "@/mocks/template-sites/everyday-store";
import { sweetPastelContent } from "@/mocks/template-sites/sweet-pastel";
import { warmBoldContent } from "@/mocks/template-sites/warm-bold";
import { icedCoffeePage } from "@/mocks/template-pages/iced-coffee";
import { jacketsPage } from "@/mocks/template-pages/jackets";
import { keyboardsPage } from "@/mocks/template-pages/keyboards";
import type { TemplateSite } from "@/features/template-sites/types";

/** Sample website content per template id (ids match src/mocks/templates.ts). */
export const templateSites: Record<string, TemplateSite> = {
  "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c01": { slug: "everyday-store", content: everydayStoreContent },
  "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c02": { slug: "sweet-pastel", content: sweetPastelContent },
  "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c03": { slug: "warm-bold", content: warmBoldContent },
  "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c04": { slug: "clean-mono", content: cleanMonoContent },
  "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c05": { slug: "jackets", content: jacketsPage },
  "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c06": { slug: "keyboards", content: keyboardsPage },
  "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c07": { slug: "iced-coffee", content: icedCoffeePage },
};
