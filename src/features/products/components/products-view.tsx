"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Box, Element4, RowVertical, SearchStatus } from "iconsax-reactjs";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { RowsSelect } from "@/components/common/rows-select";
import { SearchInput } from "@/components/common/search-input";
import { SegmentedTabs } from "@/components/common/segmented-tabs";
import { TablePagination } from "@/components/common/table-pagination";
import { formatPrice } from "@/lib/format";
import { toPage } from "@/lib/table-query";
import { cn } from "@/lib/utils";
import { DEFAULT_PRODUCT_PAGE_SIZE, PRODUCT_PAGE_SIZES } from "../page-sizes";
import type { ProductsData, ProductsFilter, ProductsLayout } from "../service";
import type { Product } from "../types";
import { ProductDialogsProvider } from "./product-dialogs";
import { CategoryChip } from "./product-parts";
import {
  AddProductButton,
  NewCategoryButton,
  ProductCard,
  ProductCellButton,
  ProductRowActions,
} from "./product-triggers";

type Sort = ProductsFilter["sort"];

/** Same ordering rules as the API: price, name, or newest first. */
function sortProducts(items: Product[], sort: Sort): Product[] {
  const { field, direction } = sort ?? { field: "createdAt", direction: "desc" as const };
  const sign = direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    if (field === "price") return sign * (Number(a.price) - Number(b.price));
    if (field === "name") return sign * a.name.localeCompare(b.name);
    return sign * a.createdAt.localeCompare(b.createdAt);
  });
}

/**
 * Owner Portal → Products, rendered in the browser. The product list, search, category tabs, sort,
 * page, rows per page and grid/list switch all live in state, so none of them reloads the page, and
 * add / edit / delete update the list from the saved product. The URL is kept in sync with
 * `history.replaceState` (no navigation) so a refresh or a shared link opens on the same view.
 */
export function ProductsView({ data, initialFilter }: { data: ProductsData; initialFilter: ProductsFilter }) {
  const [products, setProducts] = useState(data.products);
  const [categories, setCategories] = useState(data.categories);
  const [q, setQ] = useState(initialFilter.q);
  const [category, setCategory] = useState(
    initialFilter.category && categories.includes(initialFilter.category) ? initialFilter.category : null,
  );
  const [layout, setLayout] = useState<ProductsLayout>(initialFilter.layout);
  const [size, setSize] = useState(initialFilter.size);
  const [pageIndex, setPageIndex] = useState(initialFilter.page);
  const [sort, setSort] = useState<Sort>(initialFilter.sort);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (layout === "list") params.set("view", "list");
    if (size !== DEFAULT_PRODUCT_PAGE_SIZE) params.set("size", String(size));
    if (pageIndex > 0) params.set("page", String(pageIndex + 1));
    if (sort) params.set("sort", `${sort.field},${sort.direction}`);
    const search = params.toString();
    window.history.replaceState(window.history.state, "", search ? `?${search}` : window.location.pathname);
  }, [q, category, layout, size, pageIndex, sort]);

  const needle = q.trim().toLowerCase();
  const matches = useMemo(
    () =>
      sortProducts(
        products
          .filter((p) => !category || p.category === category)
          .filter((p) => !needle || p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle)),
        sort,
      ),
    [products, category, needle, sort],
  );
  // A search or delete can leave the current page past the end: show the last page that exists.
  const lastPage = Math.max(0, Math.ceil(matches.length / size) - 1);
  const page = toPage(matches, { page: Math.min(pageIndex, lastPage), size });

  const counts = {
    total: products.length,
    categories: categories.map((name) => ({
      category: name,
      count: products.filter((p) => p.category === name).length,
    })),
  };
  const noProducts = counts.total === 0;
  const filtered = Boolean(needle || category);

  function showAll() {
    setQ("");
    setCategory(null);
    setPageIndex(0);
  }

  function saveProduct(product: Product) {
    setProducts((current) =>
      current.some((p) => p.id === product.id)
        ? current.map((p) => (p.id === product.id ? product : p))
        : [product, ...current],
    );
  }
  function removeProduct(productId: string) {
    setProducts((current) => current.filter((p) => p.id !== productId));
  }
  function addCategory(name: string) {
    setCategories((current) => (current.includes(name) ? current : [...current, name]));
  }

  const heading = (
    <h2 className="flex items-center gap-3 text-lg font-semibold">
      <Box aria-hidden className="size-[22px] text-brand" /> All products
    </h2>
  );

  const toolbar = (
    <>
      <SearchInput
        value={q}
        onValueChange={(next) => {
          setQ(next);
          setPageIndex(0);
        }}
        placeholder="Search products"
        label="Search products"
        className="h-9"
      />
      <SegmentedTabs
        label="Filter by category"
        className="p-[3px]"
        tabs={[
          {
            label: `All ${counts.total}`,
            onSelect: () => {
              setCategory(null);
              setPageIndex(0);
            },
            active: category === null,
          },
          ...counts.categories.map(({ category: name }) => ({
            label: name,
            onSelect: () => {
              setCategory(name);
              setPageIndex(0);
            },
            active: category === name,
          })),
        ]}
      />
      <NewCategoryButton />
      <div className="ml-auto flex items-center gap-2.5">
        <LayoutToggle layout={layout} onChange={setLayout} />
        <RowsSelect
          value={size}
          options={PRODUCT_PAGE_SIZES}
          editable
          defaultSize={DEFAULT_PRODUCT_PAGE_SIZE}
          onChange={(next) => {
            setSize(next);
            setPageIndex(0);
          }}
        />
      </div>
    </>
  );

  const empty = noProducts ? (
    <EmptyState
      icon={<Box />}
      title="No products yet"
      action={<AddProductButton label="Add your first product" />}
    />
  ) : (
    <EmptyState
      icon={<SearchStatus />}
      title="No results found"
      description={
        filtered
          ? "Try a different keyword, or show all products."
          : "There are no products on this page."
      }
      action={
        <button type="button" onClick={showAll} className="text-sm font-semibold text-primary hover:underline">
          Show all products
        </button>
      }
    />
  );

  return (
    <ProductDialogsProvider
      websiteId={data.websiteId}
      domain={data.domain}
      categories={categories}
      onSaved={saveProduct}
      onDeleted={removeProduct}
      onCategoryAdded={addCategory}
    >
      <PageHeader
        className="mb-0 items-center"
        title="Products"
        description={
          data.domain ? `Shown as Product Cards on ${data.domain}.` : "Shown as Product Cards on your website."
        }
        actions={<AddProductButton />}
      />

      {layout === "list" ? (
        <DataTable
          className="flex-1"
          label="Products"
          itemLabel="products"
          itemLabelOne="product"
          data={page}
          controls={{
            sort,
            onSort: (field, direction) => {
              setSort({ field, direction });
              setPageIndex(0);
            },
            onPageChange: setPageIndex,
          }}
          rowKey={(product) => product.id}
          heading={heading}
          toolbar={toolbar}
          empty={empty}
          columns={[
            {
              key: "product",
              header: "Product",
              className: "max-w-0 py-4",
              cell: (product) => <ProductCellButton product={product} />,
            },
            {
              key: "category",
              header: "Category",
              className: "w-[180px] py-4",
              cell: (product) => <CategoryChip category={product.category} />,
            },
            {
              key: "price",
              header: "Price",
              sortField: "price",
              className: "w-[140px] py-4",
              cell: (product) => (
                <span className="text-[15px] font-semibold text-foreground">{formatPrice(product.price, "USD")}</span>
              ),
            },
            {
              key: "actions",
              header: <span className="sr-only">Actions</span>,
              className: "w-[112px] py-4 pr-5",
              cell: (product) => <ProductRowActions product={product} />,
            },
          ]}
        />
      ) : (
        <ProductGridFrame heading={heading} toolbar={toolbar}>
          {page.items.length === 0 ? (
            <div className="flex min-h-[300px] flex-1 items-center justify-center">{empty}</div>
          ) : (
            <ul className="grid flex-1 content-start gap-6 p-6 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
              {page.items.map((product, i) => (
                <li key={product.id} className="motion-safe:animate-row-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}
          {/* No products at all: no "Showing 0" footer, so the empty state sits in the middle of the card. */}
          {!noProducts && (
            <div className="border-t border-border">
              <TablePagination data={page} onPageChange={setPageIndex} itemLabel="products" itemLabelOne="product" />
            </div>
          )}
        </ProductGridFrame>
      )}
    </ProductDialogsProvider>
  );
}

/** Same card frame as `DataTable`, holding the product grid instead of rows. */
function ProductGridFrame({
  heading,
  toolbar,
  children,
}: {
  heading: ReactNode;
  toolbar: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-label="Products"
      className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-border bg-background shadow-table"
    >
      <div className="px-4 pt-5 pb-1">{heading}</div>
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3.5">{toolbar}</div>
      {children}
    </section>
  );
}

/** Grid / list switch. */
function LayoutToggle({ layout, onChange }: { layout: ProductsLayout; onChange: (layout: ProductsLayout) => void }) {
  const options = [
    { value: "grid", label: "Grid view", icon: <Element4 /> },
    { value: "list", label: "List view", icon: <RowVertical /> },
  ] as const;

  return (
    <div role="group" aria-label="Layout" className="flex gap-0.5 rounded-full border border-border bg-page p-1">
      {options.map((option) => {
        const active = option.value === layout;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-label={option.label}
            aria-pressed={active}
            className={cn(
              "flex size-9 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 [&_svg]:size-[18px]",
              active ? "bg-background text-brand-strong shadow-tab" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}
