import { describe, expect, it } from "vitest";
import type { ActiveNoteProposalOperation } from "@/domain/spydr/utils/activeNoteTypes";
import {
  validateNoteContent,
  validateOperationPayload,
  validateSelectedOperations,
} from "./validateActiveNote";

describe("validateActiveNote", () => {
  it("rejects empty and oversized notes", () => {
    expect(validateNoteContent("   ")).toMatch(/enter a note/i);
    expect(validateNoteContent("x".repeat(8001))).toMatch(/at most/i);
    expect(validateNoteContent("Valid note")).toBeNull();
  });

  it("requires titles and valid dates on task payloads", () => {
    const operation = {
      id: "op-task",
      operationType: "create",
      objectType: "task",
      explicitlyStated: true,
      confidence: 0.9,
      evidence: [],
      status: "proposed",
      selected: true,
      payload: {
        kind: "task",
        title: "",
        dueDate: "not-a-date",
      },
    } as ActiveNoteProposalOperation;

    expect(validateOperationPayload(operation, operation.payload)).toMatch(
      /title/i
    );
    expect(
      validateOperationPayload(operation, {
        kind: "task",
        title: "Practice",
        dueDate: "2026-08-06",
      })
    ).toBeNull();
  });

  it("requires duplicate resolution when a duplicate exists", () => {
    const operations = [
      {
        id: "op-dup",
        operationType: "suggest_create",
        objectType: "task",
        explicitlyStated: false,
        confidence: 0.6,
        evidence: [],
        status: "proposed",
        selected: true,
        duplicateOf: {
          id: "task-1",
          type: "task",
          title: "Existing",
        },
        payload: {
          kind: "task",
          title: "Suggested",
        },
      },
    ] as ActiveNoteProposalOperation[];

    const errors = validateSelectedOperations(operations, [
      {
        operationId: "op-dup",
        selected: true,
        payload: operations[0].payload,
        duplicateResolution: null,
      },
    ]);

    expect(errors["op-dup"]).toMatch(/duplicate/i);
  });

  it("requires the proposed project to be selected when applying nested children", () => {
    const operations = [
      {
        id: "project_1",
        operationType: "suggest_create",
        objectType: "project",
        explicitlyStated: false,
        confidence: 0.8,
        evidence: [],
        status: "proposed",
        selected: false,
        payload: { kind: "project", title: "Improve Active Note Routing" },
      },
      {
        id: "task_1",
        operationType: "create",
        objectType: "task",
        explicitlyStated: true,
        confidence: 0.9,
        evidence: [],
        status: "proposed",
        selected: true,
        projectRef: "project_1",
        payload: { kind: "task", title: "Improve routing" },
      },
    ] as ActiveNoteProposalOperation[];

    const errors = validateSelectedOperations(operations, [
      {
        operationId: "project_1",
        selected: false,
        projectRef: null,
        payload: operations[0].payload,
      },
      {
        operationId: "task_1",
        selected: true,
        projectRef: "project_1",
        payload: operations[1].payload,
      },
    ]);

    expect(errors["task_1"]).toMatch(/accept the proposed project/i);
  });
});
