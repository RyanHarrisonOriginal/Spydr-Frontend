import { describe, expect, it } from "vitest";
import {
  activeNotePlainTextToHtml,
  applyMentionInsert,
  filterMentionItems,
  formatMentionInsert,
  parseMentionQuery,
  parseSuggestionQuery,
  type ActiveNoteMentionItem,
} from "./activeNoteMentions";

const items: ActiveNoteMentionItem[] = [
  { id: "p1", kind: "project", title: "Muay Thai" },
  { id: "t1", kind: "task", title: "Drill lead teep", subtitle: "Muay Thai" },
  { id: "n1", kind: "note", title: "Sparring log", subtitle: "Muay Thai" },
  { id: "t2", kind: "task", title: "Ship launch checklist", subtitle: "Launch" },
];

describe("parseMentionQuery", () => {
  it("detects an open @ query at the caret", () => {
    const value = "hello @mu";
    expect(parseMentionQuery(value, value.length)).toEqual({
      atIndex: 6,
      rawQuery: "mu",
      kind: null,
      search: "mu",
    });
  });

  it("parses kind prefixes", () => {
    expect(parseMentionQuery("@task teep", 10)).toEqual({
      atIndex: 0,
      rawQuery: "task teep",
      kind: "task",
      search: "teep",
    });
    expect(parseMentionQuery("@project", 8)?.kind).toBe("project");
  });

  it("returns null when @ is mid-word or closed", () => {
    expect(parseMentionQuery("email@x", 7)).toBeNull();
    expect(parseMentionQuery("hello world", 5)).toBeNull();
  });
});

describe("filterMentionItems", () => {
  it("filters by kind and search", () => {
    const query = parseMentionQuery("@task teep", 10)!;
    expect(filterMentionItems(items, query).map((item) => item.id)).toEqual([
      "t1",
    ]);
  });
});

describe("applyMentionInsert", () => {
  it("replaces the @query with a typed mention", () => {
    const value = "Note: @task te";
    const caret = value.length;
    const query = parseMentionQuery(value, caret)!;
    const next = applyMentionInsert(value, caret, query, items[1]!);
    expect(next.value).toBe("Note: @task Drill lead teep ");
    expect(formatMentionInsert(items[1]!)).toBe("@task Drill lead teep");
    expect(next.caret).toBe(next.value.length);
  });
});

describe("parseSuggestionQuery", () => {
  it("parses TipTap query text after @", () => {
    expect(parseSuggestionQuery("task teep")).toMatchObject({
      kind: "task",
      search: "teep",
    });
  });
});

describe("activeNotePlainTextToHtml", () => {
  it("wraps lines in paragraphs and escapes HTML", () => {
    expect(activeNotePlainTextToHtml("a <b>\nc")).toBe(
      "<p>a &lt;b&gt;</p><p>c</p>"
    );
  });
});
