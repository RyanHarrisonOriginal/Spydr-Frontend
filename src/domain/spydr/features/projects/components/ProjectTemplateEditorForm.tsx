import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  CreateProjectTemplateInput,
  ProjectAreaNode,
  ProjectTemplate,
  UpdateProjectTemplateInput,
} from "@/domain/spydr/utils/types";
import { CollectionReorderControls } from "@/domain/spydr/features/shared/components/CollectionReorderControls";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import { moveIdInOrder } from "@/domain/spydr/utils/collectionReorder";
import { findAreaIdByTitle } from "@/domain/spydr/utils/projectAreas";
import { useProjectAreasQuery } from "@/domain/spydr/features/shared/hooks/queries";
import {
  TemplateParametersPanel,
  type EditableTemplateParameter,
} from "./TemplateParametersPanel";
import { TemplateParameterizedField } from "./TemplateParameterizedField";
import { ProjectAreaSelect } from "./ProjectAreaSelect";
import {
  extractKeysFromTexts,
  humanizeParameterKey,
} from "../utils/templateParameters";

export interface EditableTemplateTaskRow {
  id: string;
  titleTemplate: string;
  bodyTemplate: string;
  status: string;
  priority: string;
  estimatedMinutes: number | null;
  tags: string[];
  sortOrder: number;
}

export interface ProjectTemplateEditorFormState {
  name: string;
  description: string;
  titleTemplate: string;
  bodyTemplate: string;
  outcomeTemplate: string;
  areaNodeId: string;
  parameters: EditableTemplateParameter[];
  tasks: EditableTemplateTaskRow[];
}

function emptyState(): ProjectTemplateEditorFormState {
  return {
    name: "",
    description: "",
    titleTemplate: "",
    bodyTemplate: "",
    outcomeTemplate: "",
    areaNodeId: "",
    parameters: [],
    tasks: [],
  };
}

function stateFromTemplate(
  template: ProjectTemplate,
  areas: ProjectAreaNode[]
): ProjectTemplateEditorFormState {
  return {
    name: template.name,
    description: template.description ?? "",
    titleTemplate: template.titleTemplate,
    bodyTemplate: template.bodyTemplate,
    outcomeTemplate: template.outcomeTemplate ?? "",
    areaNodeId: findAreaIdByTitle(template.area, areas),
    parameters: template.parameters.map((param) => ({
      id: param.id,
      key: param.key,
      label: param.label,
      required: param.required,
      defaultValue: param.defaultValue ?? "",
    })),
    tasks: template.tasks.map((task, index) => ({
      id: task.id,
      titleTemplate: task.titleTemplate,
      bodyTemplate: task.bodyTemplate,
      status: task.status,
      priority: task.priority,
      estimatedMinutes: task.estimatedMinutes,
      tags: task.tags,
      sortOrder: task.sortOrder ?? index,
    })),
  };
}

interface ProjectTemplateEditorFormProps {
  initialTemplate?: ProjectTemplate | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  submitLabel: string;
  onCancel(): void;
  onSubmit(payload: {
    create: CreateProjectTemplateInput;
    update: UpdateProjectTemplateInput;
  }): void;
}

export function ProjectTemplateEditorForm({
  initialTemplate = null,
  isSubmitting,
  errorMessage,
  submitLabel,
  onCancel,
  onSubmit,
}: ProjectTemplateEditorFormProps) {
  const areasQuery = useProjectAreasQuery();
  const areas = areasQuery.data ?? [];
  const [state, setState] = useState<ProjectTemplateEditorFormState>(() =>
    initialTemplate ? stateFromTemplate(initialTemplate, areas) : emptyState()
  );
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTemplate) {
      setState(stateFromTemplate(initialTemplate, areas));
    }
  }, [initialTemplate?.id, initialTemplate?.updatedAt, areas]);

  const parameterOptions = useMemo(
    () => state.parameters.map((param) => ({ key: param.key, label: param.label })),
    [state.parameters]
  );

  useEffect(() => {
    setState((current) => {
      const keys = extractKeysFromTexts(
        current.titleTemplate,
        current.bodyTemplate,
        current.outcomeTemplate,
        ...current.tasks.flatMap((task) => [
          task.titleTemplate,
          task.bodyTemplate,
          ...task.tags,
        ])
      );
      if (keys.length === 0) return current;
      const existing = new Set(current.parameters.map((param) => param.key));
      const additions = keys
        .filter((key) => !existing.has(key))
        .map((key) => ({
          id: crypto.randomUUID(),
          key,
          label: humanizeParameterKey(key),
          required: true,
          defaultValue: "",
        }));
      if (additions.length === 0) return current;
      return {
        ...current,
        parameters: [...current.parameters, ...additions],
      };
    });
  }, [
    state.titleTemplate,
    state.bodyTemplate,
    state.outcomeTemplate,
    state.tasks,
  ]);

  const patch = <K extends keyof ProjectTemplateEditorFormState>(
    key: K,
    value: ProjectTemplateEditorFormState[K]
  ) => {
    setState((current) => ({ ...current, [key]: value }));
    setLocalError(null);
  };

  const addTask = () => {
    setState((current) => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          id: crypto.randomUUID(),
          titleTemplate: "",
          bodyTemplate: "",
          status: "active",
          priority: "medium",
          estimatedMinutes: null,
          tags: [],
          sortOrder: current.tasks.length,
        },
      ],
    }));
  };

  const updateTask = (
    id: string,
    patchTask: Partial<EditableTemplateTaskRow>
  ) => {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === id ? { ...task, ...patchTask } : task
      ),
    }));
  };

  const removeTask = (id: string) => {
    setState((current) => ({
      ...current,
      tasks: current.tasks
        .filter((task) => task.id !== id)
        .map((task, index) => ({ ...task, sortOrder: index })),
    }));
  };

  const reorderTasks = (orderedIds: string[]) => {
    setState((current) => {
      const byId = new Map(current.tasks.map((task) => [task.id, task]));
      const next = orderedIds
        .map((id) => byId.get(id))
        .filter((task): task is EditableTemplateTaskRow => Boolean(task))
        .map((task, index) => ({ ...task, sortOrder: index }));
      if (next.length !== current.tasks.length) return current;
      return { ...current, tasks: next };
    });
  };

  const moveTask = (id: string, direction: "up" | "down") => {
    const next = moveIdInOrder(
      state.tasks.map((task) => task.id),
      id,
      direction
    );
    if (next) reorderTasks(next);
  };

  const handleSubmit = () => {
    const name = state.name.trim();
    const titleTemplate = state.titleTemplate.trim();
    if (!name) {
      setLocalError("Template name is required");
      return;
    }
    if (!titleTemplate) {
      setLocalError("Project title template is required");
      return;
    }
    for (const param of state.parameters) {
      if (!/^[A-Z][A-Z0-9_]*$/.test(param.key)) {
        setLocalError(`Invalid parameter key: ${param.key}`);
        return;
      }
    }
    for (const task of state.tasks) {
      if (!task.titleTemplate.trim()) {
        setLocalError("Each task needs a title");
        return;
      }
    }

    const parameters = state.parameters.map((param, index) => ({
      id: param.id,
      key: param.key,
      label: param.label.trim() || humanizeParameterKey(param.key),
      valueType: "string",
      required: param.required,
      defaultValue: param.defaultValue.trim() || null,
      sortOrder: index,
    }));

    const tasks = state.tasks.map((task, index) => ({
      id: task.id,
      titleTemplate: task.titleTemplate.trim(),
      bodyTemplate: task.bodyTemplate.trim(),
      status: task.status,
      priority: task.priority,
      dueOffsetDays: null as number | null,
      estimatedMinutes: task.estimatedMinutes,
      tags: task.tags,
      sortOrder: index,
    }));

    const areaTitle =
      areas.find((area) => area.id === state.areaNodeId)?.title ?? null;

    const create: CreateProjectTemplateInput = {
      name,
      description: state.description.trim() || null,
      titleTemplate,
      bodyTemplate: state.bodyTemplate.trim(),
      outcomeTemplate: state.outcomeTemplate.trim() || null,
      area: areaTitle,
      parameters,
      tasks,
    };

    const update: UpdateProjectTemplateInput = {
      name,
      description: state.description.trim() || null,
      titleTemplate,
      bodyTemplate: state.bodyTemplate.trim(),
      outcomeTemplate: state.outcomeTemplate.trim() || null,
      area: areaTitle,
      parameters,
      tasks,
    };

    onSubmit({ create, update });
  };

  const error = localError ?? errorMessage;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-10">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="template-name">Template name</Label>
          <Input
            id="template-name"
            value={state.name}
            onChange={(event) => patch("name", event.target.value)}
            placeholder="New company go-live"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-description">Description</Label>
          <Textarea
            id="template-description"
            value={state.description}
            onChange={(event) => patch("description", event.target.value)}
            rows={2}
            placeholder="Shown in the create-project template picker"
          />
        </div>
      </div>

      <TemplateParametersPanel
        parameters={state.parameters}
        onChange={(parameters) => patch("parameters", parameters)}
      />

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium">Project fields</h2>
          <p className="text-[12px] text-muted-foreground">
            Type {"{{"} to insert a parameter from the list above.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Area</Label>
          <ProjectAreaSelect
            areas={areas}
            value={state.areaNodeId}
            onChange={(areaNodeId) => patch("areaNodeId", areaNodeId ?? "")}
            className="h-10 text-sm normal-case tracking-normal"
          />
          <p className="text-[11px] text-muted-foreground">
            Spawned projects inherit this area unless overridden at create time.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <TemplateParameterizedField
            value={state.titleTemplate}
            onValueChange={(titleTemplate) => patch("titleTemplate", titleTemplate)}
            parameters={parameterOptions}
            placeholder="{{NEW_COMPANY_NAME}} Reporting Go Live"
            aria-label="Project title template"
          />
        </div>
        <div className="space-y-2">
          <Label>Body</Label>
          <TemplateParameterizedField
            value={state.bodyTemplate}
            onValueChange={(bodyTemplate) => patch("bodyTemplate", bodyTemplate)}
            parameters={parameterOptions}
            multiline
            placeholder="Optional project body"
            aria-label="Project body template"
          />
        </div>
        <div className="space-y-2">
          <Label>Outcome</Label>
          <TemplateParameterizedField
            value={state.outcomeTemplate}
            onValueChange={(outcomeTemplate) =>
              patch("outcomeTemplate", outcomeTemplate)
            }
            parameters={parameterOptions}
            placeholder="Optional outcome"
            aria-label="Project outcome template"
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium">Tasks</h2>
            <p className="text-[12px] text-muted-foreground">
              Add parameterized tasks that will be created with the project.
              Drag or use arrows to set order.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={addTask}
          >
            <Plus className="h-3.5 w-3.5" />
            Add task
          </Button>
        </div>

        {state.tasks.length === 0 ? (
          <p className="rounded-md border border-dashed border-border/70 px-3 py-4 text-[12px] text-muted-foreground">
            No tasks yet. Add one to seed work when this template is used.
          </p>
        ) : (
          <CollectionSortableList
            items={state.tasks}
            enabled
            className="space-y-3"
            onReorder={reorderTasks}
            renderItem={(task, sortable) => (
              <div className="space-y-2 rounded-md border border-border/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <CollectionReorderControls
                      dragHandleProps={sortable.dragHandleProps}
                      canMoveUp={sortable.index > 0}
                      canMoveDown={sortable.index < state.tasks.length - 1}
                      onMoveUp={() => moveTask(task.id, "up")}
                      onMoveDown={() => moveTask(task.id, "down")}
                    />
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">
                      Task {sortable.index + 1}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-muted-foreground hover:text-destructive"
                    onClick={() => removeTask(task.id)}
                    aria-label={`Remove task ${sortable.index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <TemplateParameterizedField
                  value={task.titleTemplate}
                  onValueChange={(titleTemplate) =>
                    updateTask(task.id, { titleTemplate })
                  }
                  parameters={parameterOptions}
                  placeholder="reach out to {{NEW_COMPANY_NAME}} CFO…"
                  aria-label={`Task ${sortable.index + 1} title`}
                />
                <TemplateParameterizedField
                  value={task.bodyTemplate}
                  onValueChange={(bodyTemplate) =>
                    updateTask(task.id, { bodyTemplate })
                  }
                  parameters={parameterOptions}
                  multiline
                  placeholder="Optional task notes"
                  aria-label={`Task ${sortable.index + 1} body`}
                />
              </div>
            )}
          />
        )}
      </section>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}
