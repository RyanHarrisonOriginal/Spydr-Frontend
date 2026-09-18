import { describe, expect, it } from "vitest";
import { resolveListDensity } from "./listDensity";

describe("resolveListDensity", () => {
  it("stays comfortable when columns fit", () => {
    expect(resolveListDensity(1400, 1100)).toBe("comfortable");
  });

  it("tightens spacing before shrinking type", () => {
    expect(resolveListDensity(900, 1000)).toBe("cozy");
  });

  it("uses compact only when the table is substantially over-wide", () => {
    expect(resolveListDensity(700, 1100)).toBe("compact");
  });

  it("defaults comfortable before the container is measured", () => {
    expect(resolveListDensity(0, 1100)).toBe("comfortable");
  });
});
