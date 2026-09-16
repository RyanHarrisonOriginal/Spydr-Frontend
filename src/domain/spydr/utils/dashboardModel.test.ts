import { describe, expect, it } from "vitest";
import {
  initialsFromName,
  rankedPersonLoads,
  ratioPercent,
} from "./dashboardModel";
import type { WorkspaceDashboard } from "./workspaceDashboard";

function dashboard(
  personLoads: WorkspaceDashboard["personLoads"]
): WorkspaceDashboard {
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalProjects: 0,
      activeProjects: 0,
      totalTasks: 0,
      openTasks: 0,
      blockedTasks: 0,
      overdueTasks: 0,
      unassignedProjects: 0,
      unassignedProjectTasks: 0,
      unlinkedTasks: 0,
    },
    projectStatusCounts: {},
    taskStatusCounts: {},
    personLoads,
  };
}

const emptyRoles = {
  assignee: 0,
  requester: 0,
  sponsor: 0,
  reviewer: 0,
};

describe("dashboard visuals helpers", () => {
  it("computes percentages without dividing by zero", () => {
    expect(ratioPercent(3, 10)).toBe(30);
    expect(ratioPercent(1, 0)).toBe(0);
  });

  it("builds initials from a display name", () => {
    expect(initialsFromName("Ryan H")).toBe("RH");
    expect(initialsFromName("Ada")).toBe("AD");
    expect(initialsFromName("  ")).toBe("?");
  });

  it("ranks people with the most open work first", () => {
    const ranked = rankedPersonLoads(
      dashboard([
        {
          person: { id: "b", name: "Bee" },
          projects: 1,
          openProjects: 1,
          tasks: 2,
          openTasks: 2,
          blockedTasks: 0,
          overdueTasks: 0,
          roleCounts: emptyRoles,
        },
        {
          person: { id: "a", name: "Ann" },
          projects: 1,
          openProjects: 1,
          tasks: 8,
          openTasks: 8,
          blockedTasks: 1,
          overdueTasks: 0,
          roleCounts: emptyRoles,
        },
      ])
    );

    expect(ranked.map((load) => load.person?.name)).toEqual(["Ann", "Bee"]);
  });
});
