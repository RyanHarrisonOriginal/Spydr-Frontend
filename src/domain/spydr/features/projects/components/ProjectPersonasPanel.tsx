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
    <ProjectDetailFormPanel label="People">
      {people.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/80 bg-muted/10 px-3 py-4 text-center">
          <p className="text-[12px] text-muted-foreground">
            No people in your workspace yet.
          </p>
          <Link to="/people" className="mt-1 inline-block text-[12px] text-primary hover:underline">
            Add people to assign roles
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projectPersonaRoles.map((role) => (
            <ProjectDetailField
              key={role}
              label={projectPersonaLabels[role]}
              hint={projectPersonaHints[role]}
            >
              <PersonSelect
                people={people}
                value={personas[role]?.id ?? null}
                disabled={disabled}
                ariaLabel={projectPersonaLabels[role]}
                onChange={(personNodeId) => onChange(role, personNodeId)}
              />
            </ProjectDetailField>
          ))}
        </div>
      )}
    </ProjectDetailFormPanel>
  );
}
