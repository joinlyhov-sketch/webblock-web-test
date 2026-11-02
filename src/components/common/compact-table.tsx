import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type CompactColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  align?: "start" | "end";
  /** Extra classes for this column's cells (width, tabular-nums, muted text). */
  className?: string;
};

/**
 * Small, unpaginated table inside a card (Figma "Recent deploys"): rounded grey header row,
 * rows with a hover tint. For full list screens with paging and sorting use `DataTable`.
 * `dense` is the tighter log-viewer size. Place it in a padded card so the header row sits inset.
 *
 * @example
 * <CompactTable label="Recent deploys" rows={deploys} rowKey={(d) => d.id}
 *   columns={[{ key: "site", header: "Website", cell: (d) => d.websiteName }]}
 *   empty={<EmptyState title="No deploys yet" />} />
 */
export function CompactTable<T>({
  label,
  columns,
  rows,
  rowKey,
  rowClassName,
  empty,
  dense = false,
  className,
}: {
  label: string;
  columns: CompactColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  rowClassName?: (row: T) => string | undefined;
  /** Shown in place of the rows when there are none. */
  empty?: ReactNode;
  dense?: boolean;
  className?: string;
}) {
  const align = (column: CompactColumn<T>) => (column.align === "end" ? "text-right" : undefined);

  return (
    <Table aria-label={label} className={cn("min-w-[640px]", dense ? "text-[13px]" : "text-sm", className)}>
      <TableHeader className="bg-transparent">
        <TableRow className="border-0 [&>th]:bg-muted [&>th:first-child]:rounded-l-[10px] [&>th:last-child]:rounded-r-[10px]">
          {columns.map((column) => (
            <TableHead key={column.key} className={cn(dense ? "h-9" : "h-[43px]", align(column))}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className="[&_tr:last-child]:border-b">
        {rows.length === 0 && empty ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} className="h-auto py-4">
              {empty}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, index) => (
            <TableRow key={rowKey(row)} className={cn("hover:bg-muted/70", rowClassName?.(row))}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(dense ? "h-auto py-2.5" : "h-[53px] py-2", align(column), column.className)}
                >
                  {column.cell(row, index)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
