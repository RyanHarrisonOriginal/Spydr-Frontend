import { describe, expect, it } from "vitest";
import {
  buildPayloadForObjectType,
  defaultTitleFromSegment,
  operationTypeForObjectType,
} from "./buildOperationPayload";

describe("buildOperationPayload", () => {
  const segment = {
    topic: "Snowflake fallback",
    sourceText: "Query Snowflake directly when Power BI is too restrictive.",
    contextualText:
      "I decided querying Snowflake directly should remain our preferred fallback.",
  };

  it("builds typed payloads from segment metadata", () => {
    expect(buildPayloadForObjectType("task", segment, "proj-1")).toMatchObject({
      kind: "task",
      title: "Snowflake fallback",
      projectId: "proj-1",
    });
    expect(buildPayloadForObjectType("idea", segment, null)).toMatchObject({
      kind: "idea",
      title: "Snowflake fallback",
    });
    expect(buildPayloadForObjectType("note", segment, "proj-1")).toMatchObject({
      kind: "note",
      content: segment.sourceText,
    });
  });

  it("derives operation types from object type and attachment", () => {
    expect(operationTypeForObjectType("task", false)).toBe("create");
    expect(operationTypeForObjectType("note", true)).toBe("attach_context");
    expect(operationTypeForObjectType("relationship", false)).toBe("link");
  });

  it("falls back to source text for titles", () => {
    expect(
      defaultTitleFromSegment({ topic: "", sourceText: "Short line from note" })
    ).toBe("Short line from note");
  });
});
