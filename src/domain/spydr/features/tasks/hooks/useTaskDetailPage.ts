import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useProjectsQuery,
  useTaskQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { isProjectPriority } from "@/domain/spydr/utils/projectPriority";
import { isTaskStatus } from "@/domain/spydr/utils/taskStatus";
import { prependTaskNoteEntry } from "@/domain/spydr/utils/taskNotes";
import type { SpydrPriority, TaskNode, TaskStatus } from "@/domain/spydr/utils/types";
import { useUpdateTaskMutation } from "./useUpdateTaskMutation";

export interface TaskDetailFormValues {
  title: string;
  status: TaskStatus;
  priority: SpydrPriority;
  projectNodeId: string;
  dueDate: string;
  estimatedMinutes: string;
}

export type TaskDetailSaveState = "idle" | "pending" | "saving" | "saved" | "error";

const emptyForm: TaskDetailFormValues = {
  title: "",
  status: "active",
  priority: "medium",
  projectNodeId: "",
  dueDate: "",
  estimatedMinutes: "",
};

const SAVE_DEBOUNCE_MS = 700;

function taskToForm(task: TaskNode): TaskDetailFormValues {
  return {
    title: task.title,
    status: isTaskStatus(task.status) ? task.status : "active",
    priority: isProjectPriority(task.priority) ? task.priority : "medium",
    projectNodeId: task.project?.id ?? "",
    dueDate: task.details?.dueDate?.slice(0, 10) ?? "",
    estimatedMinutes:
      task.details?.estimatedMinutes != null
        ? String(task.details.estimatedMinutes)
        : "",
  };
}

function serializeForm(form: TaskDetailFormValues) {
  return JSON.stringify(form);
}

function formToInput(form: TaskDetailFormValues) {
  const estimatedMinutes = form.estimatedMinutes.trim();
  return {
    title: form.title.trim(),
    status: form.status,
    priority: form.priority,
    dueDate: form.dueDate || null,
    estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
    projectNodeId: form.projectNodeId || null,
  };
}

export function useTaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const query = useTaskQuery(taskId);
  const projectsQuery = useProjectsQuery();
  const task = query.data;
  const projects = projectsQuery.data ?? [];
  const updateTask = useUpdateTaskMutation(taskId);
  const [form, setForm] = useState<TaskDetailFormValues>(emptyForm);
  const [saveState, setSaveState] = useState<TaskDetailSaveState>("idle");
  const [noteDraft, setNoteDraft] = useState("");
  const [isLoggingNote, setIsLoggingNote] = useState(false);
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    hydratedRef.current = false;
    setSaveState("idle");
    setNoteDraft("");
  }, [taskId]);

  useEffect(() => {
    if (!task) return;
    setForm(taskToForm(task));
    hydratedRef.current = true;
  }, [task?.id]);

  useEffect(() => {
    if (!task || !hydratedRef.current) return;

    const fromServer = taskToForm(task);
    if (serializeForm(form) === serializeForm(fromServer)) return;

    setSaveState("pending");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveState("saving");
      updateTask.mutate(
        { taskId: task.id, input: formToInput(form) },
        {
          onSuccess: () => setSaveState("saved"),
          onError: () => setSaveState("error"),
        }
      );
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(saveTimerRef.current);
  }, [form, task, updateTask.mutate]);

  const updateField = <TField extends keyof TaskDetailFormValues>(
    field: TField,
    value: TaskDetailFormValues[TField]
  ) => setForm((current) => ({ ...current, [field]: value }));

  const logNote = () => {
    const text = noteDraft.trim();
    if (!text || !task) return;

    setIsLoggingNote(true);
    setSaveState("saving");
    updateTask.mutate(
      {
        taskId: task.id,
        input: { body: prependTaskNoteEntry(task.body, text) },
      },
      {
        onSuccess: () => {
          setNoteDraft("");
          setSaveState("saved");
        },
        onError: () => setSaveState("error"),
        onSettled: () => setIsLoggingNote(false),
      }
    );
  };

  return {
    task,
    taskId,
    projects,
    form,
    saveState,
    noteDraft,
    isLoggingNote,
    setNoteDraft,
    updateField,
    logNote,
    isLoading: query.isLoading || projectsQuery.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load task",
  };
}
