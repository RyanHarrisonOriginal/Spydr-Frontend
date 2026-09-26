import { describe, expect, it } from "vitest";
import {
  VIRTUAL_ROW_ESTIMATE,
  rowOffsets,
  visibleIndexRange,
} from "./measuredVirtualWindow";

describe("rowOffsets", () => {
  it("uses the measured height and estimates the rows that have not been seen", () => {
    const offsets = rowOffsets(3, (index) => (index === 1 ? 140 : undefined));
    expect(offsets).toEqual([
      0,
      VIRTUAL_ROW_ESTIMATE,
      VIRTUAL_ROW_ESTIMATE + 140,
      VIRTUAL_ROW_ESTIMATE + 140 + VIRTUAL_ROW_ESTIMATE,
    ]);
  });
});

describe("visibleIndexRange", () => {
  it("windows the viewport and keeps an overscan of unmeasured neighbors", () => {
    const offsets = rowOffsets(10, () => 100);
    const range = visibleIndexRange(offsets, 250, 200, 1);
    expect(range.start).toBe(1);
    expect(range.end).toBe(6);
    expect(offsets[range.end - 1]).toBeLessThan(250 + 200 + 100);
  });
});
