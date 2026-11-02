// Fonts used by the website templates (DM Sans and Familjen Grotesk are already loaded by the root layout).
// next/font only downloads them on pages that render a website.
import { Anton, Bricolage_Grotesque, Caveat, DM_Mono, Fredoka, Playfair_Display, Space_Grotesk, Space_Mono, Syne } from "next/font/google";
import { cn } from "@/lib/utils";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["500", "600", "700"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["700"] });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});
const dmMono = DM_Mono({ variable: "--font-dm-mono", subsets: ["latin"], weight: ["400", "500"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], weight: ["500", "700"] });
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: ["400"] });
const syne = Syne({ variable: "--font-syne", subsets: ["latin"], weight: ["600", "700", "800"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const spaceMono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: ["400"] });

/** Put on the site root so the `--site-font-*` theme variables can reference every template font. */
export const siteFontVariables = cn(
  fredoka.variable,
  caveat.variable,
  playfair.variable,
  dmMono.variable,
  spaceGrotesk.variable,
  spaceMono.variable,
  anton.variable,
  syne.variable,
  bricolage.variable,
);
