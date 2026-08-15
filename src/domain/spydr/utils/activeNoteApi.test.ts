import { describe, expect, it } from "vitest";
import { buildActiveNoteApplyRequestBody } from "./activeNoteApi";
import type { ApplyActiveNoteProposalInput } from "./activeNoteTypes";

describe("buildActiveNoteApplyRequestBody", () => {
  it("matches the backend POST /active-notes/apply contract", () => {
    const input: ApplyActiveNoteProposalInput = {
      content: "Met with Amy today.",
      projectId: null,
      operations: [
        {
          operationId: "op-0",
          selected: true,
          objectType: "note",
          payload: {
            kind: "note",
            title: "Meeting update",
            content: "Met with Amy today.",
            projectId: "proj-scorecard",
          },
          selectedProjectId: "proj-scorecard",
          projectRef: null,
          duplicateResolution: null,
          targetObjectId: "task-signoff",
          attachment: { type: "task", id: "task-signoff", ref: null },
        },
        {
          operationId: "op-1",
          selected: true,
          objectType: "person",
          payload: {
            kind: "person",
            title: "Amy Chen",
            description: "Stakeholder",
          },
          selectedProjectId: null,
          targetObjectId: null,
          attachment: null,
        },
      ],
    };

    expect(buildActiveNoteApplyRequestBody("draft-1", input)).toEqual({
      activeNoteId: "draft-1",
      content: "Met with Amy today.",
      projectId: null,
      operations: [
        {
          operationId: "op-0",
          selected: true,
          objectType: "note",
          payload: {
            kind: "note",
            title: "Meeting update",
            content: "Met with Amy today.",
            projectId: "proj-scorecard",
          },
          selectedProjectId: "proj-scorecard",
          projectRef: null,
          duplicateResolution: null,
          targetObjectId: "task-signoff",
          attachment: { type: "task", id: "task-signoff", ref: null },
        },
        {
          operationId: "op-1",
          selected: true,
          objectType: "person",
          payload: {
            kind: "person",
            title: "Amy Chen",
            description: "Stakeholder",
            name: "Amy Chen",
          },
          selectedProjectId: null,
          projectRef: null,
          duplicateResolution: null,
          targetObjectId: null,
          attachment: null,
        },
      ],
    });
  });

  it("coerces empty ID strings to null", () => {
    const body = buildActiveNoteApplyRequestBody("  ", {
      content: "Note",
      projectId: "",
      operations: [
        {
          operationId: "op-1",
          selected: true,
          objectType: "task",
          payload: { kind: "task", title: "A task", projectId: "" },
          selectedProjectId: "",
          projectRef: "",
          targetObjectId: "",
          attachment: { type: "task", id: "", ref: "" },
        },
      ],
    });

    expect(body.activeNoteId).toBeNull();
    expect(body.projectId).toBeNull();
    const operation = (
      body.operations as Array<{
        selectedProjectId: string | null;
        payload: { projectId: string | null };
        attachment: { id: string | null };
      }>
    )[0];
    expect(operation.selectedProjectId).toBeNull();
    expect(operation.payload.projectId).toBeNull();
    expect(operation.attachment.id).toBeNull();
  });
});
