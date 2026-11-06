import { describe, expect, it } from "vitest";
import { countVisiblePulse } from "@/domain/spydr/features/work/utils/workPulse";
import type {
  PersonNode,
  ProjectAreaNode,
  ProjectNode,
  TaskNode,
} from "@/domain/spydr/utils/types";
import { buildDashboardView } from "./buildDashboardView";

function project(
  partial: Partial<ProjectNode> & { id: string; title: string; status: string }
): ProjectNode {
  return {
    type: "project",
    priority: "medium",
    area: null,
    tags: [],
    body: "",
    createdAt: "",
    updatedAt: "",
    details: {
      outcome: null,
      startDate: null,
      targetDate: null,
      riskLevel: "medium",
      lastActivityAt: null,
      requesterPersonNodeId: null,
      assigneePersonNodeId: null,
      sponsorPersonNodeId: null,
      reviewerPersonNodeId: null,
      createdAt: "",
      updatedAt: "",
      ...partial.details,
    },
    ...partial,
  } as ProjectNode;
}

function task(
  partial: Partial<TaskNode> & { id: string; title: string; status: string }
): TaskNode {
  return {
    type: "task",
    priority: "medium",
    area: null,
    tags: [],
    body: "",
    createdAt: "",
    updatedAt: "",
    details: {
      dueDate: null,
      completedAt: null,
      isBlocked: false,
      blockedByNodeId: null,
      followUpAt: null,
      waitingNote: null,
      estimatedMinutes: null,
      assigneePersonNodeId: null,
      tags: [],
      createdAt: "",
      updatedAt: "",
      ...partial.details,
    },
    ...partial,
  } as TaskNode;
}

describe("buildDashboardView", () => {
  const now = new Date("2026-11-05T12:00:00");

  it("matches Work pulse counts from the same rows", () => {
    const projects = [
      project({
        id: "p1",
        title: "Alpha",
        status: "active",
        details: {
          outcome: null,
          startDate: null,
          targetDate: "2026-10-01",
          riskLevel: "medium",
          lastActivityAt: null,
          requesterPersonNodeId: null,
          assigneePersonNodeId: "me",
          sponsorPersonNodeId: null,
          reviewerPersonNodeId: null,
          createdAt: "",
          updatedAt: "",
        },
      }),
      project({ id: "p2", title: "Beta", status: "blocked" }),
    ];
    const tasks = [
      task({
        id: "t1",
        title: "Late",
        status: "active",
        details: {
          dueDate: "2026-10-20",
          completedAt: null,
          isBlocked: false,
          blockedByNodeId: null,
          followUpAt: null,
          waitingNote: null,
          estimatedMinutes: null,
          assigneePersonNodeId: "me",
          tags: [],
          createdAt: "",
          updatedAt: "",
        },
      }),
      task({ id: "t2", title: "Blocked", status: "blocked" }),
      task({ id: "t3", title: "Done", status: "completed" }),
    ];

    const view = buildDashboardView(projects, tasks, [], [], "me", now);
    expect(view.pulse).toEqual(countVisiblePulse(projects, tasks, now));
    expect(view.totals.overdue).toBe(view.pulse.overdue);
    expect(view.totals.blocked).toBe(view.pulse.blocked);
  });

  it("puts You first and Unassigned last in person load", () => {
    const people = [
      { id: "me", details: { fullName: "Ryan Harrison [TEST]" } } as PersonNode,
      { id: "other", details: { fullName: "Ada Lovelace" } } as PersonNode,
    ];
    const projects = [
      project({
        id: "p1",
        title: "A",
        status: "active",
        details: {
          outcome: null,
          startDate: null,
          targetDate: null,
          riskLevel: "medium",
          lastActivityAt: null,
          requesterPersonNodeId: null,
          assigneePersonNodeId: "other",
          sponsorPersonNodeId: null,
          reviewerPersonNodeId: null,
          createdAt: "",
          updatedAt: "",
        },
      }),
    ];
    const tasks = [
      task({
        id: "t1",
        title: "Mine",
        status: "active",
        details: {
          dueDate: null,
          completedAt: null,
          isBlocked: false,
          blockedByNodeId: null,
          followUpAt: null,
          waitingNote: null,
          estimatedMinutes: null,
          assigneePersonNodeId: "me",
          tags: [],
          createdAt: "",
          updatedAt: "",
        },
        assignee: people[0],
      }),
      task({
        id: "t2",
        title: "Orphan",
        status: "active",
        details: {
          dueDate: null,
          completedAt: null,
          isBlocked: false,
          blockedByNodeId: null,
          followUpAt: null,
          waitingNote: null,
          estimatedMinutes: null,
          assigneePersonNodeId: null,
          tags: [],
          createdAt: "",
          updatedAt: "",
        },
      }),
      task({
        id: "t3",
        title: "Ada many",
        status: "active",
        assignee: people[1],
        details: {
          dueDate: null,
          completedAt: null,
          isBlocked: false,
          blockedByNodeId: null,
          followUpAt: null,
          waitingNote: null,
          estimatedMinutes: null,
          assigneePersonNodeId: "other",
          tags: [],
          createdAt: "",
          updatedAt: "",
        },
      }),
      task({
        id: "t4",
        title: "Ada 2",
        status: "active",
        assignee: people[1],
        details: {
          dueDate: null,
          completedAt: null,
          isBlocked: false,
          blockedByNodeId: null,
          followUpAt: null,
          waitingNote: null,
          estimatedMinutes: null,
          assigneePersonNodeId: "other",
          tags: [],
          createdAt: "",
          updatedAt: "",
        },
      }),
    ];

    const view = buildDashboardView(projects, tasks, [], people, "me", now);
    expect(view.personLoads[0]?.label).toBe("You");
    expect(view.personLoads[view.personLoads.length - 1]?.label).toBe(
      "Unassigned"
    );
  });

  it("includes areas sorted by open tasks with No area last", () => {
    const areas = [
      {
        id: "a1",
        title: "Growth",
        details: { color: "210 90% 56%" },
      } as ProjectAreaNode,
    ];
    const projects = [
      project({ id: "p1", title: "G", status: "active", area: "Growth" }),
      project({ id: "p2", title: "None", status: "active", area: null }),
    ];
    const tasks = [
      task({
        id: "t1",
        title: "In area",
        status: "active",
        project: { id: "p1", title: "G" },
      }),
      task({
        id: "t2",
        title: "No area task",
        status: "active",
        project: { id: "p2", title: "None" },
      }),
    ];

    const view = buildDashboardView(projects, tasks, areas, [], null, now);
    expect(view.areas[0]?.name).toBe("Growth");
    expect(view.areas[view.areas.length - 1]?.name).toBe("No area");
  });
});
