import { describe, expect, it } from "vitest";
import { getNotePreview } from "./notePreview";

describe("getNotePreview", () => {
  it("uses the title and a plain-text snippet from HTML", () => {
    expect(
      getNotePreview("Kickoff", "<p>Ship the mapper <strong>this week</strong>.</p>")
    ).toEqual({
      title: "Kickoff",
      snippet: "Ship the mapper this week.",
      untitled: false,
    });
  });

  it("falls back to Untitled note when both title and body are empty", () => {
    expect(getNotePreview("", "<p></p>")).toEqual({
      title: "Untitled note",
      snippet: "",
      untitled: true,
    });
  });

  it("uses the first sentence as the title when untitled", () => {
    expect(
      getNotePreview("", "<p>Client wants a rewrite. Include the new brief.</p>")
    ).toEqual({
      title: "Client wants a rewrite.",
      snippet: "Include the new brief.",
      untitled: true,
    });
  });

  it("uses a short untitled body as the title with no snippet", () => {
    expect(getNotePreview("  ", "<p>Parking lot</p>")).toEqual({
      title: "Parking lot",
      snippet: "",
      untitled: true,
    });
  });
});
