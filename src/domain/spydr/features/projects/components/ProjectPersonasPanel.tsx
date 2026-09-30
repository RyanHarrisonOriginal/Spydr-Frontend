import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { PersonNode, ProjectPersonas } from "@/domain/spydr/utils/types";
import {
  projectPersonaHints,
  projectPersonaLabels,
  projectPersonaRoles,
  type ProjectPersonaRole,
} from "@/domain/spydr/utils/projectPersonas";
import { ProjectDetailField } from "./ProjectDetailSection";
import { PersonSelect } from "./PersonSelect";

interface ProjectPersonasPanelProps {
  people: PersonNode[];
  personas: ProjectPersonas;
  disabled?: boolean;
  compact?: boolean;
  controlClassName?: string;
  onChange(role: ProjectPersonaRole, personNodeId: string | null): void;
}

export function ProjectPersonasPanel({
  people,
  personas,
  disabled = false,
  compact = false,
  controlClassName,
  onChange,
}: ProjectPersonasPanelProps) {
  if (people.length === 0) {
    return (
      <p className="text-[12px] text-muted-foreground">
        No people in your workspace yet.{" "}
        <Link to="/work" className="text-primary hover:underline">
          Add people to assign roles
        </Link>
      </p>
    );
  }

  return (
    <div className="personas-fit min-w-0">
      <div
        className={cn(
          "personas-fit__grid",
          compact && "personas-fit__grid--two"
        )}
      >
        {projectPersonaRoles.map((role) => (
          <ProjectDetailField
            key={role}
            label={projectPersonaLabels[role]}
            className="min-w-0 space-y-1 [&_.detail-field-hint]:sr-only"
            hint={projectPersonaHints[role]}
          >
            <PersonSelect
              people={people}
              value={personas[role]?.id ?? null}
              disabled={disabled}
              compact
              whenTight="initials"
              className="min-w-0"
              triggerClassName={cn(controlClassName, "w-full min-w-0")}
              ariaLabel={`${projectPersonaLabels[role]} — ${projectPersonaHints[role]}`}
              onChange={(personNodeId) => onChange(role, personNodeId)}
            />
          </ProjectDetailField>
        ))}
      </div>
    </div>
  );
}
