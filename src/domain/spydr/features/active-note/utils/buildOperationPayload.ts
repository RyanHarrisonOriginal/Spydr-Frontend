import type {
  ActiveNoteSegment,
  OperationPayload,
  OperationType,
  SpydrObjectType,
} from "@/domain/spydr/utils/activeNoteTypes";

export function segmentRef(index: number): string {
  return `seg-${index}`;
}

export function defaultTitleFromSegment(segment: Pick<ActiveNoteSegment, "topic" | "sourceText">): string {
  const topic = segment.topic?.trim();
  if (topic) return topic;
  const line = segment.sourceText.trim().split(/\r?\n/)[0]?.trim();
  return line ? line.slice(0, 80) : "Untitled";
}

export function buildPayloadForObjectType(
  objectType: SpydrObjectType,
  segment: Pick<ActiveNoteSegment, "topic" | "sourceText" | "contextualText">,
  projectId: string | null
): OperationPayload {
  const title = defaultTitleFromSegment(segment);
  const body = segment.contextualText?.trim() || segment.sourceText.trim();

  switch (objectType) {
    case "project":
      return {
        kind: "project",
        title,
        description: body,
      };
    case "task":
      return {
        kind: "task",
        title,
        description: body,
        projectId,
      };
    case "note":
      return {
        kind: "note",
        title,
        content: segment.sourceText.trim() || body,
        projectId,
      };
    case "decision":
      return {
        kind: "decision",
        title,
        description: body,
        rationale: body,
        projectId,
      };
    case "idea":
      return {
        kind: "idea",
        title,
        description: body,
        projectId,
      };
    case "goal":
      return {
        kind: "goal",
        title,
        description: body,
        projectId,
      };
    case "person":
      return {
        kind: "person",
        title,
        description: body,
      };
    case "relationship":
      return {
        kind: "link",
        sourceLabel: "This note",
        targetObjectId: projectId ?? "",
        targetObjectType: "project",
        relationshipType: "related_to",
      };
    default:
      return {
        kind: "note",
        title,
        content: segment.sourceText.trim() || body,
        projectId,
      };
  }
}

export function operationTypeForObjectType(
  objectType: SpydrObjectType,
  hasAttachment: boolean
): OperationType {
  if (objectType === "relationship") return "link";
  if (objectType === "note" && hasAttachment) return "attach_context";
  return "create";
}
