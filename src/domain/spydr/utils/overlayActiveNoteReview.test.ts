import { describe, expect, it } from "vitest";
import type { ActiveNoteProposal } from "./activeNoteTypes";
import {
  overlayApplyResultOnOperations,
  overlayReviewSnapshotOnProposal,
} from "./overlayActiveNoteReview";

function proposal(): ActiveNoteProposal {
  return {
    activeNote: {
      id: "session-1",
      content: "Throw more teeps.",
      projectId: null,
      status: "review",
      createdAt: "2026-09-04T12:00:00.000Z",
      updatedAt: "2026-09-04T12:00:00.000Z",
    },
    summary: "Two segments",
    operations: [
      {
        id: "op-0",
        operationType: "create",
        objectType: "task",
        payload: { kind: "task", title: "Drill teeps", projectId: "proj-1" },
        confidence: 0.9,
        evidence: [],
        explicitlyStated: true,
        status: "proposed",
        selected: true,
      },
      {
        id: "op-1",
        operationType: "create",
        objectType: "note",
        payload: {
          kind: "note",
          title: "Sparring note",
          content: "Throw more teeps.",
          projectId: "proj-1",
        },
        confidence: 0.8,
        evidence: [],
        explicitlyStated: false,
        status: "proposed",
        selected: true,
      },
    ],
    warnings: [],
  };
}

describe("overlayReviewSnapshotOnProposal", () => {
  it("marks applied, rejected, and failed suggestions without locking rejected items", () => {
    const next = overlayReviewSnapshotOnProposal(proposal(), {
      operations: [
        {
          operationId: "op-0",
          title: "Drill teeps",
          objectType: "task",
          selected: true,
          outcome: "accepted",
        },
        {
          operationId: "op-1",
          title: "Sparring note",
          objectType: "note",
          selected: false,
          outcome: "rejected",
        },
      ],
      applied: [
        {
          id: "task-1",
          type: "task",
          title: "Drill teeps",
          action: "created",
          href: "/tasks/task-1",
          operationId: "op-0",
        },
      ],
      failed: [],
      appliedAt: "2026-09-04T12:10:00.000Z",
    });

    expect(next.operations[0]).toMatchObject({
      applyDecision: "accepted",
      status: "executed",
      selected: false,
      appliedObject: { id: "task-1", href: "/tasks/task-1" },
    });
    expect(next.operations[1]).toMatchObject({
      applyDecision: "rejected",
      status: "proposed",
      selected: false,
    });
  });
});

describe("overlayApplyResultOnOperations", () => {
  it("marks newly applied operations and keeps the rest", () => {
    const current = overlayReviewSnapshotOnProposal(proposal(), {
      operations: [
        {
          operationId: "op-0",
          title: "Drill teeps",
          objectType: "task",
          selected: true,
          outcome: "accepted",
        },
        {
          operationId: "op-1",
          title: "Sparring note",
          objectType: "note",
          selected: false,
          outcome: "rejected",
        },
      ],
      applied: [
        {
          id: "task-1",
          type: "task",
          title: "Drill teeps",
          action: "created",
          href: "/tasks/task-1",
          operationId: "op-0",
        },
      ],
      failed: [],
      appliedAt: "2026-09-04T12:10:00.000Z",
    }).operations;

    const next = overlayApplyResultOnOperations(current, {
      activeNote: proposal().activeNote,
      applied: [
        {
          id: "note-1",
          type: "note",
          title: "Sparring note",
          action: "created",
          href: "/notes/note-1",
          operationId: "op-1",
        },
      ],
      failed: [],
      partial: false,
    });

    expect(next[0]?.applyDecision).toBe("accepted");
    expect(next[1]).toMatchObject({
      applyDecision: "accepted",
      appliedObject: { id: "note-1" },
      selected: false,
    });
  });
});
