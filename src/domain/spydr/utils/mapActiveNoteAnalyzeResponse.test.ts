import { describe, expect, it } from "vitest";
import type { BackendActiveNoteAnalyzeResponse } from "./activeNoteAnalyzeTypes";
import { mapActiveNoteAnalyzeResponse } from "./mapActiveNoteAnalyzeResponse";

const response: BackendActiveNoteAnalyzeResponse = {
  segments: [
    {
      topic: "Meeting with Amy",
      sourceText:
        "Met with Amy today about the Commercial Scorecard rollout.",
      contextualText:
        "I met with Amy today about the Commercial Scorecard rollout.",
    },
    {
      topic: "Rep-level trend view",
      sourceText:
        "I need to add a rep-level trend view and validate the quarter-to-date calculations one more time before presenting the final version.",
      contextualText:
        "I need to add a rep-level trend view for the Commercial Scorecard and validate the quarter-to-date calculations one more time before presenting the final version.",
    },
    {
      topic: "Querying Snowflake",
      sourceText:
        "I decided that querying Snowflake directly should remain our preferred fallback whenever the Power BI semantic models become too restrictive.",
      contextualText:
        "I decided that querying Snowflake directly should remain our preferred fallback whenever the Power BI semantic models become too restrictive.",
    },
  ],
  actionPlans: [
    {
      originalText:
        "Met with Amy today about the Commercial Scorecard rollout.",
      projectId: "proj-scorecard",
      projectName: "Commercial Scorecard v2",
      intent: "progress_update",
      topic: "Meeting with Amy",
      contextualText:
        "I met with Amy today about the Commercial Scorecard rollout.",
      action: {
        type: "attach_note_to_task",
        confidence: 0.9,
        reason: "Progress update on sign-off task.",
        targetTaskId: "task-signoff",
        targetTaskTitle: "Present Commercial Scorecard v2 to Amy for final sign off",
        payload: {
          subject: "Meeting update with Amy",
          content:
            "Met with Amy today about the Commercial Scorecard rollout.",
        },
      },
    },
    {
      originalText:
        "I need to add a rep-level trend view and validate the quarter-to-date calculations one more time before presenting the final version.",
      projectId: "proj-scorecard",
      projectName: "Commercial Scorecard v2",
      intent: "task_action",
      topic: "Rep-level trend view",
      contextualText:
        "I need to add a rep-level trend view for the Commercial Scorecard and validate the quarter-to-date calculations one more time before presenting the final version.",
      action: {
        type: "create_task",
        confidence: 0.9,
        reason: "Distinct concrete work not covered by an existing task.",
        payload: {
          title: "Add rep-level trend view and validate QTD calculations",
          description:
            "Add a rep-level trend view and validate the quarter-to-date calculations before presenting the final version.",
        },
      },
    },
    {
      destination: "unassigned",
      originalText:
        "I decided that querying Snowflake directly should remain our preferred fallback whenever the Power BI semantic models become too restrictive.",
      projectId: null,
      projectName: null,
      confidence: 0.65,
      reason: "Lacks sufficient detail to justify a new Project.",
      topic: "Querying Snowflake",
      contextualText:
        "I decided that querying Snowflake directly should remain our preferred fallback whenever the Power BI semantic models become too restrictive.",
    },
  ],
};

describe("mapActiveNoteAnalyzeResponse", () => {
  it("maps segments and action plans into UI proposal operations", () => {
    const mapped = mapActiveNoteAnalyzeResponse({
      response,
      content: "Multi-topic active note",
      projectId: null,
      activeNote: {
        id: "draft-1",
        content: "Multi-topic active note",
        projectId: null,
        status: "draft",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    const segments = mapped.segments ?? [];
    expect(segments).toHaveLength(3);
    expect(segments[0]).toMatchObject({
      ref: "seg-0",
      topic: "Meeting with Amy",
      sourceText: response.segments[0].sourceText,
    });
    expect(mapped.operations).toHaveLength(3);
    expect(mapped.activeNote.status).toBe("review");
    expect(mapped.relatedObjects?.[0]?.id).toBe("proj-scorecard");

    const noteOp = mapped.operations[0];
    expect(noteOp.operationType).toBe("attach_context");
    expect(noteOp.objectType).toBe("note");
    expect(noteOp.selected).toBe(true);
    expect(noteOp.attachment).toMatchObject({
      type: "task",
      id: "task-signoff",
    });
    expect(noteOp.targetTaskTitle).toBe(
      "Present Commercial Scorecard v2 to Amy for final sign off"
    );
    expect(noteOp.selectedProjectId).toBe("proj-scorecard");

    const taskOp = mapped.operations[1];
    expect(taskOp.operationType).toBe("create");
    expect(taskOp.objectType).toBe("task");
    expect(taskOp.payload).toMatchObject({
      kind: "task",
      title: "Add rep-level trend view and validate QTD calculations",
      projectId: "proj-scorecard",
    });

    const unassignedOp = mapped.operations[2];
    expect(unassignedOp.needsUserDecision).toBe(true);
    expect(unassignedOp.selected).toBe(false);
    expect(unassignedOp.objectType).toBe("idea");
    expect(unassignedOp.routingDestination).toBe("unassigned");
  });

  it("maps new project candidates to project create operations", () => {
    const mapped = mapActiveNoteAnalyzeResponse({
      response: {
        segments: [
          {
            topic: "Inventory app",
            sourceText: "Align with the Florida team.",
            contextualText: "We need to align with the Florida team.",
          },
        ],
        actionPlans: [
          {
            destination: "new_project_candidate",
            originalText: "Align with the Florida team.",
            contextualText: "We need to align with the Florida team.",
            topic: "Inventory app",
            projectId: null,
            projectName: "Inventory App Alignment",
            confidence: 0.75,
            reason: "Distinct project effort.",
          },
        ],
      },
      content: "Align with the Florida team.",
    });

    expect(mapped.operations[0]).toMatchObject({
      objectType: "project",
      operationType: "create",
      selected: true,
      routingDestination: "new_project_candidate",
      payload: {
        kind: "project",
        title: "Inventory App Alignment",
      },
    });
  });
});
