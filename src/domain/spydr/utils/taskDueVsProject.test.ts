import { describe, expect, it } from "vitest";
import {
  formatProjectEndRelative,
  isDueAfterProjectTarget,
  toDateOnlyKey,
} from "./taskDueVsProject";

describe("taskDueVsProject", () => {
  it("treats YYYY-MM-DD strings as calendar dates", () => {
    expect(toDateOnlyKey("2026-09-21T00:00:00.000Z")).toBe("2026-09-21");
    expect(isDueAfterProjectTarget("2026-09-21", "2026-09-20")).toBe(true);
    expect(isDueAfterProjectTarget("2026-09-20", "2026-09-20")).toBe(false);
    expect(isDueAfterProjectTarget("2026-09-19", "2026-09-20")).toBe(false);
    expect(isDueAfterProjectTarget("2026-09-21", null)).toBe(false);
  });

  it("describes how far the project target is from today", () => {
    expect(formatProjectEndRelative(null)).toBeNull();
  });
});
