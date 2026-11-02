import type { ComponentType } from "react";
import type {
  AboutProps,
  AllProductsProps,
  FooterProps,
  HeroProps,
  ProductCardsProps,
  TextProps,
  VisitUsProps,
} from "../../../types";

/** What a template block receives: its own Puck props + `isEditing` (true inside the editor canvas). */
export type BlockRenderProps<P> = P & { id: string; isEditing: boolean };

/**
 * One template's design for every block. Business info and the site currency come from `useSite()`.
 * Each template lives in `templates/<template-key>.tsx` and exports one of these.
 */
export type TemplateDesign = {
  /** Site header (brand, nav, status badge, Contact). Not a block: the site root always renders it. */
  Header: ComponentType;
  Hero: ComponentType<BlockRenderProps<HeroProps>>;
  ProductCards: ComponentType<BlockRenderProps<ProductCardsProps>>;
  AllProducts: ComponentType<BlockRenderProps<AllProductsProps>>;
  About: ComponentType<BlockRenderProps<AboutProps>>;
  VisitUs: ComponentType<BlockRenderProps<VisitUsProps>>;
  Footer: ComponentType<BlockRenderProps<FooterProps>>;
  Text: ComponentType<BlockRenderProps<TextProps>>;
};
