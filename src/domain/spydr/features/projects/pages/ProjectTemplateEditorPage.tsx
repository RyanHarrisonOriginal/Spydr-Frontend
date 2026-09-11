import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { useProjectTemplateQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { ProjectTemplateEditorForm } from "../components/ProjectTemplateEditorForm";
import { useCreateProjectTemplateMutation } from "../hooks/useCreateProjectTemplateMutation";
import { useUpdateProjectTemplateMutation } from "../hooks/useProjectTemplateMutations";

export function ProjectTemplateEditorPage({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const isCreate = mode === "create";

  const templateQuery = useProjectTemplateQuery(
    isCreate ? undefined : templateId
  );
  const createMutation = useCreateProjectTemplateMutation();
  const updateMutation = useUpdateProjectTemplateMutation();

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
          errorMessage={errorMessage}
          submitLabel={isCreate ? "Create template" : "Save changes"}
          onCancel={() => navigate("/project-templates")}
          onSubmit={({ create, update }) => {
            if (isCreate) {
              createMutation.mutate(create, {
                onSuccess: () => navigate("/project-templates"),
              });
              return;
            }
            updateMutation.mutate(
              { templateId: templateId!, input: update },
              {
                onSuccess: () => navigate("/project-templates"),
              }
            );
          }}
        />
      </div>
    </div>
  );
}
