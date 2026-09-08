import { describe, expect, it } from "vitest";
import type { NoteNode } from "@/domain/spydr/utils/types";
import {
  groupNotesForMobile,
  noteMobileGroupId,
} from "./notesMobileGroups";

function note(partial: Partial<NoteNode> & { id: string; updatedAt: string }): NoteNode {
  return {
    userId: "u1",
    organizationId: "o1",
    nodeType: "note",
    title: partial.title ?? partial.id,
    body: "",
    status: "active",
    priority: "medium",
    area: null,
    tags: [],
    sortOrder: 0,
    createdAt: partial.updatedAt,
    archivedAt: null,
    isDeleted: false,
    deletedAt: null,
    details: null,
    ...partial,
  };
}

describe("noteMobileGroupId", () => {
  const now = new Date("2026-09-05T18:00:00.000Z");

  it("buckets today / yesterday / earlier", () => {
    expect(noteMobileGroupId("2026-09-05T12:00:00.000Z", now)).toBe("today");
    expect(noteMobileGroupId("2026-09-04T12:00:00.000Z", now)).toBe("yesterday");
    expect(noteMobileGroupId("2026-09-01T12:00:00.000Z", now)).toBe("earlier");
  });
});

describe("groupNotesForMobile", () => {
  it("preserves order within buckets and omits empty groups", () => {
    const now = new Date("2026-09-05T18:00:00.000Z");
    const groups = groupNotesForMobile(
      [
        note({ id: "a", updatedAt: "2026-09-05T10:00:00.000Z" }),
        note({ id: "b", updatedAt: "2026-09-01T10:00:00.000Z" }),
        note({ id: "c", updatedAt: "2026-09-05T11:00:00.000Z" }),
        note({ id: "d", updatedAt: "2026-09-04T09:00:00.000Z" }),
      ],
      now
    );

    expect(groups.map((g) => g.id)).toEqual(["today", "yesterday", "earlier"]);
    expect(groups[0]?.notes.map((n) => n.id)).toEqual(["a", "c"]);
    expect(groups[1]?.notes.map((n) => n.id)).toEqual(["d"]);
    expect(groups[2]?.notes.map((n) => n.id)).toEqual(["b"]);
  });
});
