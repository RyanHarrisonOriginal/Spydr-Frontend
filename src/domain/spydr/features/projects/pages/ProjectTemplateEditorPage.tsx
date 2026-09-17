import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import {
  useProjectTemplateQuery,
  useTemplateSpawnedProjectsQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import type { TemplateSpawnedProject, UpdateProjectTemplateInput } from "@/domain/spydr/utils/types";
import { ProjectTemplateEditorForm } from "../components/ProjectTemplateEditorForm";
import { SpawnedParameterValuesDialog } from "../components/SpawnedParameterValuesDialog";
import { useCreateProjectTemplateMutation } from "../hooks/useCreateProjectTemplateMutation";
import { useUpdateProjectTemplateMutation } from "../hooks/useProjectTemplateMutations";
import {
  defaultSpawnedParamValues,
  newKeysFromTemplateDraft,
  normalizeSpawnedParamValues,
} from "../utils/templateParameters";

interface PendingSpawnedParamSave {
  update: UpdateProjectTemplateInput;
  parameters: Array<{ key: string; label: string }>;
  projects: TemplateSpawnedProject[];
}

export function ProjectTemplateEditorPage({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const isCreate = mode === "create";

  const templateQuery = useProjectTemplateQuery(
    isCreate ? undefined : templateId
  );
  const spawnedQuery = useTemplateSpawnedProjectsQuery(
    isCreate ? undefined : templateId
  );
  const createMutation = useCreateProjectTemplateMutation();
  const updateMutation = useUpdateProjectTemplateMutation();
  const [pendingSave, setPendingSave] = useState<PendingSpawnedParamSave | null>(
    null
  );
  const [spawnedParamValues, setSpawnedParamValues] = useState<
    Record<string, Record<string, string>>
  >({});

  usePageBreadcrumb(
    isCreate
      ? "New template"
      : (templateQuery.data?.name ?? "Edit template")
  );

  if (!isCreate && templateQuery.isLoading) {
    return <LoadingState title="Loading template" />;
  }

  if (!isCreate && templateQuery.isError) {
    return (
      <ErrorState
        title="Template unavailable"
        description={
          templateQuery.error instanceof Error
            ? templateQuery.error.message
            : "Failed to load template"
        }
      />
    );
  }

  if (!isCreate && !templateQuery.data) {
    return (
      <EmptyState
        title="Template not found"
        description="This template does not exist or is not available."
      >
        <Button asChild variant="outline" size="sm">
          <Link to="/project-templates">Back to templates</Link>
        </Button>
      </EmptyState>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage =
    (createMutation.error ?? updateMutation.error) instanceof Error
      ? ((createMutation.error ?? updateMutation.error) as Error).message
      : null;

  const saveUpdate = (input: UpdateProjectTemplateInput) => {
    updateMutation.mutate(
      { templateId: templateId!, input },
      {
        onSuccess: () => navigate("/project-templates"),
      }
    );
  };

  const closeParamDialog = () => {
    setPendingSave(null);
    setSpawnedParamValues({});
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        dense
        title={isCreate ? "New project template" : "Edit template"}
        meta="Define parameters, project fields, and tasks. Type {{ to insert parameters."
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <ProjectTemplateEditorForm
          key={isCreate ? "new" : templateQuery.data!.id}
          initialTemplate={isCreate ? null : templateQuery.data}
          isSubmitting={isSubmitting}
          errorMessage={pendingSave ? null : errorMessage}
          submitLabel={isCreate ? "Create template" : "Save changes"}
          onCancel={() => navigate("/project-templates")}
          onSubmit={async ({ create, update }) => {
            if (isCreate) {
              createMutation.mutate(create, {
                onSuccess: () => navigate("/project-templates"),
              });
              return;
            }

            const newParameters = newKeysFromTemplateDraft({
              previousKeys: templateQuery.data?.parameters ?? [],
              parameters: update.parameters ?? [],
              titleTemplate: update.titleTemplate,
              bodyTemplate: update.bodyTemplate,
              outcomeTemplate: update.outcomeTemplate,
              tasks: update.tasks,
            });

            if (newParameters.length > 0) {
              let projects = spawnedQuery.data;
              if (projects === undefined) {
                try {
                  const result = await spawnedQuery.refetch();
                  projects = result.data;
                } catch {
                  projects = [];
                }
              }
              if (projects && projects.length > 0) {
                setPendingSave({
                  update,
                  parameters: newParameters,
                  projects,
                });
                setSpawnedParamValues(
                  defaultSpawnedParamValues(
                    projects.map((project) => project.id),
                    newParameters.map((param) => param.key)
                  )
                );
                return;
              }
            }

            saveUpdate(update);
          }}
        />
      </div>
      <SpawnedParameterValuesDialog
        open={pendingSave !== null}
        projects={pendingSave?.projects ?? []}
        parameters={pendingSave?.parameters ?? []}
        values={spawnedParamValues}
        isSubmitting={isSubmitting}
        errorMessage={pendingSave ? errorMessage : null}
        onValuesChange={setSpawnedParamValues}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) closeParamDialog();
        }}
        onConfirm={() => {
          if (!pendingSave) return;
          saveUpdate({
            ...pendingSave.update,
            spawnedParamValues: normalizeSpawnedParamValues(spawnedParamValues),
          });
        }}
      />
    </div>
  );
}
