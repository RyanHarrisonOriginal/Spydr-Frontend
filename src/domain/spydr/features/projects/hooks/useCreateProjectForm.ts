import { useState } from "react";
import type { CreateProjectInput, SpydrNodeStatus, SpydrPriority } from "@/domain/spydr/utils/types";
import { useCreateProjectMutation } from "./useCreateProjectMutation";
import { useUpdateProjectMutation } from "./useUpdateProjectMutation";

export interface ProjectFormValues {
  title: string;
  body: string;
  status: SpydrNodeStatus;
  priority: SpydrPriority;
  areaNodeId: string;
  tags: string;
  outcome: string;
  startDate: string;
  targetDate: string;
  riskLevel: SpydrPriority;
}

const initialValues: ProjectFormValues = {
  title: "",
  body: "",
  status: "active",
  priority: "medium",
  areaNodeId: "",
  tags: "",
  outcome: "",
  startDate: "",
  targetDate: "",
  riskLevel: "medium",
};

export interface UseCreateProjectFormOptions {
  linkPersonAsAssignee?: string;
  onSuccess?(): void;
}

export function useCreateProjectForm(options?: UseCreateProjectFormOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<ProjectFormValues>(initialValues);
  const mutation = useCreateProjectMutation();
  const updateProject = useUpdateProjectMutation();

  const updateField = <TField extends keyof ProjectFormValues>(
    field: TField,
    value: ProjectFormValues[TField]
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const reset = () => {
    setValues(initialValues);
  };

  const toCreateInput = (): CreateProjectInput => ({
    title: values.title.trim(),
    body: values.body.trim(),
    status: values.status,
    priority: values.priority,
    areaNodeId: values.areaNodeId || null,
    tags: values.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    outcome: values.outcome.trim() || null,
    startDate: values.startDate || null,
    targetDate: values.targetDate || null,
    riskLevel: values.riskLevel,
  });

  const submit = () => {
    const input = toCreateInput();
    if (!input.title) return;

    mutation.mutate(input, {
      onSuccess: (project) => {
        const personId = options?.linkPersonAsAssignee;
        if (!personId) {
          options?.onSuccess?.();
          reset();
          setIsOpen(false);
          return;
        }

        updateProject.mutate(
          { projectId: project.id, input: { assigneePersonNodeId: personId } },
          {
            onSuccess: () => {
              options?.onSuccess?.();
              reset();
              setIsOpen(false);
            },
          }
        );
      },
    });
  };

  const isSubmitting = mutation.isPending || updateProject.isPending;

  return {
    isOpen,
    setIsOpen,
    values,
    updateField,
    submit,
    canSubmit: values.title.trim().length > 0 && !isSubmitting,
    isSubmitting,
    errorMessage:
      (mutation.error ?? updateProject.error) instanceof Error
        ? ((mutation.error ?? updateProject.error) as Error).message
        : null,
  };
}
