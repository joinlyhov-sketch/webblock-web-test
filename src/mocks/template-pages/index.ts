import type { PageData, TemplateKey } from "@/features/editor/types";
import { cleanMonoPage } from "./clean-mono";
import { everydayStorePage } from "./everyday-store";
import { icedCoffeePage } from "./iced-coffee";
import { jacketsPage } from "./jackets";
import { keyboardsPage } from "./keyboards";
import { sweetPastelPage } from "./sweet-pastel";
import { warmBoldPage } from "./warm-bold";

/** The default content each template starts with (what the backend copies into a new website). */
export const templatePages: Record<TemplateKey, PageData> = {
  "everyday-store": everydayStorePage,
  "sweet-pastel": sweetPastelPage,
  "warm-bold": warmBoldPage,
  "clean-mono": cleanMonoPage,
  jackets: jacketsPage,
  keyboards: keyboardsPage,
  "iced-coffee": icedCoffeePage,
};
