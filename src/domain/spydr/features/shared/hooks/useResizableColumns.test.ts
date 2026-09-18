import { describe, expect, it } from "vitest";
import {
  clampColumnWidth,
  gridMinWidth,
  gridTemplateFromTracks,
  sanitizeColumnWidths,
} from "./useResizableColumns";

describe("clampColumnWidth", () => {
  it("rounds and stays within bounds", () => {
    expect(clampColumnWidth(140.6, 80, 200)).toBe(141);
    expect(clampColumnWidth(12, 80, 200)).toBe(80);
    expect(clampColumnWidth(900, 80, 200)).toBe(200);
  });
});

describe("sanitizeColumnWidths", () => {
  const defaults = { name: 320, status: 160 };

  it("fills from defaults when stored data is missing", () => {
    expect(sanitizeColumnWidths(null, defaults)).toEqual(defaults);
  });

  it("keeps valid stored widths and ignores unknown keys", () => {
    expect(
      sanitizeColumnWidths(
        { name: 410, status: 12, extra: 99 },
        defaults,
        80,
        720
      )
    ).toEqual({ name: 410, status: 80 });
  });
});

describe("grid helpers", () => {
  it("joins pixel and fixed tracks", () => {
    expect(gridTemplateFromTracks([32, "1fr", 148])).toBe("32px 1fr 148px");
  });

  it("includes gaps and padding in min width", () => {
    expect(gridMinWidth([32, 36, 320], 16, 48)).toBe(32 + 36 + 320 + 32 + 48);
  });
});
