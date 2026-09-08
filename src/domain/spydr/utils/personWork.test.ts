import { describe, expect, it } from "vitest";
import { filterProjectsForPerson } from "./personWork";
import type { ProjectNode, TaskNode } from "./types";

function project(
  id: string,
  details: Partial<NonNullable<ProjectNode["details"]>> = {}
): ProjectNode {
  return {
    id,
    title: id,
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
      ...details,
    },
  } as ProjectNode;
}

function task(
  id: string,
  projectId: string | null,
  assigneeId: string | null,
  status: string
): TaskNode {
  return {
    id,
    title: id,
    status,
    project: projectId ? { id: projectId, title: projectId } : null,
    details: { assigneePersonNodeId: assigneeId },
  } as TaskNode;
}

const person = "person-1";

describe("filterProjectsForPerson", () => {
  it("returns all projects when no person is selected", () => {
    const projects = [project("a"), project("b")];
    expect(filterProjectsForPerson(projects, [], null)).toEqual(projects);
  });

  it("includes a project the person owns even with no tasks", () => {
    const owned = project("owned", { assigneePersonNodeId: person });
    expect(filterProjectsForPerson([owned], [], person)).toEqual([owned]);
  });

  it("includes a project with an open task assigned to the person", () => {
    const other = project("other", { assigneePersonNodeId: "someone-else" });
    const tasks = [task("t1", "other", person, "active")];
    expect(filterProjectsForPerson([other], tasks, person)).toEqual([other]);
  });

  it("excludes a project the person only reviews or sponsors", () => {
    const reviewed = project("reviewed", { reviewerPersonNodeId: person });
    const sponsored = project("sponsored", { sponsorPersonNodeId: person });
    expect(filterProjectsForPerson([reviewed, sponsored], [], person)).toEqual([]);
  });

  it("excludes a project where the person only has completed assigned tasks", () => {
    const other = project("other", { assigneePersonNodeId: "someone-else" });
    const tasks = [task("t1", "other", person, "completed")];
    expect(filterProjectsForPerson([other], tasks, person)).toEqual([]);
  });
});
