import type { FormEvent } from "react";
import Form from "next/form";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationButton,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Page } from "@/lib/api/types";
import { pageRange, tableHref, type SearchParams } from "@/lib/table-query";
import { cn } from "@/lib/utils";

/**
 * Table footer: "Showing 1–10 of 48 orders" + page links + "Go to" box.
 * Pages are links that keep every other search param (filters, sort, search).
 * With a single page the controls stay visible but disabled, like the design.
 */
export function TablePagination({
  data,
  searchParams = {},
  onPageChange,
  itemLabel,
  itemLabelOne,
}: {
  data: Page<unknown>;
  /** URL mode: pages are links that keep these params. */
  searchParams?: SearchParams;
  /** Browser mode: pages are buttons and nothing navigates. Receives the zero-based page. */
  onPageChange?: (page: number) => void;
  itemLabel: string;
  itemLabelOne?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(data.totalItems / data.size));
  const single = totalPages <= 1;
  const from = data.items.length ? data.page * data.size + 1 : 0;
  const to = data.page * data.size + data.items.length;
  const range = from === to ? String(to) : `${from}–${to}`;
  const hrefFor = (page: number) => tableHref(searchParams, { page: page === 0 ? null : page + 1 });
  const keep = Object.entries(searchParams).filter(([key]) => key !== "page");

  const goTo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = Number(new FormData(event.currentTarget).get("page"));
    if (Number.isInteger(target) && target >= 1 && target <= totalPages) onPageChange?.(target - 1);
  };
  const goToFields = (
    <>
      {keep.flatMap(([key, value]) =>
        (Array.isArray(value) ? value : [value]).map((v, i) =>
          v === undefined ? null : <input key={`${key}-${i}`} type="hidden" name={key} value={v} />,
        ),
      )}
      <label htmlFor="table-go-to-page" className="text-sm text-placeholder">
        Go to
      </label>
      <input
        key={data.page}
        id="table-go-to-page"
        name="page"
        type="number"
        inputMode="numeric"
        min={1}
        max={totalPages}
        required
        disabled={single}
        defaultValue={data.page + 1}
        className="h-9 w-[52px] [appearance:textfield] rounded-full border border-input bg-background text-center text-[15px] font-medium text-foreground transition-[border-color,box-shadow] outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/25 [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button type="submit" variant="soft" size="sm" className="text-sm" disabled={single}>
        Go
      </Button>
    </>
  );
  const goToClass = cn("flex items-center gap-2 pl-3", single && "opacity-50");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <p className="text-sm text-placeholder" aria-live="polite">
        Showing <span className="font-semibold text-foreground">{range}</span>
        {data.totalItems > 0 && ` of ${data.totalItems}`}{" "}
        {data.totalItems === 1 ? (itemLabelOne ?? itemLabel) : itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-5">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={!onPageChange && data.page > 0 ? hrefFor(data.page - 1) : undefined}
                onClick={onPageChange && data.page > 0 ? () => onPageChange(data.page - 1) : undefined}
              />
            </PaginationItem>
            {pageRange(data.page, totalPages).map((page, i) => (
              <PaginationItem key={page === "ellipsis" ? `gap-${i}` : page}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  onPageChange ? (
                    <PaginationButton onClick={() => onPageChange(page)} isActive={page === data.page}>
                      {page + 1}
                    </PaginationButton>
                  ) : (
                    <PaginationLink href={hrefFor(page)} isActive={page === data.page}>
                      {page + 1}
                    </PaginationLink>
                  )
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href={!onPageChange && data.page < totalPages - 1 ? hrefFor(data.page + 1) : undefined}
                onClick={onPageChange && data.page < totalPages - 1 ? () => onPageChange(data.page + 1) : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {onPageChange ? (
          <form onSubmit={goTo} className={goToClass}>
            {goToFields}
          </form>
        ) : (
          <Form action="" className={goToClass}>
            {goToFields}
          </Form>
        )}
      </div>
    </div>
  );
}
