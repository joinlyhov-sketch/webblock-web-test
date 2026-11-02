import { RowsSelect } from "@/components/common/rows-select";
import { parseTableQuery, type SearchParams } from "@/lib/table-query";

/** Toolbar "Rows [10]" select: page size lives in the URL (`?size=`). */
export function RowsMenu({ searchParams }: { searchParams: SearchParams }) {
  const { size } = parseTableQuery(searchParams);
  return <RowsSelect value={size} />;
}
