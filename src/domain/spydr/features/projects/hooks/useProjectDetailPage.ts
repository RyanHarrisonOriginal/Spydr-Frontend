import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useProjectQuery } from "@/domain/spydr/features/shared/hooks/queries";
import type { ProjectDetailNode, SpydrPriority } from "@/domain/spydr/utils/types";
import { countTasksByBucket } from "@/domain/spydr/utils/taskStatus";
import { useCreateProjectTaskMutation } from "./useCreateProjectTaskMutation";
import { useCreateProjectNoteMutation } from "./useCreateProjectNoteMutation";
import { useCreateProjectDecisionMutation } from "./useCreateProjectDecisionMutation";
import { useCreateProjectIdeaMutation } from "./useCreateProjectIdeaMutation";
import { useUpdateProjectMutation } from "./useUpdateProjectMutation";
import { useProjectChildMutations } from "./useProjectChildMutations";
import type { ProjectChildKind, UpdateProjectChildInput } from "@/domain/spydr/utils/types";

export interface ProjectDetailFormValues {
  body: string;
  startDate: string;
  targetDate: string;
  riskLevel: SpydrPriority;
}

export interface ProjectTaskFormValues {
  title: string;
  body: string;
  dueDate: string;
  priority: SpydrPriority;
}

export interface ProjectNoteFormValues {
  title: string;
  body: string;
}

export interface ProjectDecisionFormValues {
  title: string;
  rationale: string;
}

export interface ProjectIdeaFormValues {
  title: string;
  body: string;
}

export type ProjectDetailSaveState = "idle" | "pending" | "saving" | "saved" | "error";

const emptyDetailForm: ProjectDetailFormValues = {
  body: "",
  startDate: "",
  targetDate: "",
  riskLevel: "medium",
};

const emptyTaskForm: ProjectTaskFormValues = {
  title: "",
  body: "",
  dueDate: "",
  priority: "medium",
};

const emptyNoteForm: ProjectNoteFormValues = {
  title: "",
  body: "",
};

const emptyDecisionForm: ProjectDecisionFormValues = {
  title: "",
  rationale: "",
};

const emptyIdeaForm: ProjectIdeaFormValues = {
  title: "",
  body: "",
};

const DETAIL_SAVE_DEBOUNCE_MS = 700;

function projectToDetailForm(project: ProjectDetailNode): ProjectDetailFormValues {
  return {
    body: project.body,
    startDate: project.details?.startDate ?? "",
    targetDate: project.details?.targetDate ?? "",
    riskLevel: (project.details?.riskLevel as SpydrPriority | undefined) ?? "medium",
  };
}

function serializeDetailForm(form: ProjectDetailFormValues) {
  return JSON.stringify(form);
}

export function useProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const query = useProjectQuery(projectId);
  const project = query.data;
  const updateProject = useUpdateProjectMutation(projectId);
  const createTask = useCreateProjectTaskMutation(projectId);
  const createNote = useCreateProjectNoteMutation(projectId);
  const createDecision = useCreateProjectDecisionMutation(projectId);
  const createIdea = useCreateProjectIdeaMutation(projectId);
  const childMutations = useProjectChildMutations(projectId);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [detailForm, setDetailForm] =
    useState<ProjectDetailFormValues>(emptyDetailForm);
  const [taskForm, setTaskForm] = useState<ProjectTaskFormValues>(emptyTaskForm);
  const [noteForm, setNoteForm] = useState<ProjectNoteFormValues>(emptyNoteForm);
  const [decisionForm, setDecisionForm] =
    useState<ProjectDecisionFormValues>(emptyDecisionForm);
  const [ideaForm, setIdeaForm] = useState<ProjectIdeaFormValues>(emptyIdeaForm);
  const [detailSaveState, setDetailSaveState] =
    useState<ProjectDetailSaveState>("idle");
  const detailHydratedRef = useRef(false);
  const detailSaveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    detailHydratedRef.current = false;
    setDetailSaveState("idle");
  }, [projectId]);

  useEffect(() => {
    if (!project) return;
    setDetailForm(projectToDetailForm(project));
    detailHydratedRef.current = true;
  }, [project?.id]);

  useEffect(() => {
    if (!project || !detailHydratedRef.current) return;

    const fromServer = projectToDetailForm(project);
    if (serializeDetailForm(detailForm) === serializeDetailForm(fromServer)) {
      return;
    }

    setDetailSaveState("pending");
    clearTimeout(detailSaveTimerRef.current);

    detailSaveTimerRef.current = setTimeout(() => {
      setDetailSaveState("saving");
      updateProject.mutate(
        {
          body: detailForm.body,
          startDate: detailForm.startDate || null,
          targetDate: detailForm.targetDate || null,
          riskLevel: detailForm.riskLevel,
        },
        {
          onSuccess: () => setDetailSaveState("saved"),
          onError: () => setDetailSaveState("error"),
        }
      );
    }, DETAIL_SAVE_DEBOUNCE_MS);

    return () => clearTimeout(detailSaveTimerRef.current);
  }, [detailForm, project, updateProject.mutate]);

  const stats = useMemo(() => {
    const tasks = project?.tasks ?? [];
    const taskBuckets = countTasksByBucket(tasks);
    const closedTasks = taskBuckets.closed;

    return {
      connected: {
        tasks: {
          total: tasks.length,
          ...taskBuckets,
        },
        decisions: project?.decisions.length ?? 0,
        notes: project?.notes.length ?? 0,
        ideas: project?.ideas.length ?? 0,
        resources: project?.resources.length ?? 0,
      },
      progressPercent: tasks.length
        ? Math.round((closedTasks / tasks.length) * 100)
        : 0,
      openTaskCount: taskBuckets.open,
    };
  }, [project]);

  const updateDetailField = <TField extends keyof ProjectDetailFormValues>(
    field: TField,
    value: ProjectDetailFormValues[TField]
  ) => setDetailForm((current) => ({ ...current, [field]: value }));

  const updateTaskField = <TField extends keyof ProjectTaskFormValues>(
    field: TField,
    value: ProjectTaskFormValues[TField]
  ) => setTaskForm((current) => ({ ...current, [field]: value }));

  const updateNoteField = <TField extends keyof ProjectNoteFormValues>(
    field: TField,
    value: ProjectNoteFormValues[TField]
  ) => setNoteForm((current) => ({ ...current, [field]: value }));

  const updateDecisionField = <TField extends keyof ProjectDecisionFormValues>(
    field: TField,
    value: ProjectDecisionFormValues[TField]
  ) => setDecisionForm((current) => ({ ...current, [field]: value }));

  const updateIdeaField = <TField extends keyof ProjectIdeaFormValues>(
    field: TField,
    value: ProjectIdeaFormValues[TField]
  ) => setIdeaForm((current) => ({ ...current, [field]: value }));

  const addTask = () => {
    if (!taskForm.title.trim()) return;

    createTask.mutate(
      {
        title: taskForm.title.trim(),
        body: taskForm.body.trim(),
        dueDate: taskForm.dueDate || null,
        priority: taskForm.priority,
        status: "active",
      },
      {
        onSuccess: () => setTaskForm(emptyTaskForm),
      }
    );
  };

  const addNote = () => {
    if (!noteForm.title.trim()) return;

    createNote.mutate(
      {
        title: noteForm.title.trim(),
        body: noteForm.body.trim() || undefined,
        status: "active",
      },
      {
        onSuccess: () => setNoteForm(emptyNoteForm),
      }
    );
  };

  const addDecision = () => {
    if (!decisionForm.title.trim()) return;

    createDecision.mutate(
      {
        title: decisionForm.title.trim(),
        rationale: decisionForm.rationale.trim() || undefined,
        status: "active",
      },
      {
        onSuccess: () => setDecisionForm(emptyDecisionForm),
      }
    );
  };

  const addIdea = () => {
    if (!ideaForm.title.trim()) return;

    createIdea.mutate(
      {
        title: ideaForm.title.trim(),
        body: ideaForm.body.trim() || undefined,
        status: "active",
      },
      {
        onSuccess: () => setIdeaForm(emptyIdeaForm),
      }
    );
  };

  const updateChild = (kind: ProjectChildKind, childId: string, input: UpdateProjectChildInput) => {
    childMutations.updateChild.mutate({ kind, childId, input });
  };

  const deleteChild = (kind: ProjectChildKind, childId: string) => {
    childMutations.deleteChild.mutate({ kind, childId });
  };

  const restoreChild = (kind: ProjectChildKind, childId: string) => {
    setRestoringId(childId);
    childMutations.restoreChild.mutate(
      { kind, childId },
      { onSettled: () => setRestoringId(null) }
    );
  };

  const deleted = project?.deleted ?? {
    tasks: [],
    decisions: [],
    ideas: [],
    notes: [],
    resources: [],
  };

  return {
    projectId,
    project,
    deleted,
    stats,
    detailForm,
    detailSaveState,
    taskForm,
    noteForm,
    decisionForm,
    ideaForm,
    updateDetailField,
    updateTaskField,
    updateNoteField,
    updateDecisionField,
    updateIdeaField,
    addTask,
    addNote,
    addDecision,
    addIdea,
    updateChild,
    deleteChild,
    restoreChild,
    isUpdatingChild: childMutations.updateChild.isPending,
    isDeletingChild: childMutations.deleteChild.isPending,
    isRestoringChild: childMutations.restoreChild.isPending,
    restoringId,
    childMutationError:
      childMutations.updateChild.error instanceof Error
        ? childMutations.updateChild.error.message
        : childMutations.deleteChild.error instanceof Error
          ? childMutations.deleteChild.error.message
          : childMutations.restoreChild.error instanceof Error
            ? childMutations.restoreChild.error.message
            : null,
    canAddTask: taskForm.title.trim().length > 0 && !createTask.isPending,
    canAddNote: noteForm.title.trim().length > 0 && !createNote.isPending,
    canAddDecision:
      decisionForm.title.trim().length > 0 && !createDecision.isPending,
    canAddIdea: ideaForm.title.trim().length > 0 && !createIdea.isPending,
    isAddingTask: createTask.isPending,
    isAddingNote: createNote.isPending,
    isAddingDecision: createDecision.isPending,
    isAddingIdea: createIdea.isPending,
    detailError:
      updateProject.error instanceof Error ? updateProject.error.message : null,
    taskError: createTask.error instanceof Error ? createTask.error.message : null,
    noteError: createNote.error instanceof Error ? createNote.error.message : null,
    decisionError:
      createDecision.error instanceof Error ? createDecision.error.message : null,
    ideaError: createIdea.error instanceof Error ? createIdea.error.message : null,
    isLoading: query.isLoading,
    isError: query.isError,
    isNotFound:
      query.error instanceof Error && query.error.message === "Project not found",
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load project",
  };
}
