import { beforeEach, describe, expect, it } from "vitest";
import {
  mockAnalyzeActiveNote,
  mockApplyActiveNoteProposal,
  mockCreateActiveNote,
  resetActiveNoteMocks,
  selectMockProposalForContent,
} from "./activeNoteMocks";
import type { ActiveNote } from "./activeNoteTypes";

function note(content: string): ActiveNote {
  return {
    id: "active-note-test",
    content,
    projectId: null,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("activeNoteMocks", () => {
  beforeEach(() => {
    resetActiveNoteMocks();
  });

  it("does not propose a person named big guy for the observation note", () => {
    const proposal = selectMockProposalForContent(
      note("Last night I sparred a big guy and had problems landing a teep.")
    );

    expect(
      proposal.operations.some((op) => op.objectType === "person")
    ).toBe(false);
    expect(
      proposal.operations.some((op) => op.operationType === "create" && op.objectType === "project")
    ).toBe(false);
    expect(
      proposal.operations.some(
        (op) =>
          (op.operationType === "create" ||
            op.operationType === "attach_context") &&
          op.objectType === "note"
      )
    ).toBe(true);
    expect(proposal.routing?.destination).toBe("existing_project");
    expect(
      proposal.operations.some(
        (op) => op.operationType === "suggest_create" && op.objectType === "task"
      )
    ).toBe(true);
  });

  it("preselects explicit task and warns about inferred due date", () => {
    const proposal = selectMockProposalForContent(
      note("Practice teep setups before Thursday sparring.")
    );
    const task = proposal.operations.find((op) => op.objectType === "task");
    expect(task?.selected).toBe(true);
    expect(task?.explicitlyStated).toBe(true);
    expect(proposal.warnings.some((w) => /due date/i.test(w))).toBe(true);
  });

  it("proposes a decision without inventing a task", () => {
    const proposal = selectMockProposalForContent(
      note(
        "I decided to use the cross after my switch fake instead of forcing the rear kick."
      )
    );
    expect(
      proposal.operations.some((op) => op.objectType === "decision")
    ).toBe(true);
    expect(
      proposal.operations.some((op) => op.objectType === "task")
    ).toBe(false);
  });

  it("proposes a project for an eight-week program note", () => {
    const proposal = selectMockProposalForContent(
      note(
        "I want to build an eight-week program to make my lead teep reliable against taller opponents."
      )
    );
    expect(proposal.routing?.destination).toBe("new_project");
    expect(
      proposal.operations.some(
        (op) => op.objectType === "project" && op.selected
      )
    ).toBe(true);
    expect(
      proposal.operations.some(
        (op) => op.objectType === "task" && op.projectRef === "project_1"
      )
    ).toBe(true);
  });

  it("applies edited payloads from selected operations", async () => {
    const created = await mockCreateActiveNote({
      content:
        "Last night I sparred a big guy and had problems landing a teep.",
    });
    const proposal = await mockAnalyzeActiveNote(created.id);
    const noteOp = proposal.operations.find((op) => op.objectType === "note");
    expect(noteOp).toBeTruthy();

    const result = await mockApplyActiveNoteProposal(created.id, {
      operations: proposal.operations.map((op) => ({
        operationId: op.id,
        selected: op.id === noteOp!.id,
        payload:
          op.id === noteOp!.id
            ? {
                kind: "note" as const,
                title: "Edited training observation",
                content: noteOp!.payload.kind === "note" ? noteOp!.payload.content : "",
                subtype: "training_observation",
                projectId: "proj-muay-thai",
              }
            : op.payload,
      })),
    });

    expect(result.applied[0]?.title).toBe("Edited training observation");
    expect(result.applied.some((item) => /big guy/i.test(item.title))).toBe(
      false
    );
  });
});
