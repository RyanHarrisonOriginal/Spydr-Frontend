import { describe, expect, it } from "vitest";
import { formatRelativeDue } from "./workGridRows";

describe("formatRelativeDue", () => {
  const now = new Date(2026, 3, 10); // Apr 10, 2026

  it("formats near-future days with absolute date", () => {
    expect(formatRelativeDue(new Date(2026, 3, 10), now)).toMatchObject({
      label: "today",
      dateLabel: "Apr 10",
      empty: false,
    });
    expect(formatRelativeDue(new Date(2026, 3, 11), now)).toMatchObject({
      label: "tomorrow",
      dateLabel: "Apr 11",
    });
    expect(formatRelativeDue(new Date(2026, 3, 13), now)).toMatchObject({
      label: "in 3d",
      dateLabel: "Apr 13",
    });
  });

  it("formats late dates with overdue relative label", () => {
    expect(formatRelativeDue(new Date(2026, 3, 9), now)).toMatchObject({
      label: "1d late",
      dateLabel: "Apr 9",
      overdue: true,
    });
    expect(formatRelativeDue(new Date(2026, 2, 6), now)).toMatchObject({
      label: "5w late",
      overdue: true,
    });
  });

  it("keeps absolute date beyond eight weeks without a relative phrase", () => {
    expect(formatRelativeDue(new Date(2026, 5, 12), now)).toMatchObject({
      label: "",
      dateLabel: "Jun 12",
      empty: false,
    });
  });

  it("marks missing dates empty", () => {
    expect(formatRelativeDue(null, now)).toMatchObject({
      empty: true,
      label: "",
      dateLabel: "",
    });
  });
});
