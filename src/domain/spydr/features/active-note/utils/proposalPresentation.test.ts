import { describe, expect, it } from "vitest";
import type { ActiveNoteProposalOperation } from "@/domain/spydr/utils/activeNoteTypes";
import {
  filterUserFacingWarnings,
  isUserFacingWarning,
} from "@/domain/spydr/utils/activeNoteWarnings";
import {
  groupProposalOperations,
  operationActionLabel,
  operationDescription,
  operationDetailFacts,
  operationSourceLabel,
  operationTypeLabel,
  presentationKind,
  shouldPreselect,
} from "./proposalPresentation";

function makeOp(
  partial: Partial<ActiveNoteProposalOperation> &
    Pick<ActiveNoteProposalOperation, "operationType" | "explicitlyStated">
): ActiveNoteProposalOperation {
  return {
    id: "op-1",
    confidence: 0.9,
    evidence: [],
    status: "proposed",
    selected: false,
    payload: {
      kind: "task",
      title: "Practice teep setups",
    },
    ...partial,
  };
}

describe("proposalPresentation", () => {
  it("maps operation types to user-facing labels without raw AI terms", () => {
    expect(operationTypeLabel("suggest_create")).toBe("Suggest create");
    expect(operationTypeLabel("create")).toBe("Create");
    expect(operationTypeLabel("link")).toBe("Link");
  });

  it("builds a plain-language action headline", () => {
    expect(
      operationActionLabel(
        makeOp({
          operationType: "create",
          explicitlyStated: true,
          objectType: "task",
        })
      )
    ).toBe("Create a task");

    expect(
      operationActionLabel(
        makeOp({
          operationType: "suggest_create",
          explicitlyStated: false,
          objectType: "idea",
        })
      )
    ).toBe("Suggest creating an idea");

    expect(
      operationActionLabel(
        makeOp({
          operationType: "link",
          explicitlyStated: false,
          objectType: "relationship",
          payload: {
            kind: "link",
            targetObjectId: "proj-1",
            targetObjectType: "project",
            targetLabel: "Muay Thai",
            relationshipType: "related_to",
          },
        })
      )
    ).toBe("Link to existing project");
  });

  it("explains link intent in the description", () => {
    expect(
      operationDescription(
        makeOp({
          operationType: "link",
          explicitlyStated: false,
          payload: {
            kind: "link",
            targetObjectId: "proj-1",
            targetLabel: "Muay Thai",
            relationshipType: "related_to",
          },
        })
      )
    ).toBe('Connect this note to “Muay Thai” (related to)');
  });

  it("surfaces task facts for scanning", () => {
    expect(
      operationDetailFacts(
        makeOp({
          operationType: "create",
          explicitlyStated: true,
          objectType: "task",
          selectedProjectId: "p1",
          candidateProjects: [
            { id: "p1", type: "project", title: "Training" },
          ],
          payload: {
            kind: "task",
            title: "Practice teep setups",
            priority: "high",
            dueDate: "2026-08-10",
          },
        })
      )
    ).toEqual(
      expect.arrayContaining([
        "Priority high",
        "In Training",
        expect.stringMatching(/^Due /),
      ])
    );
  });

  it("distinguishes inferred suggestions from explicit note content", () => {
    expect(
      operationSourceLabel(
        makeOp({
          operationType: "create",
          explicitlyStated: true,
          objectType: "task",
        })
      )
    ).toBe("From your note");

    expect(
      operationSourceLabel(
        makeOp({
          operationType: "suggest_create",
          explicitlyStated: false,
          objectType: "task",
        })
      )
    ).toBe("Inferred — not selected by default");
  });

  it("preselects explicit creates and links", () => {
    expect(
      shouldPreselect(
        makeOp({
          operationType: "create",
          explicitlyStated: true,
          objectType: "task",
        })
      )
    ).toBe(true);

    expect(
      shouldPreselect(
        makeOp({
          operationType: "link",
          explicitlyStated: false,
          confidence: 0.84,
          payload: {
            kind: "link",
            targetObjectId: "proj-1",
            relationshipType: "related_to",
          },
        })
      )
    ).toBe(true);
  });

  it("does not preselect suggested operations", () => {
    expect(
      shouldPreselect(
        makeOp({
          operationType: "suggest_create",
          explicitlyStated: false,
          confidence: 0.62,
        })
      )
    ).toBe(false);
  });

  it("labels suggested vs detected presentation", () => {
    expect(
      presentationKind(
        makeOp({
          operationType: "create",
          explicitlyStated: true,
          objectType: "note",
        })
      )
    ).toBe("detected");

    expect(
      presentationKind(
        makeOp({
          operationType: "suggest_create",
          explicitlyStated: false,
          objectType: "task",
        })
      )
    ).toBe("suggested");
  });

  it("hides normalize diagnostics from user-facing warnings", () => {
    expect(
      isUserFacingWarning("Removed invalid project attachment id on note_1")
    ).toBe(false);
    expect(
      isUserFacingWarning("Using stub Active Note AI provider (no OPENAI_API_KEY).")
    ).toBe(false);
    expect(
      isUserFacingWarning("Inferred due date from 'before Thursday sparring'.")
    ).toBe(true);
    expect(
      filterUserFacingWarnings([
        "Removed invalid project attachment id on note_1",
        "Inferred due date from 'before Thursday sparring'.",
      ])
    ).toEqual(["Inferred due date from 'before Thursday sparring'."]);
  });

  it("groups projectRef children under the proposed project card", () => {
    const project = makeOp({
      id: "project_1",
      operationType: "suggest_create",
      explicitlyStated: false,
      objectType: "project",
      payload: { kind: "project", title: "Improve Active Note Routing" },
    });
    const task = makeOp({
      id: "task_1",
      operationType: "create",
      explicitlyStated: true,
      objectType: "task",
      projectRef: "project_1",
      payload: { kind: "task", title: "Improve routing" },
    });
    const person = makeOp({
      id: "person_1",
      operationType: "create",
      explicitlyStated: true,
      objectType: "person",
      payload: { kind: "person", title: "Steve Pinder" },
    });
    const orphan = makeOp({
      id: "task_orphan",
      operationType: "create",
      explicitlyStated: true,
      objectType: "task",
      projectRef: "missing_project",
      payload: { kind: "task", title: "Orphan task" },
    });

    const groups = groupProposalOperations([project, task, person, orphan]);
    expect(groups).toHaveLength(3);
    expect(groups[0]?.root.id).toBe("project_1");
    expect(groups[0]?.children.map((c) => c.id)).toEqual(["task_1"]);
    expect(groups[1]?.root.id).toBe("person_1");
    expect(groups[1]?.children).toEqual([]);
    expect(groups[2]?.root.id).toBe("task_orphan");
  });
});
