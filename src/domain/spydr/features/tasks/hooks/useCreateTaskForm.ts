import { useState } from "react";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import type { SpydrPriority } from "@/domain/spydr/utils/types";
import { followUpLocalToIso, type TaskStatus } from "@/domain/spydr/utils/taskStatus";
import { useCreateTaskMutation } from "./useCreateTaskMutation";

export interface CreateTaskFormValues {
  projectId: string;
  title: string;
  body: string;
  dueDate: string;
  status: TaskStatus;
  priority: SpydrPriority;
  emoji: string | null;
  blockedByTaskId: string;
  followUpAt: string;
  waitingNote: string;
}

const emptyForm: CreateTaskFormValues = {
  projectId: "",
  title: "",
  body: "",
  dueDate: "",
  status: "active",
  priority: "medium",
  emoji: null,
  blockedByTaskId: "",
  followUpAt: "",
  waitingNote: "",
};

export interface UseCreateTaskFormOptions {
  assigneePersonNodeId?: string;
  onSuccess?(): void;
}

export function useCreateTaskForm(options?: UseCreateTaskFormOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<CreateTaskFormValues>(emptyForm);
  const { currentUserPersonId } = useCurrentUserPerson();
  const createTask = useCreateTaskMutation();

  const updateField = <TField extends keyof CreateTaskFormValues>(
    field: TField,
    value: CreateTaskFormValues[TField]
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const reset = () => setValues(emptyForm);

  const statusReady =
    values.status === "blocked"
      ? values.blockedByTaskId.length > 0
      : values.status === "waiting"
        ? values.followUpAt.length > 0
        : true;

  const canSubmit =
    values.projectId.length > 0 &&
    values.title.trim().length > 0 &&
    statusReady &&
    !createTask.isPending;

  const submit = () => {
    if (!canSubmit) return;

    createTask.mutate(
      {
        projectId: values.projectId,
        input: {
          title: values.title.trim(),
          body: values.body.trim(),
          dueDate: values.dueDate || null,
          status: values.status,
          priority: values.priority,
          emoji: values.emoji,
          blockedByNodeId:
            values.status === "blocked" ? values.blockedByTaskId : undefined,
          followUpAt:
            values.status === "waiting"
              ? followUpLocalToIso(values.followUpAt) ?? undefined
              : undefined,
          waitingNote:
            values.status === "waiting"
              ? values.waitingNote.trim() || null
              : undefined,
          assigneePersonNodeId:
            options?.assigneePersonNodeId ?? currentUserPersonId ?? null,
        },
      },
      {
        onSuccess: () => {
          options?.onSuccess?.();
          reset();
          setIsOpen(false);
        },
      }
    );
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) reset();
  };

  return {
    isOpen,
    values,
    canSubmit,
    isSubmitting: createTask.isPending,
    errorMessage:
      createTask.error instanceof Error ? createTask.error.message : null,
    setIsOpen: handleOpenChange,
    updateField,
    submit,
  };
}
