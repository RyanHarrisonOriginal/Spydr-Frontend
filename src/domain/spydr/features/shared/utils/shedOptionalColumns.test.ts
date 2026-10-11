import { describe, expect, it } from "vitest";
import {
  essentialTracksOverflow,
  shedOptionalColumns,
} from "./shedOptionalColumns";
import type { FittedTrack } from "./fitGridTracks";

function tracksFor(optional: string[]): FittedTrack[] {
  return [
    { preferred: 32, min: 32 },
    { preferred: 200, min: 128, flexible: true },
    ...optional.map(() => ({ preferred: 160, min: 120 })),
    { preferred: 48, min: 48 },
  ];
}

describe("shedOptionalColumns", () => {
  it("keeps every column when width is unknown", () => {
    expect(
      shedOptionalColumns(
        ["a", "b", "c"],
        ["c", "b", "a"],
        tracksFor,
        0,
        32
      )
    ).toEqual(["a", "b", "c"]);
  });

  it("drops least-important columns until mins fit", () => {
    // essentials 32+128+48 + pad 32 = 240; each optional adds 120 + gap
    const kept = shedOptionalColumns(
      ["a", "b", "c"],
      ["c", "b", "a"],
      tracksFor,
      420,
      32
    );
    expect(kept.length).toBeLessThan(3);
    expect(kept.includes("c")).toBe(false);
  });

  it("preserves the caller's optional order among kept columns", () => {
    const kept = shedOptionalColumns(
      ["a", "b"],
      ["b", "a"],
      tracksFor,
      10_000,
      32
    );
    expect(kept).toEqual(["a", "b"]);
  });
});

describe("essentialTracksOverflow", () => {
  it("reports overflow when essentials cannot fit", () => {
    expect(
      essentialTracksOverflow(
        [
          { preferred: 100, min: 100 },
          { preferred: 100, min: 100 },
        ],
        150,
        32
      )
    ).toBe(true);
  });
});
