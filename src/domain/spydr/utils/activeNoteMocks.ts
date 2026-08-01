import type {
  ActiveNote,
  ActiveNoteProposal,
  ActiveNoteProposalOperation,
  ApplyActiveNoteProposalInput,
  ApplyActiveNoteProposalResult,
  AppliedActiveNoteObject,
  CreateActiveNoteInput,
  OperationPayload,
  UpdateActiveNoteInput,
} from "./activeNoteTypes";
import { objectHref } from "./activeNoteRouting";

const MOCK_DELAY_MS =
  typeof process !== "undefined" && process.env.VITEST ? 5 : 450;

const MOCK_PROJECTS = {
  muayThai: {
    id: "proj-muay-thai",
    type: "project" as const,
    title: "Muay Thai Development",
    relevanceReason: "Note mentions sparring and teep technique",
  },
  competition: {
    id: "proj-competition",
    type: "project" as const,
    title: "Competition Preparation",
    relevanceReason: "Possible training-cycle context",
  },
};

const MOCK_EXISTING_TASK = {
  id: "task-teep-thursday",
  type: "task" as const,
  title: "Practice teep setups before Thursday sparring",
  relevanceReason: "Overlaps with suggested teep practice",
};

const MOCK_GOAL = {
  id: "goal-lead-teep",
  type: "goal" as const,
  title: "Lead Teep Goal",
  relevanceReason: "Related technical objective",
};

let noteSeq = 1;
const notes = new Map<string, ActiveNote>();
const proposals = new Map<string, ActiveNoteProposal>();
const applyResults = new Map<string, ApplyActiveNoteProposalResult>();

function now() {
  return new Date().toISOString();
}

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeContent(content: string) {
  return content.trim().toLowerCase();
}

function op(
  partial: Omit<ActiveNoteProposalOperation, "status" | "selected"> & {
    selected?: boolean;
    status?: ActiveNoteProposalOperation["status"];
  }
): ActiveNoteProposalOperation {
  const selected =
    partial.selected ??
    (partial.explicitlyStated ||
      partial.operationType === "create" ||
      partial.operationType === "attach_context" ||
      partial.operationType === "link" ||
      partial.operationType === "update");

  return {
    ...partial,
    status: partial.status ?? "proposed",
    selected,
  };
}

function buildObservationProposal(activeNote: ActiveNote): ActiveNoteProposal {
  return {
    activeNote,
    summary:
      "Routed a sparring observation to Muay Thai Development, with optional follow-up practice.",
    routing: {
      destination: "existing_project",
      projectId: MOCK_PROJECTS.muayThai.id,
      relatedTaskId: MOCK_EXISTING_TASK.id,
      reason: "Matches existing training project and teep practice context",
      confidence: 0.9,
    },
    impact: {
      type: "mixed",
      reason: "Task context plus optional new drill",
    },
    warnings: [],
    relatedObjects: [MOCK_PROJECTS.muayThai, MOCK_EXISTING_TASK, MOCK_GOAL],
    operations: [
      op({
        id: "op-note-observation",
        operationType: "attach_context",
        objectType: "note",
        explicitlyStated: true,
        confidence: 0.91,
        evidence: [
          "sparred a big guy",
          "problems landing a teep",
        ],
        reasoningSummary: "Direct training observation from the note.",
        attachment: {
          type: "task",
          id: MOCK_EXISTING_TASK.id,
          ref: null,
        },
        payload: {
          kind: "note",
          title: "Difficulty landing teeps against larger opponents",
          content:
            "Last night I sparred a big guy and had problems landing a teep.",
          subtype: "training_observation",
          projectId: MOCK_PROJECTS.muayThai.id,
        },
        selected: true,
        selectedProjectId: MOCK_PROJECTS.muayThai.id,
        targetObjectId: MOCK_EXISTING_TASK.id,
      }),
      op({
        id: "op-link-muay-thai",
        operationType: "link",
        objectType: "relationship",
        targetObjectId: MOCK_PROJECTS.muayThai.id,
        relationshipType: "related_to",
        explicitlyStated: false,
        confidence: 0.84,
        evidence: ["sparred", "teep"],
        reasoningSummary: "Strong match to existing Muay Thai project.",
        payload: {
          kind: "link",
          sourceLabel: "This note",
          targetObjectId: MOCK_PROJECTS.muayThai.id,
          targetLabel: MOCK_PROJECTS.muayThai.title,
          targetObjectType: "project",
          relationshipType: "related_to",
        },
        selected: true,
        candidateProjects: [MOCK_PROJECTS.muayThai, MOCK_PROJECTS.competition],
        selectedProjectId: MOCK_PROJECTS.muayThai.id,
      }),
      op({
        id: "op-suggest-task",
        operationType: "suggest_create",
        objectType: "task",
        explicitlyStated: false,
        confidence: 0.62,
        evidence: ["problems landing a teep"],
        reasoningSummary: "Optional follow-up practice inferred from the observation.",
        warning: "Suggested from implied action — not explicitly requested.",
        payload: {
          kind: "task",
          title: "Practice teep setups against larger opponents",
          description:
            "Drill teep setups and distance management against taller or heavier partners.",
          priority: "medium",
          dueDate: null,
          projectId: MOCK_PROJECTS.muayThai.id,
        },
        selected: false,
        selectedProjectId: MOCK_PROJECTS.muayThai.id,
        duplicateOf: MOCK_EXISTING_TASK,
        duplicateResolution: null,
      }),
    ],
  };
}

function buildExplicitTaskProposal(activeNote: ActiveNote): ActiveNoteProposal {
  return {
    activeNote,
    summary:
      "Routed an explicit practice task under Muay Thai Development.",
    routing: {
      destination: "existing_project",
      projectId: MOCK_PROJECTS.muayThai.id,
      relatedTaskId: null,
      reason: "Explicit practice action under the selected project",
      confidence: 0.94,
    },
    impact: {
      type: "new_task",
      reason: "Concrete next-step action stated in the note",
    },
    warnings: ["Inferred due date from 'before Thursday sparring'."],
    relatedObjects: [MOCK_PROJECTS.muayThai],
    operations: [
      op({
        id: "op-task-explicit",
        operationType: "create",
        objectType: "task",
        explicitlyStated: true,
        confidence: 0.94,
        evidence: ["Practice teep setups before Thursday sparring"],
        reasoningSummary: "Explicit task stated in the note.",
        warning: "Due date inferred — confirm before applying.",
        selectedProjectId: MOCK_PROJECTS.muayThai.id,
        payload: {
          kind: "task",
          title: "Practice teep setups before Thursday sparring",
          description: "Prepare teep setups ahead of Thursday sparring.",
          priority: "high",
          dueDate: nextThursdayIso(),
          projectId: MOCK_PROJECTS.muayThai.id,
        },
        selected: true,
      }),
      op({
        id: "op-link-task-project",
        operationType: "link",
        objectType: "relationship",
        targetObjectId: MOCK_PROJECTS.muayThai.id,
        relationshipType: "belongs_to",
        explicitlyStated: false,
        confidence: 0.8,
        evidence: ["teep", "sparring"],
        payload: {
          kind: "link",
          sourceLabel: "Practice task",
          targetObjectId: MOCK_PROJECTS.muayThai.id,
          targetLabel: MOCK_PROJECTS.muayThai.title,
          targetObjectType: "project",
          relationshipType: "belongs_to",
        },
        selected: true,
        candidateProjects: [MOCK_PROJECTS.muayThai, MOCK_PROJECTS.competition],
        selectedProjectId: MOCK_PROJECTS.muayThai.id,
      }),
    ],
  };
}

function buildDecisionProposal(activeNote: ActiveNote): ActiveNoteProposal {
  return {
    activeNote,
    summary:
      "Routed a training decision under Muay Thai Development.",
    routing: {
      destination: "existing_project",
      projectId: MOCK_PROJECTS.muayThai.id,
      relatedTaskId: null,
      reason: "Committed choice affecting project execution",
      confidence: 0.9,
    },
    impact: {
      type: "decision",
      reason: "User stated a decided approach",
    },
    warnings: [],
    relatedObjects: [MOCK_PROJECTS.muayThai],
    operations: [
      op({
        id: "op-decision",
        operationType: "create",
        objectType: "decision",
        explicitlyStated: true,
        confidence: 0.9,
        evidence: [
          "I decided to use the cross after my switch fake",
          "instead of forcing the rear kick",
        ],
        selectedProjectId: MOCK_PROJECTS.muayThai.id,
        payload: {
          kind: "decision",
          title: "Prefer cross after switch fake over rear kick",
          description:
            "Use the cross after the switch fake instead of forcing the rear kick.",
          rationale:
            "Improves reliability versus forcing a rear kick in the same setup.",
          projectId: MOCK_PROJECTS.muayThai.id,
        },
        selected: true,
      }),
      op({
        id: "op-link-decision-project",
        operationType: "link",
        objectType: "relationship",
        targetObjectId: MOCK_PROJECTS.muayThai.id,
        relationshipType: "related_to",
        explicitlyStated: false,
        confidence: 0.78,
        evidence: ["cross", "switch fake", "rear kick"],
        payload: {
          kind: "link",
          sourceLabel: "Decision",
          targetObjectId: MOCK_PROJECTS.muayThai.id,
          targetLabel: MOCK_PROJECTS.muayThai.title,
          targetObjectType: "project",
          relationshipType: "related_to",
        },
        selected: true,
        selectedProjectId: MOCK_PROJECTS.muayThai.id,
        candidateProjects: [MOCK_PROJECTS.muayThai],
      }),
    ],
  };
}

function buildNewProjectProposal(activeNote: ActiveNote): ActiveNoteProposal {
  return {
    activeNote,
    summary:
      "Cohesive new project plan for an eight-week lead-teep reliability program.",
    routing: {
      destination: "new_project",
      projectId: null,
      relatedTaskId: null,
      reason:
        "Distinct multi-step execution effort not covered by existing projects",
      confidence: 0.9,
    },
    impact: null,
    warnings: [],
    relatedObjects: [],
    operations: [
      op({
        id: "project_1",
        operationType: "suggest_create",
        objectType: "project",
        explicitlyStated: true,
        confidence: 0.88,
        evidence: [
          "eight-week program",
          "lead teep reliable against taller opponents",
        ],
        reasoningSummary: "Durable multi-step training outcome",
        payload: {
          kind: "project",
          title: "Eight-week lead teep reliability program",
          description:
            "Build an eight-week program to make the lead teep reliable against taller opponents.",
          status: "active",
        },
        selected: true,
      }),
      op({
        id: "task_1",
        operationType: "suggest_create",
        objectType: "task",
        explicitlyStated: true,
        confidence: 0.8,
        evidence: ["eight-week program"],
        projectRef: "project_1",
        reasoningSummary: "Directly supported initial work",
        payload: {
          kind: "task",
          title: "Draft week-one teep distance drills",
          description:
            "Outline the first week of drills for lead teep setups and distance.",
          priority: "medium",
          dueDate: null,
        },
        selected: true,
      }),
    ],
  };
}

function buildNoActionProposal(activeNote: ActiveNote): ActiveNoteProposal {
  return {
    activeNote,
    summary: "No useful Spydr change detected from this note.",
    routing: {
      destination: "no_action",
      projectId: null,
      relatedTaskId: null,
      reason: "No useful execution change detected",
      confidence: 0.8,
    },
    impact: null,
    warnings: [],
    relatedObjects: [],
    operations: [
      op({
        id: "op-no-action",
        operationType: "no_action",
        explicitlyStated: false,
        confidence: 0.55,
        evidence: [],
        selected: false,
        payload: {
          kind: "no_action",
          message:
            "This note can remain as written without creating additional tasks, projects, or relationships.",
        },
      }),
    ],
  };
}

function nextThursdayIso() {
  const date = new Date();
  const day = date.getDay();
  const daysUntilThursday = (4 - day + 7) % 7 || 7;
  date.setDate(date.getDate() + daysUntilThursday);
  return date.toISOString().slice(0, 10);
}

export function selectMockProposalForContent(
  activeNote: ActiveNote
): ActiveNoteProposal {
  const content = normalizeContent(activeNote.content);

  if (
    content.includes("sparred a big guy") ||
    content.includes("problems landing a teep")
  ) {
    return buildObservationProposal(activeNote);
  }

  if (content.includes("practice teep setups before thursday")) {
    return buildExplicitTaskProposal(activeNote);
  }

  if (
    content.includes("i decided") ||
    content.includes("switch fake") ||
    content.includes("rear kick")
  ) {
    return buildDecisionProposal(activeNote);
  }

  if (
    content.includes("eight-week") ||
    content.includes("eight week") ||
    (content.includes("program") && content.includes("lead teep"))
  ) {
    return buildNewProjectProposal(activeNote);
  }

  return buildNoActionProposal(activeNote);
}

export async function mockCreateActiveNote(
  input: CreateActiveNoteInput
): Promise<ActiveNote> {
  await delay();
  const timestamp = now();
  const note: ActiveNote = {
    id: `active-note-${noteSeq++}`,
    content: input.content,
    projectId: input.projectId ?? null,
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  notes.set(note.id, note);
  return clone(note);
}

export async function mockUpdateActiveNote(
  activeNoteId: string,
  input: UpdateActiveNoteInput
): Promise<ActiveNote> {
  await delay(200);
  const existing = notes.get(activeNoteId);
  if (!existing) {
    throw new Error("Active note not found");
  }
  const updated: ActiveNote = {
    ...existing,
    content: input.content ?? existing.content,
    projectId:
      input.projectId !== undefined ? input.projectId : existing.projectId,
    updatedAt: now(),
  };
  notes.set(activeNoteId, updated);
  return clone(updated);
}

export async function mockAnalyzeActiveNote(
  activeNoteId: string
): Promise<ActiveNoteProposal> {
  await delay(900);
  const note = notes.get(activeNoteId);
  if (!note) {
    throw new Error("Active note not found");
  }

  const analyzing: ActiveNote = {
    ...note,
    status: "analyzing",
    updatedAt: now(),
  };
  notes.set(activeNoteId, analyzing);

  const proposal = selectMockProposalForContent(analyzing);
  const reviewNote: ActiveNote = {
    ...analyzing,
    status: "review",
    updatedAt: now(),
  };
  proposal.activeNote = reviewNote;
  notes.set(activeNoteId, reviewNote);
  proposals.set(activeNoteId, proposal);
  return clone(proposal);
}

export async function mockGetActiveNoteProposal(
  activeNoteId: string
): Promise<ActiveNoteProposal> {
  await delay(200);
  const proposal = proposals.get(activeNoteId);
  if (!proposal) {
    throw new Error("Proposal not found");
  }
  return clone(proposal);
}

function payloadTitle(payload: OperationPayload): string {
  if ("title" in payload && typeof payload.title === "string") {
    return payload.title;
  }
  if (payload.kind === "link") {
    return payload.targetLabel ?? "Linked object";
  }
  if (payload.kind === "no_action") {
    return "No action";
  }
  return "Untitled";
}

export async function mockApplyActiveNoteProposal(
  activeNoteId: string,
  input: ApplyActiveNoteProposalInput
): Promise<ApplyActiveNoteProposalResult> {
  await delay(700);
  const note = notes.get(activeNoteId);
  const proposal = proposals.get(activeNoteId);
  if (!note || !proposal) {
    throw new Error("Active note proposal not found");
  }

  const selected = input.operations.filter((item) => item.selected);
  if (selected.length === 0) {
    throw new Error("Select at least one operation to apply");
  }

  const applied: AppliedActiveNoteObject[] = [];
  const failed: ApplyActiveNoteProposalResult["failed"] = [];

  for (const item of selected) {
    const operation = proposal.operations.find((opItem) => opItem.id === item.operationId);
    if (!operation) {
      failed.push({
        operationId: item.operationId,
        message: "Operation no longer available",
      });
      continue;
    }

    if (item.duplicateResolution === "ignore") {
      continue;
    }

    const payload = item.payload ?? operation.payload;
    if (payload.kind === "no_action") {
      continue;
    }

    if (
      item.duplicateResolution === "attach_existing" &&
      operation.duplicateOf
    ) {
      applied.push({
        id: operation.duplicateOf.id,
        type: operation.duplicateOf.type,
        title: operation.duplicateOf.title,
        action: "updated",
        href: objectHref(operation.duplicateOf.type, operation.duplicateOf.id),
      });
      continue;
    }

    if (payload.kind === "link") {
      const targetId = item.selectedProjectId ?? payload.targetObjectId;
      const targetType = payload.targetObjectType ?? "project";
      const title =
        payload.targetLabel ??
        proposal.relatedObjects?.find((obj) => obj.id === targetId)?.title ??
        "Linked object";
      applied.push({
        id: targetId,
        type: targetType,
        title,
        action: "linked",
        href: objectHref(targetType, targetId),
      });
      continue;
    }

    const id = `created-${item.operationId}`;
    const type = operation.objectType ?? "note";
    applied.push({
      id,
      type,
      title: payloadTitle(payload),
      action: operation.operationType === "update" ? "updated" : "created",
      href: objectHref(type, id),
    });
  }

  const completedNote: ActiveNote = {
    ...note,
    status: failed.length > 0 && applied.length === 0 ? "failed" : "completed",
    updatedAt: now(),
  };
  notes.set(activeNoteId, completedNote);

  const result: ApplyActiveNoteProposalResult = {
    activeNote: completedNote,
    applied,
    failed,
    partial: failed.length > 0 && applied.length > 0,
  };
  applyResults.set(activeNoteId, result);
  return clone(result);
}

/** Test helper — resets in-memory mock store. */
export function resetActiveNoteMocks() {
  noteSeq = 1;
  notes.clear();
  proposals.clear();
  applyResults.clear();
}
