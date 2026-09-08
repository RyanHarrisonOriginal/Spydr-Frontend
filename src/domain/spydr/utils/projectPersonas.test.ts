import { describe, expect, it } from "vitest";
import {
  personGivenName,
  personInitials,
} from "./projectPersonas";
import type { PersonNode } from "./types";

function person(fullName: string): PersonNode {
  return {
    details: { fullName },
  } as PersonNode;
}

describe("person initials and given name", () => {
  it("uses first and last initials for a full name", () => {
    expect(personInitials(person("Ryan Hall"))).toBe("RH");
    expect(personGivenName(person("Ryan Hall"))).toBe("Ryan");
  });

  it("uses the first two letters of a single name", () => {
    expect(personInitials(person("Madonna"))).toBe("MA");
    expect(personGivenName(person("Madonna"))).toBe("Madonna");
  });

  it("falls back when the person is missing", () => {
    expect(personInitials(null)).toBe("?");
    expect(personGivenName(null)).toBe("");
  });
});
