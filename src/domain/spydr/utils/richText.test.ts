import { describe, expect, it } from "vitest";
import {
  isRichTextEmpty,
  richTextToPlainText,
  toRenderableHtml,
  unescapeEscapedHtml,
} from "./richText";

describe("toRenderableHtml", () => {
  it("passes through TipTap HTML", () => {
    const html = "<p>Hello <strong>world</strong></p><ul><li><p>item</p></li></ul>";
    expect(toRenderableHtml(html)).toBe(html);
  });

  it("unescapes entity-encoded HTML once", () => {
    expect(toRenderableHtml("&lt;p&gt;Hello&lt;/p&gt;")).toBe("<p>Hello</p>");
  });

  it("wraps plain text, preserving line breaks", () => {
    expect(toRenderableHtml("hello\nworld")).toBe("<p>hello<br>world</p>");
    expect(toRenderableHtml("one\n\ntwo")).toBe("<p>one</p><p>two</p>");
  });

  it("escapes raw angle brackets in plain text", () => {
    expect(toRenderableHtml("a < b")).toBe("<p>a &lt; b</p>");
  });

  it("returns empty for blank input", () => {
    expect(toRenderableHtml("   ")).toBe("");
  });
});

describe("unescapeEscapedHtml", () => {
  it("leaves real HTML unchanged", () => {
    expect(unescapeEscapedHtml("<p>Hi</p>")).toBe("<p>Hi</p>");
  });
});

describe("richTextToPlainText", () => {
  it("strips tags from TipTap HTML", () => {
    expect(richTextToPlainText("<p>Hello <strong>world</strong></p>")).toBe(
      "Hello world"
    );
  });

  it("strips tags from escaped HTML", () => {
    expect(richTextToPlainText("&lt;p&gt;Hello&lt;/p&gt;")).toBe("Hello");
  });
});

describe("isRichTextEmpty", () => {
  it("treats empty paragraphs as empty", () => {
    expect(isRichTextEmpty("<p></p>")).toBe(true);
    expect(isRichTextEmpty("<p>note</p>")).toBe(false);
  });
});
