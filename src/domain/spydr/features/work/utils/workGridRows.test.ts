import { describe, expect, it } from "vitest";
import type { ProjectAreaNode, ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import {
  buildFlatTaskRows,
  buildHierarchyRows,
  indexCommitted,
} from "./workGridRows";

function project(
  id: string,
  title: string,
  status: string = "active"
): ProjectNode {
  return {
    id,
    title,
    status,
    priority: "high",
    area: "Ops",
    updatedAt: "2026-04-01T00:00:00.000Z",
    details: {
      emoji: "▲",
      targetDate: "2026-05-02",
      assigneePersonNodeId: "person-1",
      requesterPersonNodeId: null,
    },
  } as ProjectNode;
}

function task(
  id: string,
  title: string,
  status: string,
  projectId: string
): TaskNode {
  return {
    id,
    title,
    status,
    priority: "low",
    updatedAt: "2026-04-02T00:00:00.000Z",
    project: { id: projectId, title: "Alpha" },
    details: {
      emoji: null,
      dueDate: "2026-05-01",
      assigneePersonNodeId: null,
    },
  } as TaskNode;
}

const areas = [{ id: "area-1", title: "Ops" } as ProjectAreaNode];

describe("buildHierarchyRows", () => {
  it("nests open tasks under a project and keeps completed tasks out", () => {
    const rows = buildHierarchyRows(
      [project("p1", "Alpha")],
      new Map([
        [
          "p1",
          [
            task("t1", "Draft", "active", "p1"),
            task("t2", "Ship", "completed", "p1"),
          ],
        ],
      ]),
      areas,
      new Set(["p1"]),
      false
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.open).toBe(true);
    expect(rows[0]?.areaId).toBe("area-1");
    expect(rows[0]?.progressDone).toBe(1);
    expect(rows[0]?.progressTotal).toBe(2);
    expect(rows[0]?.blockedOpenCount).toBe(0);
    expect(rows[0]?.data?.map((row) => row.id)).toEqual(["t1"]);
    expect(rows[0]?.date?.getDate()).toBe(2);
  });

  it("rolls up open blocked tasks onto the project row", () => {
    const blocked: TaskNode = {
      ...task("t3", "Wait", "blocked", "p1"),
      blockedBy: { id: "t9", title: "Dep" },
      details: {
        emoji: null,
        dueDate: "2026-05-01",
        completedAt: null,
        isBlocked: true,
        blockedByNodeId: "t9",
        followUpAt: null,
        waitingNote: null,
        estimatedMinutes: null,
        assigneePersonNodeId: null,
        tags: [],
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-02T00:00:00.000Z",
      },
    };

    const rows = buildHierarchyRows(
      [project("p1", "Alpha")],
      new Map([["p1", [task("t1", "Draft", "active", "p1"), blocked]]]),
      areas,
      new Set(["p1"]),
      false
    );

    expect(rows[0]?.blockedOpenCount).toBe(1);
    expect(rows[0]?.blockedFirstBlocker).toEqual({ id: "t9", title: "Dep" });
    expect(rows[0]?.data?.[1]?.blockedById).toBe("t9");
  });

  it("drops the branch when every task is closed", () => {
    const rows = buildHierarchyRows(
      [project("p1", "Alpha")],
      new Map([["p1", [task("t2", "Ship", "completed", "p1")]]]),
      areas,
      new Set(["p1"]),
      false
    );

    expect(rows[0]?.data).toBeUndefined();
    expect(rows[0]?.open).toBeUndefined();
  });

  it("hides completed projects until showCompleted is on", () => {
    const hidden = buildHierarchyRows(
      [project("p1", "Alpha", "completed"), project("p2", "Beta")],
      new Map(),
      areas,
      new Set(),
      false
    );
    expect(hidden.map((row) => row.id)).toEqual(["p2"]);

    const shown = buildHierarchyRows(
      [project("p1", "Alpha", "completed"), project("p2", "Beta")],
      new Map(),
      areas,
      new Set(),
      true
    );
    expect(shown.map((row) => row.id)).toEqual(["p1", "p2"]);
  });
});

describe("buildFlatTaskRows", () => {
  it("maps a task onto the shared columns", () => {
    const rows = buildFlatTaskRows([task("t1", "Draft", "active", "p1")]);
    expect(rows[0]).toMatchObject({
      id: "t1",
      kind: "task",
      projectId: "p1",
      assigneeId: "",
      priority: "low",
    });
    expect(indexCommitted(rows).get("t1")?.date).toBe("2026-05-01");
  });

  it("hides completed tasks when showCompleted is false", () => {
    const rows = buildFlatTaskRows(
      [
        task("t1", "Draft", "active", "p1"),
        task("t2", "Ship", "completed", "p1"),
      ],
      false
    );
    expect(rows.map((row) => row.id)).toEqual(["t1"]);
  });
});
