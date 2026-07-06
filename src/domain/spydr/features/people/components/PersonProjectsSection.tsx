import { Link } from "react-router-dom";
import type { ProjectNode } from "@/domain/spydr/utils/types";
import { projectPersonaLabels, type ProjectPersonaRole } from "@/domain/spydr/utils/projectPersonas";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import {
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailSectionHeader,
} from "@/domain/spydr/features/projects/components/ProjectDetailSection";

interface PersonProjectEntry {
  project: ProjectNode;
  roles: ProjectPersonaRole[];
}

interface PersonProjectsSectionProps {
  entries: PersonProjectEntry[];
}

export function PersonProjectsSection({ entries }: PersonProjectsSectionProps) {
  return (
    <ProjectDetailSection>
      <ProjectDetailSectionHeader
        label="Projects"
        hint={
          entries.length > 0
            ? `${entries.length} linked`
            : "No project roles assigned"
        }
      />
      <ProjectDetailSectionBody>
        {entries.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/80 px-4 py-8 text-center text-[13px] text-muted-foreground">
            This person is not linked to any projects yet. Assign them as requester,
            assignee, sponsor, or reviewer on a project.
          </div>
        ) : (
          <ul className="space-y-2">
            {entries.map(({ project, roles }) => (
              <li
                key={project.id}
                className="flex items-center gap-3 rounded-md border border-border/60 bg-background px-3 py-2.5 shadow-sm"
              >
                <StatusDot status={project.status} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/projects/${project.id}`}
                    className="block truncate text-[13px] font-medium hover:text-primary"
                  >
                    {project.title}
                  </Link>
                  {project.area ? (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {project.area}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  {roles.map((role) => (
                    <span
                      key={role}
                      className="rounded border border-border/70 bg-muted/30 px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                    >
                      {projectPersonaLabels[role]}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </ProjectDetailSectionBody>
    </ProjectDetailSection>
  );
}
