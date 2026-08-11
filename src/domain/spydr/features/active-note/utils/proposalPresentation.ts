import type {
  ActiveNoteProposalOperation,
  ActiveNoteSegment,
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

export function shouldShowSuggestionControls(
  operation: ActiveNoteProposalOperation
): boolean {
  if (operation.operationType === "no_action" || operation.status === "rejected") {
    return false;
  }
  if (operation.needsUserDecision) {
    return true;
  }
  return (
    operation.operationType === "create" || operation.operationType === "suggest_create"
  );
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

/** Topic / subject line for the segment this operation came from. */
export function segmentSummary(
  operation: ActiveNoteProposalOperation
): string {
  if (operation.segmentTopic?.trim()) return operation.segmentTopic.trim();
  return operationTitle(operation);
}

/** Original note excerpt for the segment. */
export function segmentContent(
  operation: ActiveNoteProposalOperation
): string | null {
  const text = operation.segmentText?.trim();
  return text || null;
}

function normalizeForCompare(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isDuplicateText(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a?.trim() || !b?.trim()) return false;
  const left = normalizeForCompare(a);
  const right = normalizeForCompare(b);
  return left === right || left.includes(right) || right.includes(left);
}

/** Payload body text — omitted when it repeats the segment excerpt. */
export function operationBodyText(
  operation: ActiveNoteProposalOperation
): string | null {
  const description = operationDescription(operation);
  const content = segmentContent(operation);
  if (!description?.trim()) return null;
  if (content && isDuplicateText(description, content)) return null;
  if (content && isDuplicateText(description, operation.contextualText)) return null;
  return description;
}

/** Facts for the action block, with segment-level duplicates removed. */
export function actionDetailFacts(
  operation: ActiveNoteProposalOperation
): string[] {
  const summary = segmentSummary(operation);
  return operationDetailFacts(operation).filter((fact) => {
    if (isDuplicateText(fact, summary)) return false;
    const content = segmentContent(operation);
    if (content && isDuplicateText(fact, content)) return false;
    return true;
  });
}

/** AI reason — shown once, without repeating evidence quotes. */
export function operationReason(
  operation: ActiveNoteProposalOperation
): string | null {
  const reason = operation.reasoningSummary?.trim();
  if (!reason) return null;
  const content = segmentContent(operation);
  if (content && isDuplicateText(reason, content)) return null;
  return reason;
}

/** Entity / subject name shown under the action headline. */
export function operationTitle(operation: ActiveNoteProposalOperation): string {
  const payload = operation.payload;
  if ("title" in payload && payload.title && payload.title !== "Untitled") {
    return payload.title;
  }
  if (operation.segmentTopic?.trim()) return operation.segmentTopic.trim();
  if (payload.kind === "link") {
    return payload.targetLabel ?? "Existing object";
  }
  if (payload.kind === "no_action") return operation.segmentTopic ?? "Keep as written";
  return "Untitled";
}

export interface OperationRoutingContext {
  projects?: Array<{ id: string; title: string }>;
  tasks?: Array<{ id: string; title: string }>;
}

export interface OperationRoutingSummary {
  project: string | null;
  task: string | null;
}

function resolveProjectLabelById(
  projectId: string | null | undefined,
  operation: ActiveNoteProposalOperation,
  context?: OperationRoutingContext
): string | null {
  if (!projectId?.trim()) return null;
  const id = projectId.trim();
  if (id.startsWith("ref:") || id.startsWith("candidate:")) return null;

  const fromCandidates = operation.candidateProjects?.find((project) => project.id === id);
  if (fromCandidates?.title?.trim()) return fromCandidates.title.trim();

  const fromWorkspace = context?.projects?.find((project) => project.id === id);
  if (fromWorkspace?.title?.trim()) return fromWorkspace.title.trim();

  return null;
}

/** Resolved project routing label for card summaries. */
export function resolveOperationProjectLabel(
  operation: ActiveNoteProposalOperation,
  context?: OperationRoutingContext
): string | null {
  const payload = operation.payload;

  if (payload.kind === "link" && payload.targetObjectType === "project") {
    const target = payload.targetLabel?.trim();
    if (target) return target;
  }

  const payloadProjectId = "projectId" in payload ? payload.projectId : undefined;
  const projectId = operation.selectedProjectId ?? payloadProjectId ?? null;
  const resolvedById = resolveProjectLabelById(projectId, operation, context);
  if (resolvedById) return resolvedById;

  if (operation.candidateProjects?.length === 1) {
    const only = operation.candidateProjects[0]?.title?.trim();
    if (only) return only;
  }

  if (operation.suggestedProjectName?.trim()) {
    return operation.suggestedProjectName.trim();
  }

  if (
    (operation.routingDestination === "new_project" ||
      operation.routingDestination === "new_project_candidate") &&
    payload.kind === "project" &&
    "title" in payload &&
    payload.title?.trim()
  ) {
    return payload.title.trim();
  }

  return null;
}

/** Existing task label when attaching or updating — not for newly created tasks. */
export function resolveOperationTaskLabel(
  operation: ActiveNoteProposalOperation,
  context?: OperationRoutingContext
): string | null {
  if (operation.targetTaskTitle?.trim()) {
    return operation.targetTaskTitle.trim();
  }

  const attachmentTaskId =
    operation.attachment?.type === "task" ? operation.attachment.id : null;
  if (attachmentTaskId) {
    const fromWorkspace = context?.tasks?.find((task) => task.id === attachmentTaskId);
    if (fromWorkspace?.title?.trim()) return fromWorkspace.title.trim();
  }

  if (
    operation.operationType === "update" &&
    operation.payload.kind === "task" &&
    operation.payload.title?.trim()
  ) {
    return operation.payload.title.trim();
  }

  return null;
}

export function operationRoutingSummary(
  operation: ActiveNoteProposalOperation,
  context?: OperationRoutingContext
): OperationRoutingSummary {
  let project = resolveOperationProjectLabel(operation, context);
  const title = operationTitle(operation);

  if (
    project &&
    operation.objectType === "project" &&
    isDuplicateText(project, title)
  ) {
    project = null;
  }

  const usesExistingTask =
    operation.operationType === "attach_context" ||
    operation.operationType === "update" ||
    operation.attachment?.type === "task";

  const task = usesExistingTask
    ? resolveOperationTaskLabel(operation, context)
    : null;

  if (task && isDuplicateText(task, title)) {
    return { project, task: null };
  }

  return { project, task };
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
    const taskLabel = operation.targetTaskTitle ?? "existing task";
    facts.push(`Linked to task: ${taskLabel}`);
  } else if (
    operation.attachment?.type === "project" &&
    operation.attachment.id
  ) {
    facts.push("Attached to existing project");
  }

  const projectId =
    "projectId" in payload ? payload.projectId : undefined;
  const selectedId = operation.selectedProjectId ?? projectId;
  if (selectedId && !selectedId.startsWith("ref:") && !selectedId.startsWith("candidate:")) {
    const match = operation.candidateProjects?.find((p) => p.id === selectedId);
    if (match) {
      facts.push(`In ${match.title}`);
    } else if (operation.suggestedProjectName) {
      facts.push(`In ${operation.suggestedProjectName}`);
    } else {
      facts.push("In a project");
    }
  } else if (
    operation.routingDestination === "new_project_candidate" &&
    operation.suggestedProjectName
  ) {
    facts.push(`New project: ${operation.suggestedProjectName}`);
  }

  if (operation.intent) {
    const label = intentLabel(operation.intent);
    if (label) facts.push(label);
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
    case "new_project_candidate":
      return "New project";
    case "unassigned":
      return "Needs your decision";
    case "idea_only":
      return "Idea only";
    case "no_action":
      return "No action";
    default:
      return "Routing";
  }
}

export function intentLabel(intent: string | null | undefined): string | null {
  if (!intent) return null;
  switch (intent) {
    case "progress_update":
      return "Progress update";
    case "task_action":
      return "Action item";
    case "project_context":
      return "Project context";
    case "decision":
      return "Decision";
    case "idea":
      return "Idea";
    case "mixed":
      return "Mixed";
    default:
      return intent.replace(/_/g, " ");
  }
}

/** One review card: a top-level proposal plus nested dependents (e.g. project children). */
export interface ProposalCardGroup {
  root: ActiveNoteProposalOperation;
  children: ActiveNoteProposalOperation[];
  segmentRef?: string | null;
  segmentSubject?: string | null;
}

function nestByProjectRef(
  operations: ActiveNoteProposalOperation[],
  segmentRef?: string | null,
  segmentSubject?: string | null
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
      segmentRef: segmentRef ?? op.segmentRef ?? null,
      segmentSubject: segmentSubject ?? null,
    });
  }
  return groups;
}

/**
 * Group operations into one card per highest-level object.
 * Multi-segment notes are ordered by segment, then nested by projectRef within each segment.
 * Ops with `projectRef` pointing at another op in the list nest under that parent.
 * Orphans (missing parent) remain their own cards. Order follows first appearance.
 */
export function groupProposalOperations(
  operations: ActiveNoteProposalOperation[],
  segments: ActiveNoteSegment[] = []
): ProposalCardGroup[] {
  const segmentRefs = [
    ...new Set(
      operations
        .map((op) => op.segmentRef?.trim() || "")
        .filter(Boolean)
    ),
  ];
  const multiSegment = segmentRefs.length > 1;
  if (!multiSegment) {
    return nestByProjectRef(operations);
  }

  const subjectByRef = new Map(
    segments.map((segment) => [
      segment.ref,
      segment.topic || segment.subject || segment.ref,
    ])
  );
  const orderedRefs = [
    ...segments.map((segment) => segment.ref).filter((ref) => segmentRefs.includes(ref)),
    ...segmentRefs.filter((ref) => !segments.some((segment) => segment.ref === ref)),
  ];

  const groups: ProposalCardGroup[] = [];
  const used = new Set<string>();

  for (const segmentRef of orderedRefs) {
    const segmentOps = operations.filter(
      (op) => (op.segmentRef?.trim() || "") === segmentRef
    );
    for (const op of segmentOps) used.add(op.id);
    groups.push(
      ...nestByProjectRef(
        segmentOps,
        segmentRef,
        subjectByRef.get(segmentRef) ?? segmentRef
      )
    );
  }

  const unassigned = operations.filter((op) => !used.has(op.id));
  if (unassigned.length > 0) {
    groups.push(...nestByProjectRef(unassigned));
  }

  return groups;
}
