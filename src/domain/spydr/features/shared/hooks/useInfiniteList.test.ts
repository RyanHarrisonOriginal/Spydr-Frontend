import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  mergeVisibleReorder,
  nextVisibleCount,
  useInfiniteList,
} from "./useInfiniteList";

describe("nextVisibleCount", () => {
  it("advances by a batch and stops at the list length", () => {
    expect(nextVisibleCount(20, 55, 20)).toBe(40);
    expect(nextVisibleCount(40, 55, 20)).toBe(55);
    expect(nextVisibleCount(55, 55, 20)).toBe(55);
  });
});

describe("useInfiniteList", () => {
  const items = Array.from({ length: 25 }, (_, index) => ({ id: String(index) }));

  it("grows by a batch and returns to the first batch when the reset key changes", () => {
    const { result, rerender } = renderHook(
      ({ resetKey }: { resetKey: string }) =>
        useInfiniteList(items, { batchSize: 10, resetKey }),
      { initialProps: { resetKey: "a" } }
    );

    expect(result.current.visibleItems).toHaveLength(10);
    act(() => result.current.loadMore());
    expect(result.current.visibleItems).toHaveLength(20);
    expect(result.current.hasMore).toBe(true);

    rerender({ resetKey: "b" });
    expect(result.current.visibleItems).toHaveLength(10);
    expect(
      result.current.mergeVisibleReorder([
        "1",
        "0",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
      ])
    ).toEqual([
      "1",
      "0",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      ...items.slice(10).map((item) => item.id),
    ]);
  });
});

describe("mergeVisibleReorder", () => {
  it("replaces the visible prefix and keeps the unloaded tail", () => {
    expect(mergeVisibleReorder(["a", "b", "c", "d"], 2, ["b", "a"])).toEqual([
      "b",
      "a",
      "c",
      "d",
    ]);
  });
});
