import type {
  ActiveNoteProposalOperation,
  OperationType,
  ProposalPresentationKind,
  SpydrObjectType,
} from "@/domain/spydr/utils/activeNoteTypes";

export function operationTypeLabel(type: OperationType): string {
  switch (type) {
    case "create":
      return "Create";
    case "update":
      return "Update";
    case "link":
      return "Link";
    case "suggest_create":
      return "Suggest create";
    case "suggest_update":
      return "Suggest update";
    case "attach_context":
      return "Attach context";
    case "no_action":
      return "No action";
    default:
      return "Proposal";
  }
}

export function objectTypeLabel(type?: SpydrObjectType): string {
  if (!type) return "Object";
  switch (type) {
    case "project":
      return "Project";
    case "task":
      return "Task";
    case "note":
      return "Note";
    case "goal":
      return "Goal";
    case "decision":
      return "Decision";
    case "idea":
      return "Idea";
    case "person":
      return "Person";
    case "relationship":
      return "Relationship";
    default:
      return "Object";
  }
}

function objectNoun(type?: SpydrObjectType): string {
  return objectTypeLabel(type).toLowerCase();
}

/**
 * Plain-language action for the card headline — answers "what should I do?"
 */
export function operationActionLabel(
  operation: ActiveNoteProposalOperation
): string {
  const noun = objectNoun(operation.objectType);
  switch (operation.operationType) {
    case "create":
      return `Create ${articleFor(noun)} ${noun}`;
    case "suggest_create":
      return `Suggest creating ${articleFor(noun)} ${noun}`;
    case "attach_context": {
      const target =
        operation.attachment?.type === "task"
          ? "existing task"
          : "existing project";
      return `Attach note to ${target}`;
    }
    case "update":
      return `Update existing ${noun}`;
    case "suggest_update":
      return `Suggest updating ${articleFor(noun)} ${noun}`;
    case "link": {
      const targetType =
        operation.payload.kind === "link"
          ? operation.payload.targetObjectType
          : undefined;
      const targetNoun = objectNoun(targetType ?? operation.objectType);
      return `Link to existing ${targetNoun}`;
    }
    case "no_action":
      return "No changes needed";
    default:
      return "Review suggestion";
  }
}

function articleFor(noun: string): string {
  return /^[aeiou]/i.test(noun) ? "an" : "a";
}

/**
 * One short source cue instead of overlapping Detected/Suggested chips.
 */
export function operationSourceLabel(
  operation: ActiveNoteProposalOperation
): string | null {
  if (operation.operationType === "no_action") return null;
  if (
    operation.operationType === "suggest_create" ||
    operation.operationType === "suggest_update"
  ) {
    return "Inferred — not selected by default";
  }
  if (operation.explicitlyStated) return "From your note";
  if (operation.operationType === "link") return "Matches something you already have";
  return "Inferred from your note";
}

export function presentationKind(
  operation: ActiveNoteProposalOperation
): ProposalPresentationKind {
  if (operation.operationType === "no_action") return "no_action";
  if (operation.warning && !operation.explicitlyStated && operation.confidence < 0.7) {
    return "needs_review";
  }
  if (
    operation.operationType === "suggest_create" ||
    operation.operationType === "suggest_update"
  ) {
    return "suggested";
  }
  if (
    operation.operationType === "link" ||
    (operation.operationType === "update" && operation.targetObjectId)
  ) {
    return "existing_match";
  }
  if (operation.explicitlyStated || operation.operationType === "create") {
    return "detected";
  }
  return "needs_review";
}

export function presentationLabel(kind: ProposalPresentationKind): string {
  switch (kind) {
    case "detected":
      return "Detected";
    case "suggested":
      return "Suggested";
    case "existing_match":
      return "Existing match";
    case "needs_review":
      return "Needs review";
    case "warning":
      return "Warning";
    case "no_action":
      return "No action";
    default:
      return "Proposal";
  }
}

/** Entity / subject name shown under the action headline. */
export function operationTitle(operation: ActiveNoteProposalOperation): string {
  const payload = operation.payload;
  if ("title" in payload && payload.title) return payload.title;
  if (payload.kind === "link") {
    return payload.targetLabel ?? "Existing object";
  }
  if (payload.kind === "no_action") return "Keep this note as written";
  return "Untitled";
}

export function operationDescription(
  operation: ActiveNoteProposalOperation
): string | null {
  const payload = operation.payload;
  if (payload.kind === "note") return payload.content;
  if (payload.kind === "task") return payload.description ?? null;
  if (payload.kind === "project") return payload.description ?? null;
  if (payload.kind === "goal") return payload.description ?? null;
  if (payload.kind === "decision") {
    return payload.description ?? payload.rationale ?? null;
  }
  if (payload.kind === "idea") return payload.description ?? null;
  if (payload.kind === "person") return payload.description ?? null;
  if (payload.kind === "link") {
    const rel = payload.relationshipType.replace(/_/g, " ");
    const target = payload.targetLabel ?? "target";
    const source = payload.sourceLabel;
    return source
      ? `Connect “${source}” to “${target}” (${rel})`
      : `Connect this note to “${target}” (${rel})`;
  }
  if (payload.kind === "no_action") return payload.message;
  return null;
}

/** Compact facts shown on the card so the mutation is scannable. */
export function operationDetailFacts(
  operation: ActiveNoteProposalOperation
): string[] {
  const payload = operation.payload;
  const facts: string[] = [];

  if (payload.kind === "task") {
    if (payload.priority) {
      facts.push(`Priority ${String(payload.priority)}`);
    }
    if (payload.dueDate) {
      facts.push(`Due ${formatFactDate(payload.dueDate)}`);
    }
  }

  if (payload.kind === "project" && payload.status) {
    facts.push(`Status ${payload.status}`);
  }

  if (operation.projectRef) {
    facts.push(`Depends on proposed project`);
  }

  if (operation.attachment?.type === "task" && operation.attachment.id) {
    facts.push("Attached to existing task");
  } else if (
    operation.attachment?.type === "project" &&
    operation.attachment.id
  ) {
    facts.push("Attached to existing project");
  }

  const projectId =
    "projectId" in payload ? payload.projectId : undefined;
  const selectedId = operation.selectedProjectId ?? projectId;
  if (selectedId && !selectedId.startsWith("ref:")) {
    const match = operation.candidateProjects?.find((p) => p.id === selectedId);
    facts.push(match ? `In ${match.title}` : "In a project");
  }

  return facts;
}

function formatFactDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.85) return "High";
  if (confidence >= 0.65) return "Medium";
  return "Low";
}

export function shouldPreselect(operation: ActiveNoteProposalOperation): boolean {
  if (operation.operationType === "no_action") return false;
  if (
    operation.operationType === "suggest_create" ||
    operation.operationType === "suggest_update"
  ) {
    return false;
  }
  if (!operation.explicitlyStated && operation.confidence < 0.75) {
    return false;
  }
  return (
    operation.explicitlyStated ||
    operation.operationType === "create" ||
    operation.operationType === "attach_context" ||
    operation.operationType === "link" ||
    operation.operationType === "update"
  );
}

export function routingDestinationLabel(
  destination: string | null | undefined
): string {
  switch (destination) {
    case "existing_project":
      return "Existing project";
    case "new_project":
      return "New project";
    case "idea_only":
      return "Idea only";
    case "no_action":
      return "No action";
    default:
      return "Routing";
  }
}

/** One review card: a top-level proposal plus nested dependents (e.g. project children). */
export interface ProposalCardGroup {
  root: ActiveNoteProposalOperation;
  children: ActiveNoteProposalOperation[];
}

/**
 * Group operations into one card per highest-level object.
 * Ops with `projectRef` pointing at another op in the list nest under that parent.
 * Orphans (missing parent) remain their own cards. Order follows first appearance.
 */
export function groupProposalOperations(
  operations: ActiveNoteProposalOperation[]
): ProposalCardGroup[] {
  const byId = new Map(operations.map((op) => [op.id, op]));
  const childIds = new Set<string>();
  const childrenByParent = new Map<string, ActiveNoteProposalOperation[]>();

  for (const op of operations) {
    const parentRef = op.projectRef?.trim();
    if (!parentRef || !byId.has(parentRef) || parentRef === op.id) continue;
    childIds.add(op.id);
    const list = childrenByParent.get(parentRef) ?? [];
    list.push(op);
    childrenByParent.set(parentRef, list);
  }

  const groups: ProposalCardGroup[] = [];
  for (const op of operations) {
    if (childIds.has(op.id)) continue;
    groups.push({
      root: op,
      children: childrenByParent.get(op.id) ?? [],
    });
  }
  return groups;
}
