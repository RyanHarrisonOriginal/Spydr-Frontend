import { describe, expect, it } from "vitest";
import { formatDayGroupLabel, groupLogByDay } from "./dayGroups";

describe("dayGroups", () => {
  const now = new Date("2026-11-05T15:00:00");

  it("labels today, yesterday, and dated days", () => {
    expect(formatDayGroupLabel("2026-11-05T12:00:00", now)).toBe("Today");
    expect(formatDayGroupLabel("2026-11-04T12:00:00", now)).toBe("Yesterday");
    expect(formatDayGroupLabel("2026-09-22T12:00:00", now)).toBe("Sep 22");
    expect(formatDayGroupLabel("2025-09-22T12:00:00", now)).toMatch(/2025/);
  });

  it("groups items by day preserving order", () => {
    const items = [
      { id: "1", at: "2026-11-05T10:00:00" },
      { id: "2", at: "2026-11-05T09:00:00" },
      { id: "3", at: "2026-11-04T10:00:00" },
    ];
    const groups = groupLogByDay(items, (item) => item.at, now);
    expect(groups.map((group) => group.label)).toEqual(["Today", "Yesterday"]);
    expect(groups[0].items.map((item) => item.id)).toEqual(["1", "2"]);
  });
});
