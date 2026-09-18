import { describe, expect, it } from "vitest";
import { moveIdInOrder, moveIdToRank } from "./collectionReorder";

const ids = ["a", "b", "c", "d"];

describe("moveIdInOrder", () => {
  it("moves an id up and down", () => {
    expect(moveIdInOrder(ids, "c", "up")).toEqual(["a", "c", "b", "d"]);
    expect(moveIdInOrder(ids, "a", "down")).toEqual(["b", "a", "c", "d"]);
  });

  it("returns null at the ends", () => {
    expect(moveIdInOrder(ids, "a", "up")).toBeNull();
    expect(moveIdInOrder(ids, "d", "down")).toBeNull();
  });
});

describe("moveIdToRank", () => {
  it("moves an id to a 1-based rank", () => {
    expect(moveIdToRank(ids, "c", 1)).toEqual(["c", "a", "b", "d"]);
    expect(moveIdToRank(ids, "a", 4)).toEqual(["b", "c", "d", "a"]);
    expect(moveIdToRank(ids, "b", 3)).toEqual(["a", "c", "b", "d"]);
  });

  it("clamps rank to the list", () => {
    expect(moveIdToRank(ids, "d", 0)).toEqual(["d", "a", "b", "c"]);
    expect(moveIdToRank(ids, "a", 99)).toEqual(["b", "c", "d", "a"]);
  });

  it("returns null when rank is unchanged or the id is missing", () => {
    expect(moveIdToRank(ids, "b", 2)).toBeNull();
    expect(moveIdToRank(ids, "missing", 1)).toBeNull();
  });
});
