import { describe, expect, it } from "vitest";
import {
  columnWidthsAfterResize,
  fitTracksToWidth,
  maxTrackWidth,
  resolveWorkGridLayout,
} from "./fitGridTracks";

const tracks = [
  { preferred: 32, min: 32 },
  { preferred: 320, min: 160, flexible: true },
  { preferred: 160, min: 120 },
  { preferred: 48, min: 48 },
];

describe("fitTracksToWidth", () => {
  it("gives free space to the flexible track", () => {
    const fitted = fitTracksToWidth(tracks, 800, 16, 48);
    const budget = 800 - 48 - 16 * 3;
    expect(fitted.overflows).toBe(false);
    expect(fitted.widths[0]).toBe(32);
    expect(fitted.widths[2]).toBe(160);
    expect(fitted.widths[3]).toBe(48);
    expect(fitted.widths.reduce((sum, width) => sum + width, 0)).toBe(budget);
    expect(fitted.widths[1]).toBeGreaterThan(320);
  });

  it("shrinks the flexible track before the columns the user sized", () => {
    const fitted = fitTracksToWidth(tracks, 520, 8, 48);
    const content = 520 - 48 - 8 * 3;
    expect(fitted.overflows).toBe(false);
    expect(fitted.widths.reduce((sum, width) => sum + width, 0)).toBe(content);
    expect(fitted.widths[0]).toBe(32);
    expect(fitted.widths[2]).toBe(160);
    expect(fitted.widths[3]).toBe(48);
    expect(fitted.widths[1]).toBeGreaterThanOrEqual(160);
    expect(fitted.widths[1]).toBeLessThan(320);
  });

  it("holds a locked column and takes the difference from the flexible track", () => {
    const locked = tracks.map((track, index) =>
      index === 2 ? { ...track, preferred: 200, min: 200 } : track
    );
    const fitted = fitTracksToWidth(locked, 520, 8, 48);
    expect(fitted.overflows).toBe(false);
    expect(fitted.widths[2]).toBe(200);
    expect(fitted.widths[1]).toBeGreaterThanOrEqual(160);
    expect(fitted.widths[0]).toBe(32);
    expect(fitted.widths[3]).toBe(48);
  });

  it("scrolls only when every track is already at its minimum", () => {
    const fitted = fitTracksToWidth(tracks, 200, 8, 48);
    expect(fitted.overflows).toBe(true);
    expect(fitted.widths).toEqual([32, 160, 120, 48]);
  });
});

describe("maxTrackWidth", () => {
  it("stops a resize before the other tracks drop under their minimum", () => {
    const max = maxTrackWidth(tracks, 2, 520, 8, 48, 720);
    const othersMin = 32 + 160 + 48;
    const budget = 520 - 48 - 8 * 3;
    expect(max).toBe(budget - othersMin);
  });
});

describe("resolveWorkGridLayout", () => {
  it("stays comfortable when the preferred tracks fit", () => {
    const layout = resolveWorkGridLayout(tracks, 900, 48);
    expect(layout.density).toBe("comfortable");
    expect(layout.overflows).toBe(false);
    expect(layout.scrollMinWidth).toBeUndefined();
    expect(layout.template).toContain("minmax(160px, 1fr)");
    const budget = 900 - 48 - layout.gapPx * 3;
    const fixed = layout.widths[0] + layout.widths[2] + layout.widths[3];
    expect(fixed).toBe(32 + 160 + 48);
    expect(layout.widths[1]).toBe(budget - fixed);
  });

  it("uses a tighter gap before it allows the grid to scroll", () => {
    const layout = resolveWorkGridLayout(
      [
        { preferred: 184, min: 184 },
        { preferred: 184, min: 184 },
        { preferred: 184, min: 184 },
      ],
      620,
      48
    );
    expect(layout.overflows).toBe(false);
    expect(layout.density).toBe("compact");
  });
});

describe("columnWidthsAfterResize", () => {
  const sized = [
    { id: "expand", preferred: 32, min: 32 },
    { id: "name", preferred: 320, min: 128, flexible: true },
    { id: "area", preferred: 148, min: 108 },
    { id: "actions", preferred: 48, min: 48 },
  ];
  const widths: Record<"name" | "area", number> = { name: 320, area: 148 };

  it("keeps the flexible width saved and stores the column that was resized", () => {
    const next = columnWidthsAfterResize(sized, widths, "area", 180, 800, 8, 32, 720);
    expect(next.name).toBe(320);
    expect(next.area).toBe(180);
  });

  it("moves a flexible-column drag onto the columns to its right", () => {
    const next = columnWidthsAfterResize(sized, widths, "name", 400, 800, 8, 32, 720);
    expect(next.name).toBe(320);
    expect(next.area).toBeGreaterThan(148);
    const fitted = fitTracksToWidth(
      sized.map((track) =>
        track.id === "area" ? { ...track, preferred: next.area } : track
      ),
      800,
      8,
      32
    );
    expect(fitted.widths[1]).toBe(400);
  });
});
