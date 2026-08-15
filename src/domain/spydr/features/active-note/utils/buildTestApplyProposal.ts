import type { ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import type {
  ActiveNote,
  ActiveNoteProposal,
  ActiveNoteProposalOperation,
} from "@/domain/spydr/utils/activeNoteTypes";

const TEST_NOTE_CONTENT =
  "Test apply: add a follow-up task, capture a note, and attach progress to an existing task.";

export function buildTestApplyProposal(input: {
  projects: ProjectNode[];
  tasks: TaskNode[];
  preferredProjectId?: string | null;
  content?: string;
}): ActiveNoteProposal {
  const timestamp = new Date().toISOString();
  const content = input.content?.trim() || TEST_NOTE_CONTENT;
  const project =
    input.projects.find((item) => item.id === input.preferredProjectId) ??
    input.projects[0] ??
    null;
  const task =
    input.tasks.find((item) => item.project?.id === project?.id) ??
    input.tasks[0] ??
    null;

  const activeNote: ActiveNote = {
    id: crypto.randomUUID(),
    content,
    projectId: project?.id ?? input.preferredProjectId ?? null,
    status: "review",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const operations: ActiveNoteProposalOperation[] = [];

  if (project) {
    operations.push({
      id: "test-op-task",
      operationType: "create",
      objectType: "task",
      payload: {
        kind: "task",
        title: "Test apply task",
        description: "Created from Active Note test suggestions.",
        projectId: project.id,
      },
      confidence: 1,
      evidence: [content],
      reasoningSummary: "Test create-task apply path.",
      explicitlyStated: true,
      status: "proposed",
      selected: true,
      selectedProjectId: project.id,
      segmentTopic: "Test task",
      segmentText: content,
      contextualText: content,
      routingDestination: "existing_project",
      suggestedProjectName: project.title,
      candidateProjects: [
        { id: project.id, type: "project", title: project.title },
      ],
    });

    operations.push({
      id: "test-op-note",
      operationType: "create",
      objectType: "note",
      payload: {
        kind: "note",
        title: "Test apply note",
        content: "Created from Active Note test suggestions.",
        projectId: project.id,
      },
      confidence: 1,
      evidence: [content],
      reasoningSummary: "Test create-note apply path.",
      explicitlyStated: true,
      status: "proposed",
      selected: true,
      selectedProjectId: project.id,
      segmentTopic: "Test note",
      segmentText: content,
      contextualText: content,
      routingDestination: "existing_project",
      suggestedProjectName: project.title,
    });

    if (task) {
      operations.push({
        id: "test-op-attach",
        operationType: "attach_context",
        objectType: "note",
        targetObjectId: task.id,
        attachment: { type: "task", id: task.id, ref: null },
        payload: {
          kind: "note",
          title: task.title,
          content: "Progress captured from Active Note test suggestions.",
          projectId: project.id,
        },
        confidence: 1,
        evidence: [content],
        reasoningSummary: "Test attach-note-to-task apply path.",
        explicitlyStated: true,
        status: "proposed",
        selected: true,
        selectedProjectId: project.id,
        segmentTopic: "Test attach",
        segmentText: content,
        contextualText: content,
        routingDestination: "existing_project",
        suggestedProjectName: project.title,
        targetTaskTitle: task.title,
      });
    }
  }

  operations.push({
    id: "test-op-project",
    operationType: "create",
    objectType: "project",
    payload: {
      kind: "project",
      title: "Test apply project",
      description: "Created from Active Note test suggestions.",
    },
    confidence: 0.8,
    evidence: [content],
    reasoningSummary: "Test create-project apply path.",
    explicitlyStated: false,
    status: "proposed",
    selected: true,
    selectedProjectId: null,
    segmentTopic: "Test project",
    segmentText: content,
    contextualText: content,
    routingDestination: "new_project_candidate",
    suggestedProjectName: "Test apply project",
  });

  return {
    activeNote,
    summary: project
      ? "Test suggestions loaded so you can apply without analyzing."
      : "No existing project found — this will create a test project.",
    routing: null,
    impact: null,
    segments: [
      {
        ref: "seg-0",
        topic: "Test apply",
        sourceText: content,
        contextualText: content,
        subject: "Test apply",
        text: content,
      },
    ],
    routes: [],
    operations,
    warnings: project
      ? []
      : ["No existing project was found. Apply will create a new test project."],
    relatedObjects: project
      ? [{ id: project.id, type: "project", title: project.title }]
      : [],
  };
}
