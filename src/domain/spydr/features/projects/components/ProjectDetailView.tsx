import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { StatusTickBar } from "@/domain/spydr/features/shared/components/StatusTickBar";
import { EntityTransformMenu } from "@/domain/spydr/features/shared/components/EntityTransformMenu";
import { EmojiPicker } from "@/domain/spydr/features/shared/components/EmojiPicker";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { dueFromValue } from "@/domain/spydr/features/work/components/WorkDueDisplay";
import { resolveAreaColor } from "@/domain/spydr/utils/projectAreaColors";
import { cleanDisplayName } from "@/domain/spydr/utils/projectPersonas";
import type { ProjectPersonaRole } from "@/domain/spydr/utils/projectPersonas";
import type {
  PersonNode,
  ProjectAreaNode,
  ProjectChildKind,
  ProjectDetailNode,
  ProjectNode,
  SpydrPriority,
  UpdateProjectChildInput,
} from "@/domain/spydr/utils/types";
import type { ProjectDetailSaveState } from "../hooks/useProjectDetailPage";
import type {
  ProjectDecisionFormValues,
  ProjectDetailFormValues,
  ProjectIdeaFormValues,
  ProjectNoteFormValues,
  ProjectTaskFormValues,
} from "../hooks/useProjectDetailPage";
import { ProjectDecisionLog } from "./ProjectDecisionLog";
import { ProjectIdeasLog } from "./ProjectIdeasLog";
import { ProjectNotesLog } from "./ProjectNotesLog";
import { ProjectResourcesList } from "./ProjectResourcesList";
import { ProjectDetailInlineError } from "./ProjectDetailSection";
import {
  ProjectDeletedItems,
  PROJECT_TRASH_SECTION_ID,
  getDeletedItemCount,
} from "./ProjectDeletedItems";
import { ProjectDescription } from "./ProjectDescription";
import { ProjectDetailProperties } from "./ProjectDetailProperties";
import { ProjectDetailTaskList } from "./ProjectDetailTaskList";
import { AreaColorSwatch } from "./AreaColorSwatch";
import { SaveAsTemplateDialog } from "./SaveAsTemplateDialog";
import { cn } from "@/lib/utils";
import "../pages/project-detail-page.css";

type ProjectLogTab = "tasks" | "notes" | "decisions" | "ideas" | "resources";

interface ProjectDetailViewProps {
  project: ProjectDetailNode;
  projects: ProjectNode[];
  people: PersonNode[];
  areas: ProjectAreaNode[];
  areaNodeId: string;
  deleted: ProjectDetailNode["deleted"];
  stats: {
    connected: {
      tasks: {
        total: number;
        open: number;
        closed: number;
        blocked: number;
      };
      decisions: number;
      notes: number;
      ideas: number;
      resources: number;
    };
    progressPercent: number;
    openTaskCount: number;
    taskStatusCounts: Record<string, number>;
  };
  detailForm: ProjectDetailFormValues;
  detailSaveState: ProjectDetailSaveState;
  taskForm: ProjectTaskFormValues;
  noteForm: ProjectNoteFormValues;
  noteFormResetKey: number;
  decisionForm: ProjectDecisionFormValues;
  ideaForm: ProjectIdeaFormValues;
  canAddTask: boolean;
  canAddNote: boolean;
  canAddDecision: boolean;
  canAddIdea: boolean;
  isAddingTask: boolean;
  isAddingNote: boolean;
  isAddingDecision: boolean;
  isAddingIdea: boolean;
  detailError: string | null;
  personaError: string | null;
  taskError: string | null;
  noteError: string | null;
  decisionError: string | null;
  ideaError: string | null;
  onDetailFieldChange<TField extends keyof ProjectDetailFormValues>(
    field: TField,
    value: ProjectDetailFormValues[TField]
  ): void;
  onTaskFieldChange<TField extends keyof ProjectTaskFormValues>(
    field: TField,
    value: ProjectTaskFormValues[TField]
  ): void;
  onNoteFieldChange<TField extends keyof ProjectNoteFormValues>(
    field: TField,
    value: ProjectNoteFormValues[TField]
  ): void;
  onDecisionFieldChange<TField extends keyof ProjectDecisionFormValues>(
    field: TField,
    value: ProjectDecisionFormValues[TField]
  ): void;
  onIdeaFieldChange<TField extends keyof ProjectIdeaFormValues>(
    field: TField,
    value: ProjectIdeaFormValues[TField]
  ): void;
  onAddTask(): void;
  onAddNote(): void;
  onAddDecision(): void;
  onAddIdea(): void;
  onUpdateChild(
    kind: ProjectChildKind,
    childId: string,
    input: UpdateProjectChildInput
  ): void;
  onStatusChange(status: string): void;
  isUpdatingStatus?: boolean;
  onPriorityChange(priority: string): void;
  onAreaChange(areaNodeId: string | null): void;
  isUpdatingArea?: boolean;
  onEmojiChange(emoji: string | null): void;
  onPersonaChange(role: ProjectPersonaRole, personNodeId: string | null): void;
  isUpdatingPersona?: boolean;
  onDeleteChild(kind: ProjectChildKind, childId: string): void;
  onRestoreChild(kind: ProjectChildKind, childId: string): void;
  onDeleteProject(onDeleted?: () => void): void;
  isDeletingProject?: boolean;
  isUpdatingChild: boolean;
  isDeletingChild: boolean;
  isRestoringChild: boolean;
  restoringId: string | null;
  deletingChildIds: string[];
  childMutationError: string | null;
}

function formatUpdatedAgo(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 60) return `updated ${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `updated ${days}d ago`;
  return `updated ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toLowerCase()}`;
}

function sentenceStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function ProjectDetailView({
  project,
  projects,
  people,
  areas,
  areaNodeId,
  deleted,
  stats,
  detailForm,
  detailSaveState,
  taskForm,
  noteForm,
  noteFormResetKey,
  decisionForm,
  ideaForm,
  canAddTask,
  canAddNote,
  canAddDecision,
  canAddIdea,
  isAddingTask,
  isAddingNote,
  isAddingDecision,
  isAddingIdea,
  detailError,
  personaError,
  taskError,
  noteError,
  decisionError,
  ideaError,
  onDetailFieldChange,
  onTaskFieldChange,
  onNoteFieldChange,
  onDecisionFieldChange,
  onIdeaFieldChange,
  onAddTask,
  onAddNote,
  onAddDecision,
  onAddIdea,
  onUpdateChild,
  onStatusChange,
  isUpdatingStatus = false,
  onPriorityChange,
  onAreaChange,
  isUpdatingArea = false,
  onEmojiChange,
  onPersonaChange,
  isUpdatingPersona = false,
  onDeleteChild,
  onRestoreChild,
  onDeleteProject,
  isDeletingProject = false,
  isUpdatingChild,
  isDeletingChild,
  isRestoringChild,
  restoringId,
  deletingChildIds,
  childMutationError,
}: ProjectDetailViewProps) {
  const navigate = useNavigate();
  const deletedCount = getDeletedItemCount(deleted);
  const personas = project.personas ?? {
    requester: null,
    assignee: null,
    sponsor: null,
    reviewer: null,
  };
  const [trashExpanded, setTrashExpanded] = useState(false);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [logTab, setLogTab] = useState<ProjectLogTab>("tasks");
  const prevDeletedCountRef = useRef(deletedCount);

  const displayName =
    cleanDisplayName(detailForm.title) ||
    cleanDisplayName(project.title) ||
    "Untitled project";

  usePageBreadcrumb(displayName);

  useEffect(() => {
    if (deletedCount > prevDeletedCountRef.current) {
      setTrashExpanded(true);
      requestAnimationFrame(() => {
        document
          .getElementById(PROJECT_TRASH_SECTION_ID)
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
    prevDeletedCountRef.current = deletedCount;
  }, [deletedCount]);

  const selectedArea = areas.find((area) => area.id === areaNodeId);
  const areaColor = selectedArea ? resolveAreaColor(selectedArea) : null;
  const targetDue = dueFromValue(detailForm.targetDate || null);

  const tickSegments = useMemo(() => {
    const counts = stats.taskStatusCounts;
    return [
      {
        key: "active",
        label: "Active",
        tone: "active" as const,
        count: counts.active ?? 0,
      },
      {
        key: "blocked",
        label: "Blocked",
        tone: "blocked" as const,
        count: counts.blocked ?? 0,
      },
      {
        key: "waiting",
        label: "Waiting",
        tone: "waiting" as const,
        count: counts.waiting ?? 0,
      },
      {
        key: "done",
        label: "Done",
        tone: "done" as const,
        count:
          (counts.completed ?? 0) +
          (counts.archived ?? 0) +
          (counts.inactive ?? 0),
      },
    ];
  }, [stats.taskStatusCounts]);

  const doneCount = stats.connected.tasks.closed;
  const totalTasks = stats.connected.tasks.total;
  const statusActive = project.status === "active";

  const tabs: Array<{ id: ProjectLogTab; label: string; count: number }> = [
    { id: "tasks", label: "Tasks", count: project.tasks.length },
    { id: "notes", label: "Notes", count: project.notes.length },
    { id: "decisions", label: "Decisions", count: project.decisions.length },
    { id: "ideas", label: "Ideas", count: project.ideas.length },
    { id: "resources", label: "Resources", count: project.resources.length },
  ];

  const saveHint =
    detailSaveState === "pending"
      ? "Unsaved"
      : detailSaveState === "saving"
        ? "Saving…"
        : detailSaveState === "error"
          ? "Save failed"
          : null;

  return (
    <div className="project-detail-page flex h-full min-h-0 w-full min-w-0 flex-col overflow-y-auto">
      <header className="project-detail-header">
        <nav className="project-detail-crumb" aria-label="Breadcrumb">
          <Link to="/work">Work</Link>
          <ChevronRight className="project-detail-crumb-sep" aria-hidden />
          <span className="truncate">{displayName}</span>
        </nav>

        <div className="project-detail-title-row">
          <span className="project-detail-title-emoji">
            <EmojiPicker
              value={project.details?.emoji}
              size="md"
              ariaLabel={`Emoji for ${displayName}`}
              onChange={onEmojiChange}
            />
          </span>
          <h1>
            <input
              value={detailForm.title}
              onChange={(event) => onDetailFieldChange("title", event.target.value)}
              className="w-full min-w-0 bg-transparent text-[inherit] font-[inherit] tracking-[inherit] text-[var(--fg)] outline-none placeholder:text-[var(--muted-2)]"
              placeholder="Project name"
              aria-label="Project name"
            />
          </h1>
          <div className="project-detail-title-actions">
            <EntityTransformMenu
              nodeId={project.id}
              sourceType="project"
              sourceTitle={displayName}
              projects={projects}
              excludeProjectId={project.id}
              compact
              triggerLabel="Convert"
              className="project-detail-control border-[#1a1d23] bg-[var(--control)] shadow-none"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="project-detail-control project-detail-control-icon"
                  aria-label="Project actions"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="text-[12px]"
                  onSelect={() => setSaveAsTemplateOpen(true)}
                >
                  Save as template…
                </DropdownMenuItem>
                {deletedCount > 0 ? (
                  <DropdownMenuItem
                    className="text-[12px]"
                    onSelect={() => {
                      setTrashExpanded(true);
                      requestAnimationFrame(() => {
                        document
                          .getElementById(PROJECT_TRASH_SECTION_ID)
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      });
                    }}
                  >
                    Open trash ({deletedCount})
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-[12px] text-destructive focus:text-destructive"
                  disabled={isDeletingProject}
                  onSelect={() => onDeleteProject(() => navigate("/work"))}
                >
                  Delete project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="project-detail-meta">
          <span className="project-detail-meta-item">
            <StatusDot status={project.status} />
            <span
              className={cn(
                "capitalize",
                statusActive ? "text-[var(--active)]" : "text-[var(--muted)]"
              )}
            >
              {sentenceStatus(project.status)}
            </span>
          </span>

          {selectedArea ? (
            <span className="project-detail-meta-item">
              {areaColor ? (
                <AreaColorSwatch
                  color={areaColor}
                  className="h-1.5 w-1.5 border-0 shadow-none"
                />
              ) : (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--faint)]" />
              )}
              <span className="truncate text-[var(--muted)]">
                {cleanDisplayName(selectedArea.title) || selectedArea.title}
              </span>
            </span>
          ) : null}

          {detailForm.targetDate && !targetDue.empty ? (
            <span className="project-detail-meta-item project-detail-meta-mono">
              {targetDue.overdue ? (
                <>
                  <span className="project-detail-meta-late">{targetDue.label}</span>
                  <span>
                    {" "}
                    · target {targetDue.dateLabel.toLowerCase()}
                  </span>
                </>
              ) : (
                <span>
                  {targetDue.label
                    ? `${targetDue.label} · target ${targetDue.dateLabel.toLowerCase()}`
                    : `target ${targetDue.dateLabel.toLowerCase()}`}
                </span>
              )}
            </span>
          ) : null}

          {totalTasks > 0 ? (
            <span className="project-detail-progress">
              <StatusTickBar segments={tickSegments} />
              <span className="project-detail-meta-mono">
                {doneCount}/{totalTasks} done
              </span>
            </span>
          ) : null}

          <span className="project-detail-meta-updated">
            {formatUpdatedAgo(project.updatedAt)}
            {saveHint ? ` · ${saveHint}` : null}
          </span>
        </div>
      </header>

      <SaveAsTemplateDialog
        project={project}
        open={saveAsTemplateOpen}
        onOpenChange={setSaveAsTemplateOpen}
      />

      {deletedCount > 0 ? (
        <div className="px-4 pb-3">
          <ProjectDeletedItems
            deleted={deleted}
            expanded={trashExpanded}
            onExpandedChange={setTrashExpanded}
            onRestore={onRestoreChild}
            isRestoring={isRestoringChild}
            restoringId={restoringId}
          />
        </div>
      ) : null}

      <div className="project-detail-body">
        <div className="project-detail-main">
          <ProjectDescription
            value={detailForm.body}
            onChange={(body) => onDetailFieldChange("body", body)}
          />

          {detailError ? (
            <ProjectDetailInlineError>{detailError}</ProjectDetailInlineError>
          ) : null}
          {personaError ? (
            <ProjectDetailInlineError>{personaError}</ProjectDetailInlineError>
          ) : null}
          {childMutationError ? (
            <ProjectDetailInlineError>{childMutationError}</ProjectDetailInlineError>
          ) : null}

          <section className="project-detail-panel">
            <div
              role="tablist"
              aria-label="Project contents"
              className="project-detail-tabs"
            >
              {tabs.map((tab) => {
                const selected = logTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`project-tab-${tab.id}`}
                    aria-selected={selected}
                    aria-controls={`project-panel-${tab.id}`}
                    tabIndex={selected ? 0 : -1}
                    className="project-detail-tab"
                    onClick={() => setLogTab(tab.id)}
                  >
                    {tab.label}
                    <span className="project-detail-tab-count">{tab.count}</span>
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              id={`project-panel-${logTab}`}
              aria-labelledby={`project-tab-${logTab}`}
              className="project-detail-tab-panel"
            >
              {logTab === "tasks" ? (
                <ProjectDetailTaskList
                  project={project}
                  people={people}
                  taskForm={taskForm}
                  canAddTask={canAddTask}
                  isAddingTask={isAddingTask}
                  taskError={taskError}
                  isUpdatingChild={isUpdatingChild}
                  deletingChildIds={deletingChildIds}
                  onTaskFieldChange={onTaskFieldChange}
                  onAddTask={onAddTask}
                  onUpdateChild={(childId, input) =>
                    onUpdateChild("task", childId, input)
                  }
                  onDeleteChild={(childId) => onDeleteChild("task", childId)}
                />
              ) : null}

              {logTab === "notes" ? (
                <div className="p-3">
                  <ProjectNotesLog
                    notes={project.notes}
                    projects={projects}
                    projectId={project.id}
                    form={noteForm}
                    formResetKey={noteFormResetKey}
                    canAdd={canAddNote}
                    isAdding={isAddingNote}
                    error={noteError}
                    onFieldChange={onNoteFieldChange}
                    onAdd={onAddNote}
                    onUpdate={(childId, input) =>
                      onUpdateChild("note", childId, input)
                    }
                    onDelete={(childId) => onDeleteChild("note", childId)}
                    isUpdating={isUpdatingChild}
                    isDeleting={isDeletingChild}
                    deletingChildIds={deletingChildIds}
                  />
                </div>
              ) : null}

              {logTab === "decisions" ? (
                <div className="p-3">
                  <ProjectDecisionLog
                    decisions={project.decisions}
                    form={decisionForm}
                    canAdd={canAddDecision}
                    isAdding={isAddingDecision}
                    error={decisionError}
                    onFieldChange={onDecisionFieldChange}
                    onAdd={onAddDecision}
                    onUpdate={(childId, input) =>
                      onUpdateChild("decision", childId, input)
                    }
                    onDelete={(childId) => onDeleteChild("decision", childId)}
                    isUpdating={isUpdatingChild}
                    isDeleting={isDeletingChild}
                  />
                </div>
              ) : null}

              {logTab === "ideas" ? (
                <div className="p-3">
                  <ProjectIdeasLog
                    ideas={project.ideas}
                    projects={projects}
                    projectId={project.id}
                    form={ideaForm}
                    canAdd={canAddIdea}
                    isAdding={isAddingIdea}
                    error={ideaError}
                    onFieldChange={onIdeaFieldChange}
                    onAdd={onAddIdea}
                    onUpdate={(childId, input) =>
                      onUpdateChild("idea", childId, input)
                    }
                    onDelete={(childId) => onDeleteChild("idea", childId)}
                    isUpdating={isUpdatingChild}
                    isDeleting={isDeletingChild}
                  />
                </div>
              ) : null}

              {logTab === "resources" ? (
                <div className="p-3">
                  <ProjectResourcesList
                    resources={project.resources}
                    onUpdate={(childId, input) =>
                      onUpdateChild("resource", childId, input)
                    }
                    onDelete={(childId) => onDeleteChild("resource", childId)}
                    isUpdating={isUpdatingChild}
                    isDeleting={isDeletingChild}
                  />
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <ProjectDetailProperties
          status={project.status}
          priority={project.priority}
          riskLevel={detailForm.riskLevel}
          areas={areas}
          areaNodeId={areaNodeId}
          people={people}
          personas={personas}
          startDate={detailForm.startDate}
          targetDate={detailForm.targetDate}
          isUpdatingStatus={isUpdatingStatus}
          isUpdatingArea={isUpdatingArea}
          isUpdatingPersona={isUpdatingPersona}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
          onRiskChange={(riskLevel) =>
            onDetailFieldChange("riskLevel", riskLevel)
          }
          onAreaChange={onAreaChange}
          onStartDateChange={(startDate) =>
            onDetailFieldChange("startDate", startDate)
          }
          onTargetDateChange={(targetDate) =>
            onDetailFieldChange("targetDate", targetDate)
          }
          onPersonaChange={onPersonaChange}
        />
      </div>
    </div>
  );
}
