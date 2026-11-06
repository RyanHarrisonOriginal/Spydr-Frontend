import { describe, expect, it } from "vitest";
import {
  cleanPersonName,
  formatPerson,
  personGivenName,
  personInitials,
} from "./projectPersonas";
import type { PersonNode } from "./types";

function person(fullName: string, id = "p1"): PersonNode {
  return {
    id,
    details: { fullName },
  } as PersonNode;
}

describe("person initials and given name", () => {
  it("uses first and last initials for a full name", () => {
    expect(personInitials(person("Ryan Hall"))).toBe("RH");
    expect(personGivenName(person("Ryan Hall"))).toBe("Ryan");
  });

  it("strips bracketed and parenthetical segments", () => {
    expect(personInitials(person("Ryan Harrison [TEST]"))).toBe("RH");
    expect(personInitials(person("Ada Lovelace (TEST)"))).toBe("AL");
    expect(cleanPersonName("Ryan Harrison [TEST]")).toBe("Ryan Harrison");
  });

  it("uses the first letter of a single name", () => {
    expect(personInitials(person("Madonna"))).toBe("M");
    expect(personGivenName(person("Madonna"))).toBe("Madonna");
  });

  it("returns empty when the person or name is missing", () => {
    expect(personInitials(null)).toBe("");
    expect(personInitials(person(""))).toBe("");
    expect(personInitials(person("[TEST]"))).toBe("");
    expect(personGivenName(null)).toBe("");
  });
});

describe("formatPerson", () => {
  it("labels the current user as You", () => {
    expect(formatPerson(person("Ryan Harrison [TEST]", "me"), "me")).toEqual({
      label: "You",
      initials: "RH",
    });
  });

  it("returns a clean name for others", () => {
    expect(formatPerson(person("Ada Lovelace (TEST)", "a1"), "me")).toEqual({
      label: "Ada Lovelace",
      initials: "AL",
    });
  });

  it("returns Unassigned for a missing person", () => {
    expect(formatPerson(null, "me")).toEqual({
      label: "Unassigned",
      initials: "",
    });
  });
});
