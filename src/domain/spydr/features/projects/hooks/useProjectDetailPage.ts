import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useProjectQuery } from "@/domain/spydr/features/shared/hooks/queries";
import type { SpydrPriority } from "@/domain/spydr/utils/types";
import { useCreateProjectTaskMutation } from "./useCreateProjectTaskMutation";
import { useUpdateProjectMutation } from "./useUpdateProjectMutation";

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

export function useProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const query = useProjectQuery(projectId);
  const project = query.data;
  const updateProject = useUpdateProjectMutation(projectId);
  const createTask = useCreateProjectTaskMutation(projectId);
  const [detailForm, setDetailForm] =
    useState<ProjectDetailFormValues>(emptyDetailForm);
  const [taskForm, setTaskForm] = useState<ProjectTaskFormValues>(emptyTaskForm);

  useEffect(() => {
    if (!project) return;
    setDetailForm({
      body: project.body,
      startDate: project.details?.startDate ?? "",
      targetDate: project.details?.targetDate ?? "",
      riskLevel: (project.details?.riskLevel as SpydrPriority | undefined) ?? "medium",
    });
  }, [project]);

  const stats = useMemo(() => {
    const tasks = project?.tasks ?? [];
    const completed = tasks.filter((task) => task.status === "completed").length;

    return {
      openTasks: tasks.filter((task) => task.status !== "completed").length,
      totalTasks: tasks.length,
      progressPercent: tasks.length
        ? Math.round((completed / tasks.length) * 100)
        : 0,
      decisionCount: project?.decisions.length ?? 0,
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

  const saveDetails = () => {
    updateProject.mutate({
      body: detailForm.body,
      startDate: detailForm.startDate || null,
      targetDate: detailForm.targetDate || null,
      riskLevel: detailForm.riskLevel,
    });
  };

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

  return {
    projectId,
    project,
    stats,
    detailForm,
    taskForm,
    updateDetailField,
    updateTaskField,
    saveDetails,
    addTask,
    canSaveDetails: !updateProject.isPending,
    canAddTask: taskForm.title.trim().length > 0 && !createTask.isPending,
    isSavingDetails: updateProject.isPending,
    isAddingTask: createTask.isPending,
    detailError:
      updateProject.error instanceof Error ? updateProject.error.message : null,
    taskError: createTask.error instanceof Error ? createTask.error.message : null,
    isLoading: query.isLoading,
    isError: query.isError,
    isNotFound:
      query.error instanceof Error && query.error.message === "Project not found",
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load project",
  };
}
