import { Link } from "react-router-dom";
import type { PersonNode, ProjectPersonas } from "@/domain/spydr/utils/types";
import {
  projectPersonaHints,
  projectPersonaLabels,
  projectPersonaRoles,
  type ProjectPersonaRole,
} from "@/domain/spydr/utils/projectPersonas";
import {
  ProjectDetailField,
  ProjectDetailFormPanel,
} from "./ProjectDetailSection";
import { PersonSelect } from "./PersonSelect";

interface ProjectPersonasPanelProps {
  people: PersonNode[];
  personas: ProjectPersonas;
  disabled?: boolean;
  onChange(role: ProjectPersonaRole, personNodeId: string | null): void;
}

export function ProjectPersonasPanel({
  people,
  personas,
  disabled = false,
  onChange,
}: ProjectPersonasPanelProps) {
  return (
    <ProjectDetailFormPanel label="People" className="p-2.5">
      {people.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/80 bg-muted/10 px-2.5 py-2.5 text-center">
          <p className="text-[11px] text-muted-foreground">
            No people in your workspace yet.
          </p>
          <Link to="/work" className="mt-0.5 inline-block text-[11px] text-primary hover:underline">
            Add people to assign roles
          </Link>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {projectPersonaRoles.map((role) => (
            <ProjectDetailField
              key={role}
              label={projectPersonaLabels[role]}
              className="space-y-1 [&_span:nth-child(2)]:sr-only"
              hint={projectPersonaHints[role]}
            >
              <PersonSelect
                people={people}
                value={personas[role]?.id ?? null}
                disabled={disabled}
                compact
                ariaLabel={`${projectPersonaLabels[role]} — ${projectPersonaHints[role]}`}
                onChange={(personNodeId) => onChange(role, personNodeId)}
              />
            </ProjectDetailField>
          ))}
        </div>
      )}
    </ProjectDetailFormPanel>
  );
}
