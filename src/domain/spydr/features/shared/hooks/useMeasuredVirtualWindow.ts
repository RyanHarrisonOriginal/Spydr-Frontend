import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { findScrollParent } from "@/domain/spydr/features/shared/utils/scrollParent";
import {
  VIRTUAL_OVERSCAN,
  VIRTUAL_ROW_ESTIMATE,
  VIRTUAL_ROW_GAP,
  rowOffsets,
  visibleIndexRange,
} from "@/domain/spydr/features/shared/utils/measuredVirtualWindow";

/**
 * Windows a long list by each row's measured height. Rows that have not been
 * mounted yet keep an estimate, then replace it once a ResizeObserver sees them.
 */
export function useMeasuredVirtualWindow(ids: readonly string[], enabled: boolean) {
  const rootRef = useRef<HTMLElement | null>(null);
  const heights = useRef(new Map<string, number>());
  const nodes = useRef(new Map<string, HTMLElement>());
  const [scroll, setScroll] = useState({ top: 0, height: 0 });
  const [measuredTick, setMeasuredTick] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const parent = findScrollParent(rootRef.current);
    if (!parent) return;

    const read = () => {
      setScroll((current) => {
        const top = parent.scrollTop;
        const height = parent.clientHeight;
        if (current.top === top && current.height === height) return current;
        return { top, height };
      });
    };
    read();
    parent.addEventListener("scroll", read, { passive: true });
    const observer = new ResizeObserver(read);
    observer.observe(parent);
    return () => {
      parent.removeEventListener("scroll", read);
      observer.disconnect();
    };
  }, [enabled, ids.length]);

  const offsets = useMemo(
    () =>
      rowOffsets(
        ids.length,
        (index) => heights.current.get(ids[index]),
        VIRTUAL_ROW_ESTIMATE + VIRTUAL_ROW_GAP
      ),
    [ids, measuredTick]
  );

  const range = visibleIndexRange(
    offsets,
    scroll.top,
    scroll.height || VIRTUAL_ROW_ESTIMATE,
    VIRTUAL_OVERSCAN
  );

  const remember = useCallback((key: string, node: HTMLElement) => {
    if (node.offsetHeight <= 0) return;
    const next = Math.ceil(node.offsetHeight + VIRTUAL_ROW_GAP);
    if (heights.current.get(key) === next) return;
    heights.current.set(key, next);
    setMeasuredTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const observer = new ResizeObserver((entries) => {
      let changed = false;
      for (const entry of entries) {
        const node = entry.target as HTMLElement;
        const key = node.dataset.virtualKey;
        if (!key) continue;
        if (node.offsetHeight <= 0) continue;
        const next = Math.ceil(node.offsetHeight + VIRTUAL_ROW_GAP);
        if (heights.current.get(key) === next) continue;
        heights.current.set(key, next);
        changed = true;
      }
      if (changed) setMeasuredTick((tick) => tick + 1);
    });
    for (const node of nodes.current.values()) observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, range.start, range.end]);

  const setRowRef = useCallback(
    (key: string) => (node: HTMLElement | null) => {
      if (!node) {
        nodes.current.delete(key);
        return;
      }
      node.dataset.virtualKey = key;
      nodes.current.set(key, node);
      remember(key, node);
    },
    [remember]
  );

  return {
    rootRef,
    start: enabled ? range.start : 0,
    end: enabled ? range.end : ids.length,
    totalSize: offsets[ids.length] ?? 0,
    offsetOf: (index: number) => offsets[index] ?? 0,
    setRowRef,
  };
}
