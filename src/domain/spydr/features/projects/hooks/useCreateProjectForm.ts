import { useState } from "react";
import type { CreateProjectInput, SpydrNodeStatus, SpydrPriority } from "@/domain/spydr/utils/types";
import { useCreateProjectMutation } from "./useCreateProjectMutation";

export interface ProjectFormValues {
  title: string;
  body: string;
  status: SpydrNodeStatus;
  priority: SpydrPriority;
  area: string;
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
  area: "",
  tags: "",
  outcome: "",
  startDate: "",
  targetDate: "",
  riskLevel: "medium",
};

export function useCreateProjectForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<ProjectFormValues>(initialValues);
  const mutation = useCreateProjectMutation();

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
    area: values.area.trim() || null,
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
      onSuccess: () => {
        reset();
        setIsOpen(false);
      },
    });
  };

  return {
    isOpen,
    setIsOpen,
    values,
    updateField,
    submit,
    canSubmit: values.title.trim().length > 0 && !mutation.isPending,
    isSubmitting: mutation.isPending,
    errorMessage:
      mutation.error instanceof Error ? mutation.error.message : null,
  };
}
