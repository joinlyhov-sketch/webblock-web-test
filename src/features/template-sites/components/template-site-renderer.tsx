import type { TemplateSite } from "../types";
import { CleanMonoSite } from "./clean-mono-site";
import { EverydayStoreSite } from "./everyday-store-site";
import { IcedCoffeeSite } from "./iced-coffee-site";
import { JacketsSite } from "./jackets-site";
import { KeyboardsSite } from "./keyboards-site";
import { PlatesSite } from "./plates-site";
import { SweetPastelSite } from "./sweet-pastel-site";
import { WarmBoldSite } from "./warm-bold-site";

/** Renders one sample template website, picked by its slug. */
export function TemplateSiteRenderer({ site }: { site: TemplateSite }) {
  switch (site.slug) {
    case "everyday-store":
      return <EverydayStoreSite content={site.content} />;
    case "sweet-pastel":
      return <SweetPastelSite content={site.content} />;
    case "warm-bold":
      return <WarmBoldSite content={site.content} />;
    case "clean-mono":
      return <CleanMonoSite content={site.content} />;
    case "jackets":
      return <JacketsSite content={site.content} />;
    case "keyboards":
      return <KeyboardsSite content={site.content} />;
    case "iced-coffee":
      return <IcedCoffeeSite content={site.content} />;
    case "plates":
      return <PlatesSite content={site.content} />;
  }
}
