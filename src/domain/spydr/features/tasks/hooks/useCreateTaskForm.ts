import { useState } from "react";
import type { SpydrPriority } from "@/domain/spydr/utils/types";
import { isTaskStatus, type TaskStatus } from "@/domain/spydr/utils/taskStatus";
import { useCreateTaskMutation } from "./useCreateTaskMutation";

export interface CreateTaskFormValues {
  projectId: string;
  title: string;
  body: string;
  dueDate: string;
  status: TaskStatus;
  priority: SpydrPriority;
}

const emptyForm: CreateTaskFormValues = {
  projectId: "",
  title: "",
  body: "",
  dueDate: "",
  status: "active",
  priority: "medium",
};

export function useCreateTaskForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<CreateTaskFormValues>(emptyForm);
  const createTask = useCreateTaskMutation();

  const updateField = <TField extends keyof CreateTaskFormValues>(
    field: TField,
    value: CreateTaskFormValues[TField]
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const reset = () => setValues(emptyForm);

  const canSubmit =
    values.projectId.length > 0 &&
    values.title.trim().length > 0 &&
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
        },
      },
      {
        onSuccess: () => {
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
