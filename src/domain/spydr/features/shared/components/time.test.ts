import { describe, expect, it } from "vitest";
import { formatNoteListDate } from "./time";

describe("formatNoteListDate", () => {
  const now = new Date(2026, 8, 18, 15, 30, 0);

  it("shows time for notes updated today", () => {
    const value = new Date(2026, 8, 18, 9, 42, 0).toISOString();
    const formatted = formatNoteListDate(value, now);
    expect(formatted).toMatch(/\d/);
    expect(formatted).not.toBe("Yesterday");
  });

  it("labels yesterday", () => {
    const value = new Date(2026, 8, 17, 21, 0, 0).toISOString();
    expect(formatNoteListDate(value, now)).toBe("Yesterday");
  });

  it("uses a weekday for the last few days", () => {
    const value = new Date(2026, 8, 15, 10, 0, 0).toISOString();
    expect(formatNoteListDate(value, now)).toMatch(/^\p{L}+$/u);
  });

  it("uses a calendar date for older notes this year", () => {
    const value = new Date(2026, 0, 12, 10, 0, 0).toISOString();
    expect(formatNoteListDate(value, now)).toMatch(/12/);
  });
});
