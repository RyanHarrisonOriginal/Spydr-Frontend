import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LIST_PAGE_SIZE_OPTIONS,
  type ClientPaginationControls,
  type ListPageSize,
} from "../hooks/useClientPagination";

interface ListPaginationProps {
  pagination: ClientPaginationControls;
  noun?: string;
  className?: string;
}

function visiblePageNumbers(pageIndex: number, pageCount: number): number[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index);
  }

  const pages = new Set<number>([0, pageCount - 1, pageIndex]);
  for (const offset of [-1, 1, -2, 2]) {
    const next = pageIndex + offset;
    if (next > 0 && next < pageCount - 1) pages.add(next);
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export function ListPagination({
  pagination,
  noun = "items",
  className,
}: ListPaginationProps) {
  const {
    pageIndex,
    pageSize,
    pageCount,
    totalItems,
    rangeStart,
    rangeEnd,
    canPreviousPage,
    canNextPage,
    setPageIndex,
    setPageSize,
    previousPage,
    nextPage,
  } = pagination;

  if (totalItems === 0) return null;

  const pages = visiblePageNumbers(pageIndex, pageCount);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6",
        className
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Showing {rangeStart}–{rangeEnd} of {totalItems} {noun}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <span className="font-mono text-[10px] uppercase tracking-wider">
            Per page
          </span>
          <select
            value={pageSize}
            onChange={(event) =>
              setPageSize(Number(event.target.value) as ListPageSize)
            }
            className="h-8 rounded-md border border-input bg-background px-2 text-[12px] ring-focus"
            aria-label="Items per page"
          >
            {LIST_PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 px-0"
            disabled={!canPreviousPage}
            onClick={previousPage}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pages.map((page, index) => {
            const previous = pages[index - 1];
            const showEllipsis = previous != null && page - previous > 1;
            return (
              <div key={page} className="flex items-center gap-1">
                {showEllipsis ? (
                  <span className="px-1 font-mono text-[10px] text-muted-foreground">
                    …
                  </span>
                ) : null}
                <Button
                  type="button"
                  variant={page === pageIndex ? "outline" : "ghost"}
                  size="sm"
                  className="h-8 min-w-8 px-2 text-[12px]"
                  aria-current={page === pageIndex ? "page" : undefined}
                  onClick={() => setPageIndex(page)}
                >
                  {page + 1}
                </Button>
              </div>
            );
          })}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 px-0"
            disabled={!canNextPage}
            onClick={nextPage}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
