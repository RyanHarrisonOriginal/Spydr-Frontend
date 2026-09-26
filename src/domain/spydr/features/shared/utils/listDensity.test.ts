import { describe, expect, it } from "vitest";
import { LIST_DENSITY_GAP_PX, listDensities } from "./listDensity";

describe("list density", () => {
  it("tightens the gap from comfortable to compact", () => {
    expect(listDensities).toEqual(["comfortable", "cozy", "compact"]);
    expect(LIST_DENSITY_GAP_PX.comfortable).toBeGreaterThan(LIST_DENSITY_GAP_PX.cozy);
    expect(LIST_DENSITY_GAP_PX.cozy).toBeGreaterThan(LIST_DENSITY_GAP_PX.compact);
  });
});
