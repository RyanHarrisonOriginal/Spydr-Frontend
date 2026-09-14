import { describe, expect, it } from "vitest";
import type { TaskNode } from "./types";
import { sortNestedTasks } from "./nestedTaskSort";

function task(overrides: Partial<TaskNode> & { id: string; title: string }): TaskNode {
  return {
    organizationId: "org",
    userId: "user",
    nodeType: "task",
    body: "",
    status: "active",
    priority: "medium",
    area: null,
    tags: [],
    sortOrder: 0,
    createdAt: "",
    updatedAt: "",
    archivedAt: null,
    isDeleted: false,
    deletedAt: null,
    details: null,
    ...overrides,
  } as TaskNode;
}

describe("sortNestedTasks", () => {
  it("sorts by due date with empty values last", () => {
    const tasks = [
      task({ id: "a", title: "A", details: { dueDate: "2026-09-20" } as TaskNode["details"] }),
      task({ id: "b", title: "B", details: { dueDate: null } as TaskNode["details"] }),
      task({ id: "c", title: "C", details: { dueDate: "2026-09-10" } as TaskNode["details"] }),
    ];

    expect(
      sortNestedTasks(tasks, { columnId: "due", direction: "asc" }).map((entry) => entry.id)
    ).toEqual(["c", "a", "b"]);
  });

  it("sorts by title", () => {
    const tasks = [
      task({ id: "b", title: "Beta" }),
      task({ id: "a", title: "Alpha" }),
    ];

    expect(
      sortNestedTasks(tasks, { columnId: "title", direction: "asc" }).map(
        (entry) => entry.title
      )
    ).toEqual(["Alpha", "Beta"]);
  });

  it("keeps manual order as the default", () => {
    const tasks = [
      task({ id: "later", title: "Later", sortOrder: 2000 }),
      task({ id: "first", title: "First", sortOrder: 1000 }),
    ];

    expect(
      sortNestedTasks(tasks, { columnId: "order", direction: "asc" }).map((entry) => entry.id)
    ).toEqual(["first", "later"]);
  });
});
