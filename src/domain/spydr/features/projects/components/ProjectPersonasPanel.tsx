import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsPhone } from "@/hooks/useIsPhone";
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
  onChange(role: ProjectPersonaRole, personNodeId: string | null): void;
}

export function ProjectPersonasPanel({
  people,
  personas,
  disabled = false,
  compact = false,
  onChange,
}: ProjectPersonasPanelProps) {
  const isPhone = useIsPhone();
  const tight = compact || isPhone;

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
    <div
      className={cn(
        "grid gap-x-3 gap-y-2",
        tight ? "grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"
      )}
    >
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
  );
}
