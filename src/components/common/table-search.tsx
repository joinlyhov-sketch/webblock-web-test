import { SearchInput } from "@/components/common/search-input";
import type { SearchParams } from "@/lib/table-query";

/**
 * Toolbar search box for admin tables. Same pill search as the owner portal: types live (debounced),
 * keeps its text in `?q=`, keeps the other filters and goes back to page 1.
 */
export function TableSearch({
  searchParams,
  placeholder,
}: {
  searchParams: SearchParams;
  placeholder: string;
}) {
  const value = searchParams.q;

  return (
    <SearchInput
      defaultValue={(Array.isArray(value) ? value[0] : value) ?? ""}
      placeholder={placeholder}
      label={placeholder}
      // Same height and text size as the toolbar's `size="sm"` buttons (FilterMenu, tabs).
      className="h-8 w-full max-w-[300px] gap-2 px-3 [&_input]:text-[13px] [&_svg]:size-[15px]"
    />
  );
}
