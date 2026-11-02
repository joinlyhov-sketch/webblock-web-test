"use client";

import { Add, Edit2, Trash } from "iconsax-reactjs";
import { ActionMenu } from "@/components/common/action-menu";
import { ProductImage } from "@/components/common/product-image";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { Product } from "../types";
import { useProductDialogs } from "./product-dialogs";

// Small client leaves that open the product popups. The lists around them stay Server Components.

export function AddProductButton({ label = "Add product" }: { label?: string }) {
  const { openAdd } = useProductDialogs();
  return (
    <Button onClick={openAdd} className="shadow-upload">
      <Add variant="Outline" aria-hidden /> {label}
    </Button>
  );
}

/** Toolbar link after the category tabs: opens the "New category" popup. */
export function NewCategoryButton() {
  const { openNewCategory } = useProductDialogs();
  return (
    <Button variant="ghost" size="sm" onClick={openNewCategory} className="rounded-full text-primary hover:text-primary">
      <Add variant="Outline" aria-hidden /> New category
    </Button>
  );
}

/** Grid card (Figma "Product card"): click opens the details, "…" opens Edit / Delete. */
export function ProductCard({ product }: { product: Product }) {
  const { openDetails, openEdit, openDelete } = useProductDialogs();

  return (
    <article className="relative flex flex-col rounded-2xl border border-border bg-background p-1.5 sm:p-2 transition-[border-color,box-shadow] focus-within:border-primary/40 hover:border-primary/40 hover:shadow-card">
      <ProductImage src={product.imageUrl} alt="" sizes="(min-width: 1280px) 25vw, 50vw" className="w-full" />
      <div className="flex flex-col gap-1.5 pt-2 pr-0.5 pb-1 pl-1.5 sm:gap-3 sm:pt-3 sm:pr-1 sm:pb-1.5 sm:pl-2">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-sans text-sm leading-5 font-semibold text-foreground sm:text-[15px] sm:leading-[22px]">
              <button
                type="button"
                onClick={() => openDetails(product)}
                className="text-left outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-ring/40"
              >
                {product.name}
              </button>
            </h3>
            <p className="truncate text-[13px] leading-[19.5px] text-muted-foreground">
              {product.category}
              <span className="max-sm:hidden"> · {product.description}</span>
            </p>
          </div>
          <div className="relative z-10">
            <ActionMenu
              label={`More actions for ${product.name}`}
              items={[
                { label: "Edit product", icon: <Edit2 variant="Outline" aria-hidden />, onSelect: () => openEdit(product) },
                { label: "Delete product", icon: <Trash variant="Outline" aria-hidden />, danger: true, onSelect: () => openDelete(product) },
              ]}
            />
          </div>
        </div>
        <p className="font-heading text-base leading-6 font-semibold text-foreground sm:text-xl sm:leading-[26px]">
          {formatPrice(product.price, "USD")}
        </p>
      </div>
    </article>
  );
}

/** Thumbnail + name + description cell of the list view. Opens the details. */
export function ProductCellButton({ product }: { product: Product }) {
  const { openDetails } = useProductDialogs();
  return (
    <button
      type="button"
      onClick={() => openDetails(product)}
      className="group flex w-full min-w-0 items-center gap-4 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <ProductImage src={product.imageUrl} alt="" sizes="64px" className="w-16 rounded-lg" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] leading-[22px] font-semibold text-foreground group-hover:text-primary">
          {product.name}
        </span>
        <span className="block truncate text-sm leading-[21px] text-muted-foreground">{product.description}</span>
      </span>
    </button>
  );
}

/** Edit and delete icon buttons at the end of a list row. */
export function ProductRowActions({ product }: { product: Product }) {
  const { openEdit, openDelete } = useProductDialogs();
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" aria-label={`Edit ${product.name}`} onClick={() => openEdit(product)}>
        <Edit2 variant="Outline" aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete ${product.name}`}
        onClick={() => openDelete(product)}
        className="hover:bg-danger-soft hover:text-danger active:bg-danger-soft"
      >
        <Trash variant="Outline" aria-hidden />
      </Button>
    </div>
  );
}
