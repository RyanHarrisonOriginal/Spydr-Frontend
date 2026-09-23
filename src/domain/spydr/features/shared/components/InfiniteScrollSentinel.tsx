import { useEffect, useLayoutEffect, useRef } from "react";

function scrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current) {
    const { overflowY } = getComputedStyle(current);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/** Scroll the list's overflow parent back to the top when filters or view change. */
export function useScrollListToStart(resetKey: string | number) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const previousKey = useRef(resetKey);

  useLayoutEffect(() => {
    if (previousKey.current === resetKey) return;
    previousKey.current = resetKey;
    const parent = scrollParent(anchorRef.current);
    if (parent) parent.scrollTop = 0;
  }, [resetKey]);

  return anchorRef;
}

interface InfiniteScrollSentinelProps {
  hasMore: boolean;
  onLoadMore: () => void;
  /** Changes after each batch so a still-visible sentinel loads again. */
  loadedCount: number;
  noun?: string;
}

export function InfiniteScrollSentinel({
  hasMore,
  onLoadMore,
  loadedCount,
  noun = "items",
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { root: scrollParent(node), rootMargin: "320px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, loadedCount]);

  if (!hasMore) return null;

  return (
    <div
      ref={ref}
      className="flex justify-center px-4 py-4 md:px-6"
      role="status"
      aria-live="polite"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Loading more {noun}
      </p>
    </div>
  );
}
