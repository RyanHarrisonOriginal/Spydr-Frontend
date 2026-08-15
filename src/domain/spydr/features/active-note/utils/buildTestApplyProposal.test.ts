import { describe, expect, it } from "vitest";
import { buildTestApplyProposal } from "./buildTestApplyProposal";
import type { ProjectNode, TaskNode } from "@/domain/spydr/utils/types";

const project = {
  id: "proj-1",
  title: "Scorecard",
  nodeType: "project",
  status: "active",
} as ProjectNode;

const task = {
  id: "task-1",
  title: "Validate metrics",
  nodeType: "task",
  status: "active",
  project: { id: "proj-1", title: "Scorecard" },
} as TaskNode;

describe("buildTestApplyProposal", () => {
  it("builds apply-ready operations against real project and task ids", () => {
    const proposal = buildTestApplyProposal({
      projects: [project],
      tasks: [task],
      preferredProjectId: "proj-1",
    });

    expect(proposal.operations.map((op) => op.id)).toEqual([
      "test-op-task",
      "test-op-note",
      "test-op-attach",
      "test-op-project",
    ]);
    expect(proposal.operations[0]).toMatchObject({
      selected: true,
      objectType: "task",
      selectedProjectId: "proj-1",
      payload: { kind: "task", projectId: "proj-1" },
    });
    expect(proposal.operations[2]).toMatchObject({
      operationType: "attach_context",
      attachment: { type: "task", id: "task-1" },
      payload: { kind: "note", projectId: "proj-1" },
    });
  });

  it("still offers a create-project suggestion when no projects exist", () => {
    const proposal = buildTestApplyProposal({ projects: [], tasks: [] });
    expect(proposal.operations).toHaveLength(1);
    expect(proposal.operations[0]).toMatchObject({
      objectType: "project",
      payload: { kind: "project", title: "Test apply project" },
    });
  });
});
