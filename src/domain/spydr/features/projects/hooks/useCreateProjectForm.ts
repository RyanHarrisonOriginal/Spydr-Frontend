import { useEffect, useMemo, useState } from "react";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import {
  useProjectTemplateQuery,
  useProjectTemplatesQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import type { CreateProjectInput, SpydrNodeStatus, SpydrPriority } from "@/domain/spydr/utils/types";
import { useCreateProjectMutation } from "./useCreateProjectMutation";
import { useInvokeProjectTemplateMutation } from "./useInvokeProjectTemplateMutation";
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
  const [templateId, setTemplateId] = useState<string>("");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  const { currentUserPersonId } = useCurrentUserPerson();
  const mutation = useCreateProjectMutation();
  const invokeMutation = useInvokeProjectTemplateMutation();
  const updateProject = useUpdateProjectMutation();

  const templatesQuery = useProjectTemplatesQuery({ includeArchived: true });
  const templateQuery = useProjectTemplateQuery(templateId || undefined);

  const allTemplates = templatesQuery.data ?? [];
  const templates = allTemplates.filter((template) => !template.isArchived);
  const hasAnyTemplates = allTemplates.length > 0;
  const selectedTemplate = templateQuery.data ?? null;

  useEffect(() => {
    if (!selectedTemplate) {
      setParamValues({});
      return;
    }
    const next: Record<string, string> = {};
    for (const param of selectedTemplate.parameters) {
      next[param.key] = param.defaultValue ?? "";
    }
    setParamValues(next);
  }, [selectedTemplate?.id]);

  const updateField = <TField extends keyof ProjectFormValues>(
    field: TField,
    value: ProjectFormValues[TField]
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const updateParam = (key: string, value: string) => {
    setParamValues((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setValues(initialValues);
    setTemplateId("");
    setParamValues({});
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

  const requiredParamsFilled = useMemo(() => {
    if (!selectedTemplate) return true;
    return selectedTemplate.parameters.every((param) => {
      if (!param.required) return true;
      const value = paramValues[param.key]?.trim();
      return Boolean(value);
    });
  }, [selectedTemplate, paramValues]);

  const finishWithAssignee = (projectId: string) => {
    const personId =
      options?.linkPersonAsAssignee ?? currentUserPersonId ?? null;
    if (!personId) {
      options?.onSuccess?.();
      reset();
      setIsOpen(false);
      return;
    }

    updateProject.mutate(
      { projectId, input: { assigneePersonNodeId: personId } },
      {
        onSuccess: () => {
          options?.onSuccess?.();
          reset();
          setIsOpen(false);
        },
      }
    );
  };

  const submit = () => {
    if (templateId && selectedTemplate) {
      if (!requiredParamsFilled) return;
      invokeMutation.mutate(
        {
          templateId,
          input: {
            parameters: paramValues,
            areaNodeId: values.areaNodeId || null,
          },
        },
        {
          onSuccess: (project) => finishWithAssignee(project.id),
        }
      );
      return;
    }

    const input = toCreateInput();
    if (!input.title) return;

    mutation.mutate(input, {
      onSuccess: (project) => finishWithAssignee(project.id),
    });
  };

  const isSubmitting =
    mutation.isPending || invokeMutation.isPending || updateProject.isPending;

  const canSubmitBlank = values.title.trim().length > 0 && !isSubmitting;
  const canSubmitTemplate =
    Boolean(templateId) &&
    Boolean(selectedTemplate) &&
    requiredParamsFilled &&
    !isSubmitting &&
    !templateQuery.isLoading;

  const error =
    mutation.error ?? invokeMutation.error ?? updateProject.error ?? null;

  return {
    isOpen,
    setIsOpen: (open: boolean) => {
      setIsOpen(open);
      if (!open) reset();
    },
    values,
    updateField,
    submit,
    canSubmit: templateId ? canSubmitTemplate : canSubmitBlank,
    isSubmitting,
    errorMessage: error instanceof Error ? error.message : null,
    templates,
    hasAnyTemplates,
    templatesLoading: templatesQuery.isLoading,
    templateId,
    setTemplateId,
    selectedTemplate,
    templateLoading: templateQuery.isFetching && Boolean(templateId),
    paramValues,
    updateParam,
  };
}
