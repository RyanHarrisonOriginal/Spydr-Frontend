import { Link } from "react-router-dom";
import type { ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import type { ProjectPersonaRole } from "@/domain/spydr/utils/projectPersonas";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import {
  PersonMeBadge,
} from "@/domain/spydr/features/people/components/PersonIdentity";
import {
  ProjectDetailField,
  ProjectDetailFormPanel,
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailSectionHeader,
  detailFieldClassName,
  detailTextareaClassName,
} from "@/domain/spydr/features/projects/components/ProjectDetailSection";
import type {
  PersonDetailFormValues,
  PersonDetailSaveState,
} from "../hooks/usePersonDetailPage";
import { PersonProjectsSection } from "./PersonProjectsSection";
import { PersonTasksSection } from "./PersonTasksSection";
import { cn } from "@/lib/utils";

const personFieldClassName = cn(detailFieldClassName, "px-3.5 py-2.5");
const personTextareaClassName = cn(detailTextareaClassName, "px-3.5 py-3");

function saveLabel(state: PersonDetailSaveState) {
  if (state === "saving" || state === "pending") return "Saving…";
  if (state === "saved") return "Saved";
  if (state === "error") return "Save failed";
  return null;
}

interface PersonDetailViewProps {
  form: PersonDetailFormValues;
  saveState: PersonDetailSaveState;
  personId: string;
  displayName: string;
  updatedAt: string;
  projectEntries: Array<{ project: ProjectNode; roles: ProjectPersonaRole[] }>;
  assignedTasks: TaskNode[];
  deleteError: string | null;
  isDeleting: boolean;
  onFieldChange<TField extends keyof PersonDetailFormValues>(
    field: TField,
    value: PersonDetailFormValues[TField]
  ): void;
  onDelete(): void;
}

export function PersonDetailView({
  form,
  saveState,
  personId,
  displayName,
  updatedAt,
  projectEntries,
  assignedTasks,
  deleteError,
  isDeleting,
  onFieldChange,
  onDelete,
}: PersonDetailViewProps) {
  const hint = saveLabel(saveState);
  const { isMe, primaryClerkEmail } = useCurrentUserPerson();
  const isCurrentUser = isMe(personId);

  return (
    <div className="flex min-w-0">
      <div className="min-w-0 flex-1">
        <PageHeader
          eyebrow={
            <span className="flex items-center gap-2">
              <Link to="/people" className="hover:text-foreground">
                People
              </Link>
              <span>/</span>
              <span>{personId.slice(0, 8)}</span>
            </span>
          }
          title={
            <span className="inline-flex items-center gap-2">
              {displayName}
              {isCurrentUser ? <PersonMeBadge /> : null}
            </span>
          }
          meta={
            <span className="font-mono text-[11px] text-muted-foreground">
              updated {new Date(updatedAt).toLocaleString()}
            </span>
          }
          actions={
            <InlineDeleteButton
              label={displayName}
              isDeleting={isDeleting}
              onDelete={onDelete}
            />
          }
        />

        {deleteError ? (
          <p className="px-6 pb-2 text-sm text-destructive">{deleteError}</p>
        ) : null}

        {isCurrentUser ? (
          <div className="person-me-banner mx-6 mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-highlight/30 bg-highlight/8 px-3 py-2.5 text-[12px] text-foreground/90">
            <PersonMeBadge compact />
            <span>
              This is your workspace profile, matched to{" "}
              <span className="font-mono text-[11px] text-highlight">{primaryClerkEmail}</span>.
            </span>
          </div>
        ) : null}

        <div className="space-y-5 px-6 pb-8 pt-2">
          <ProjectDetailSection>
            <ProjectDetailSectionHeader
              label="Profile"
              hint={hint ?? undefined}
              hintClassName={saveState === "error" ? "text-destructive" : undefined}
            />
            <ProjectDetailSectionBody className="gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-full border border-border bg-muted/30 font-mono text-lg font-semibold text-foreground/85",
                    isCurrentUser &&
                      "person-me-avatar border-highlight/50 bg-highlight/10 text-highlight"
                  )}
                >
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <ProjectDetailField label="Full name" className="min-w-0 flex-1">
                  <input
                    value={form.fullName}
                    onChange={(event) => onFieldChange("fullName", event.target.value)}
                    className={personFieldClassName}
                  />
                </ProjectDetailField>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ProjectDetailField label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => onFieldChange("email", event.target.value)}
                    placeholder="name@company.com"
                    className={personFieldClassName}
                  />
                </ProjectDetailField>
                <ProjectDetailField label="Job title">
                  <input
                    value={form.title}
                    onChange={(event) => onFieldChange("title", event.target.value)}
                    placeholder="Product manager"
                    className={personFieldClassName}
                  />
                </ProjectDetailField>
                <ProjectDetailField label="Organization">
                  <input
                    value={form.organization}
                    onChange={(event) => onFieldChange("organization", event.target.value)}
                    placeholder="Acme Corp"
                    className={personFieldClassName}
                  />
                </ProjectDetailField>
                <ProjectDetailField label="Relationship context">
                  <input
                    value={form.relationshipContext}
                    onChange={(event) =>
                      onFieldChange("relationshipContext", event.target.value)
                    }
                    placeholder="Internal partner, vendor, client…"
                    className={personFieldClassName}
                  />
                </ProjectDetailField>
              </div>

              <ProjectDetailFormPanel label="Notes">
                <textarea
                  value={form.body}
                  onChange={(event) => onFieldChange("body", event.target.value)}
                  rows={4}
                  placeholder="How you work with this person, preferences, context…"
                  className={personTextareaClassName}
                />
              </ProjectDetailFormPanel>
            </ProjectDetailSectionBody>
          </ProjectDetailSection>

          <PersonProjectsSection entries={projectEntries} />
          <PersonTasksSection tasks={assignedTasks} />
        </div>
      </div>
    </div>
  );
}
