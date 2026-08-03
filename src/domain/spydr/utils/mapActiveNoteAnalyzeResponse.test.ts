import { describe, expect, it } from "vitest";
import type { BackendActiveNoteAnalyzeResponse } from "./activeNoteAnalyzeTypes";
import { mapActiveNoteAnalyzeResponse } from "./mapActiveNoteAnalyzeResponse";

const response: BackendActiveNoteAnalyzeResponse = {
  routing: {
    destination: "existing_project",
    projectId: "proj-muay-thai",
    relatedTaskId: "task-teep",
    reason: "Matches Muay Thai Development",
    confidence: 0.9,
  },
  impact: {
    type: "mixed",
    reason: "Observation with optional follow-up",
  },
  summary: "A sparring observation about teep difficulty.",
  warnings: [],
  candidateProjects: [
    {
      id: "proj-muay-thai",
      title: "Muay Thai Development",
      relevanceReason: "Technique overlap",
    },
  ],
  proposals: [
    {
      ref: "note_1",
      operationType: "attach_context",
      objectType: "note",
      parent: { projectId: "proj-muay-thai", projectRef: null },
      attachment: { type: "task", id: "task-teep", ref: null },
      payload: {
        title: "Difficulty landing teeps against a larger opponent",
        content: "Had problems landing a teep.",
      },
      explicitlyStated: true,
      confidence: 0.95,
      evidence: ["had problems landing a teep"],
      reason: "Project observation",
      requiresProject: true,
      suggestedProjectId: "proj-muay-thai",
    },
    {
      ref: "task_1",
      operationType: "suggest_create",
      objectType: "task",
      parent: { projectId: "proj-muay-thai", projectRef: null },
      attachment: null,
      payload: {
        title: "Practice teep setups against larger opponents",
      },
      explicitlyStated: false,
      confidence: 0.7,
      evidence: ["had problems landing a teep"],
      reason: "Implied drill",
      requiresProject: true,
      suggestedProjectId: "proj-muay-thai",
    },
  ],
};

describe("mapActiveNoteAnalyzeResponse", () => {
  it("maps backend analyze output into UI proposal operations", () => {
    const mapped = mapActiveNoteAnalyzeResponse({
      response,
      content: "Last night I sparred a big guy and had problems landing a teep.",
      projectId: null,
      activeNote: {
        id: "draft-1",
        content: "Last night I sparred a big guy and had problems landing a teep.",
        projectId: null,
        status: "draft",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    expect(mapped.summary).toContain("sparring observation");
    expect(mapped.activeNote.id).toBe("draft-1");
    expect(mapped.activeNote.status).toBe("review");
    expect(mapped.relatedObjects?.[0]?.id).toBe("proj-muay-thai");
    expect(mapped.routing?.destination).toBe("existing_project");
    expect(mapped.impact?.type).toBe("mixed");

    const noteOp = mapped.operations.find((op) => op.objectType === "note");
    expect(noteOp?.selected).toBe(true);
    expect(noteOp?.operationType).toBe("attach_context");
    expect(noteOp?.attachment).toMatchObject({
      type: "task",
      id: "task-teep",
    });
    expect(noteOp?.payload).toMatchObject({
      kind: "note",
      title: "Difficulty landing teeps against a larger opponent",
      projectId: "proj-muay-thai",
    });
    expect(noteOp?.candidateProjects?.[0]?.id).toBe("proj-muay-thai");

    const taskOp = mapped.operations.find((op) => op.objectType === "task");
    expect(taskOp?.selected).toBe(false);
    expect(taskOp?.operationType).toBe("suggest_create");
    expect(mapped.operations.some((op) => op.objectType === "person")).toBe(
      false
    );
  });

  it("assigns distinct selectedProjectIds per segment route", () => {
    const mapped = mapActiveNoteAnalyzeResponse({
      response: {
        routing: {
          destination: "existing_project",
          projectId: null,
          relatedTaskId: null,
          reason: "Multi-project note with 2 contexts: Vital Pak; ABL Automation",
          confidence: 0.84,
        },
        impact: null,
        summary: "Two project contexts.",
        segments: [
          {
            ref: "seg_1",
            text: "Waiting for QuickBooks for Vital Pak",
            subject: "Vital Pak",
          },
          {
            ref: "seg_2",
            text: "ABL Automation has taken a back seat",
            subject: "ABL Automation",
          },
        ],
        routes: [
          {
            segmentRef: "seg_1",
            destination: "existing_project",
            projectId: "proj-vital",
            relatedTaskId: null,
            reason: "Vital Pak",
            confidence: 0.9,
            impact: { type: "project_context", reason: "Status" },
          },
          {
            segmentRef: "seg_2",
            destination: "existing_project",
            projectId: "proj-abl",
            relatedTaskId: null,
            reason: "ABL",
            confidence: 0.88,
            impact: { type: "project_context", reason: "Status" },
          },
        ],
        warnings: [],
        candidateProjects: [
          {
            id: "proj-vital",
            title: "Vital Pak",
            relevanceReason: "Vital Pak",
          },
          {
            id: "proj-abl",
            title: "ABL Automation",
            relevanceReason: "ABL",
          },
        ],
        proposals: [
          {
            ref: "note_1",
            operationType: "create",
            objectType: "note",
            parent: null,
            attachment: null,
            payload: {
              title: "Vital Pak wait",
              content: "Waiting for QuickBooks for Vital Pak",
            },
            explicitlyStated: true,
            confidence: 0.9,
            evidence: ["Vital Pak"],
            reason: "Segment note",
            segmentRef: "seg_1",
            requiresProject: true,
          },
          {
            ref: "note_2",
            operationType: "create",
            objectType: "note",
            parent: null,
            attachment: null,
            payload: {
              title: "ABL deprioritized",
              content: "ABL Automation has taken a back seat",
            },
            explicitlyStated: true,
            confidence: 0.9,
            evidence: ["ABL Automation"],
            reason: "Segment note",
            segmentRef: "seg_2",
            requiresProject: true,
          },
        ],
      },
      content:
        "Waiting for QuickBooks for Vital Pak\n\nABL Automation has taken a back seat",
    });

    expect(mapped.segments).toHaveLength(2);
    expect(mapped.routes).toHaveLength(2);
    expect(mapped.operations.map((op) => op.segmentRef)).toEqual([
      "seg_1",
      "seg_2",
    ]);
    expect(mapped.operations.map((op) => op.selectedProjectId)).toEqual([
      "proj-vital",
      "proj-abl",
    ]);
  });
});
