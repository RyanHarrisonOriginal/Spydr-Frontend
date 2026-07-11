import { Link } from "react-router-dom";
import { FileText, FolderKanban } from "lucide-react";
import type { NoteNode } from "@/domain/spydr/utils/types";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { formatBreadcrumbEntityId } from "@/domain/spydr/features/shell/utils/navigationBreadcrumbs";
import { RichTextEditor } from "@/domain/spydr/features/shared/components/RichTextEditor";
import {
  EntityTag,
  PriorityBadge,
  StatusPill,
} from "@/domain/spydr/features/shared/components/StatusPrimitives";
import {
  formatRelativeTime,
  formatShortDate,
} from "@/domain/spydr/features/shared/components/time";
import {
  ProjectDetailField,
  ProjectDetailFormPanel,
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailSectionHeader,
} from "@/domain/spydr/features/projects/components/ProjectDetailSection";
import type {
  NoteDetailFormValues,
  NoteDetailSaveState,
} from "../hooks/useNoteDetailPage";

function saveLabel(state: NoteDetailSaveState) {
  if (state === "saving" || state === "pending") return "Saving…";
  if (state === "saved") return "Saved";
  if (state === "error") return "Save failed";
  return null;
}

interface NoteDetailViewProps {
  note: NoteNode;
  form: NoteDetailFormValues;
  saveState: NoteDetailSaveState;
  onFieldChange<TField extends keyof NoteDetailFormValues>(
    field: TField,
    value: NoteDetailFormValues[TField]
  ): void;
}

export function NoteDetailView({
  note,
  form,
  saveState,
  onFieldChange,
}: NoteDetailViewProps) {
  const project = note.project;
  const hint = saveLabel(saveState);
  usePageBreadcrumb(formatBreadcrumbEntityId(note.id));

  return (
    <div className="min-w-0">
      <PageHeader
        title={
          <input
            value={form.title}
            onChange={(event) => onFieldChange("title", event.target.value)}
            className="w-full bg-transparent text-[1.35rem] font-semibold tracking-tight outline-none ring-focus placeholder:text-muted-foreground"
            placeholder="Title (optional)"
          />
        }
        meta={
          <span className="font-mono text-[11px] text-muted-foreground">
            Updated {formatRelativeTime(note.updatedAt)}
            {hint ? ` · ${hint}` : null}
          </span>
        }
      />

      <div className="border-b border-border px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={note.status} />
          <PriorityBadge priority={note.priority} />
          {note.area ? <EntityTag tag={note.area} /> : null}
          {note.tags.map((tag) => (
            <EntityTag key={tag} tag={tag} />
          ))}
        </div>

        <dl className="mt-3 grid gap-2 text-[12px] text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider">Created</dt>
            <dd className="mt-0.5 text-foreground/90">{formatShortDate(note.createdAt)}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider">Last updated</dt>
            <dd className="mt-0.5 text-foreground/90">{formatShortDate(note.updatedAt)}</dd>
          </div>
          {project ? (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider">Project</dt>
              <dd className="mt-0.5">
                <Link
                  to={`/projects/${project.id}`}
                  className="inline-flex items-center gap-1.5 text-foreground/90 hover:text-primary"
                >
                  <FolderKanban className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{project.title}</span>
                </Link>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <ProjectDetailSection>
        <ProjectDetailSectionHeader
          icon={<FileText className="h-3.5 w-3.5" />}
          label="Note body"
          hint={hint ?? undefined}
        />
        <ProjectDetailSectionBody className="px-6 py-5">
          <ProjectDetailFormPanel label="Content">
            <ProjectDetailField label="Body">
              <RichTextEditor
                value={form.body}
                onChange={(body) => onFieldChange("body", body)}
                placeholder="Details, links, or context…"
                minHeightClassName="min-h-[12rem]"
              />
            </ProjectDetailField>
          </ProjectDetailFormPanel>
        </ProjectDetailSectionBody>
      </ProjectDetailSection>
    </div>
  );
}
