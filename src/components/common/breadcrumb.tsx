/** Name of the current user-dashboard page, shown at the top of the page. */
export function Breadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex h-5 items-center text-[13px] leading-[19.5px]">
      <span aria-current="page" className="font-semibold text-foreground">
        {current}
      </span>
    </nav>
  );
}
