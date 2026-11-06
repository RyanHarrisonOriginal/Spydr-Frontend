import { DatePicker } from "@/components/ui/date-picker";
import { dueFromValue } from "@/domain/spydr/features/work/components/WorkDueDisplay";
import type {
  PersonNode,
  ProjectAreaNode,
  ProjectPersonas,
  SpydrPriority,
} from "@/domain/spydr/utils/types";
import type { ProjectPersonaRole } from "@/domain/spydr/utils/projectPersonas";
import { cn } from "@/lib/utils";
import { PersonSelect } from "./PersonSelect";
import { ProjectAreaSelect } from "./ProjectAreaSelect";
import { ProjectPrioritySelect } from "./ProjectPrioritySelect";
import { ProjectStatusSelect } from "./ProjectStatusSelect";

const propTriggerClass =
  "project-detail-prop-trigger h-auto min-h-0 w-full justify-start border-0 bg-transparent px-0 shadow-none hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:ring-0";

interface ProjectDetailPropertiesProps {
  status: string;
  priority: string;
  riskLevel: SpydrPriority;
  areas: ProjectAreaNode[];
  areaNodeId: string;
  people: PersonNode[];
  personas: ProjectPersonas;
  startDate: string;
  targetDate: string;
  isUpdatingStatus?: boolean;
  isUpdatingArea?: boolean;
  isUpdatingPersona?: boolean;
  onStatusChange(status: string): void;
  onPriorityChange(priority: string): void;
  onRiskChange(risk: SpydrPriority): void;
  onAreaChange(areaNodeId: string | null): void;
  onStartDateChange(value: string): void;
  onTargetDateChange(value: string): void;
  onPersonaChange(role: ProjectPersonaRole, personNodeId: string | null): void;
}

function PropRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="project-detail-prop-row">
      <span className="project-detail-prop-label">{label}</span>
      <div className="project-detail-prop-value">{children}</div>
    </div>
  );
}

export function ProjectDetailProperties({
  status,
  priority,
  riskLevel,
  areas,
  areaNodeId,
  people,
  personas,
  startDate,
  targetDate,
  isUpdatingStatus = false,
  isUpdatingArea = false,
  isUpdatingPersona = false,
  onStatusChange,
  onPriorityChange,
  onRiskChange,
  onAreaChange,
  onStartDateChange,
  onTargetDateChange,
  onPersonaChange,
}: ProjectDetailPropertiesProps) {
  const targetDue = dueFromValue(targetDate || null);
  const priorityIsDefault = priority === "medium";
  const riskIsDefault = riskLevel === "medium";

  const personaRows: Array<{ role: ProjectPersonaRole; label: string }> = [
    { role: "assignee", label: "Assignee" },
    { role: "requester", label: "Requester" },
    { role: "sponsor", label: "Sponsor" },
    { role: "reviewer", label: "Reviewer" },
  ];

  return (
    <aside className="project-detail-props project-detail-panel">
      <h2 className="project-detail-props-heading">Properties</h2>

      <div className="project-detail-props-group">
        <PropRow label="Status">
          <ProjectStatusSelect
            value={status}
            onChange={onStatusChange}
            disabled={isUpdatingStatus}
            quiet
            fitContent
            className={propTriggerClass}
          />
        </PropRow>
        <PropRow label="Priority">
          <ProjectPrioritySelect
            value={priority}
            onChange={onPriorityChange}
            quiet
            fitContent
            className={cn(
              propTriggerClass,
              priorityIsDefault && "project-detail-prop-muted"
            )}
            ariaLabel="Project priority"
          />
        </PropRow>
        <PropRow label="Area">
          <ProjectAreaSelect
            areas={areas}
            value={areaNodeId}
            onChange={onAreaChange}
            disabled={isUpdatingArea}
            quiet
            fitContent
            className={cn(
              propTriggerClass,
              !areaNodeId && "project-detail-prop-empty"
            )}
          />
        </PropRow>
        <PropRow label="Risk">
          <ProjectPrioritySelect
            value={riskLevel}
            onChange={(next) => onRiskChange(next as SpydrPriority)}
            quiet
            fitContent
            menuLabel="Risk"
            ariaLabel="Project risk"
            className={cn(
              propTriggerClass,
              riskIsDefault && "project-detail-prop-muted"
            )}
          />
        </PropRow>
      </div>

      <hr className="project-detail-props-divider" />

      <div className="project-detail-props-group">
        <PropRow label="Start">
          <DatePicker
            value={startDate || null}
            onChange={(next) => onStartDateChange(next ?? "")}
            variant="compact"
            showChevron={false}
            showIcon={false}
            placeholder="Set date"
            panelLabel="Start date"
            clearLabel="Clear start date"
            ariaLabel="Project start date"
            fitContent
            className={cn(
              propTriggerClass,
              !startDate && "project-detail-prop-empty"
            )}
          />
        </PropRow>
        <PropRow label="Target">
          <div className="flex min-w-0 flex-wrap items-baseline gap-2">
            <DatePicker
              value={targetDate || null}
              onChange={(next) => onTargetDateChange(next ?? "")}
              variant="compact"
              showChevron={false}
              showIcon={false}
              placeholder="Set date"
              panelLabel="Target date"
              clearLabel="Clear target date"
              ariaLabel="Project target date"
              fitContent
              className={cn(
                propTriggerClass,
                "project-detail-prop-mono",
                !targetDate && "project-detail-prop-empty"
              )}
            />
            {targetDate && targetDue.overdue ? (
              <span className="project-detail-meta-late font-mono text-[12px]">
                {targetDue.label}
              </span>
            ) : null}
          </div>
        </PropRow>
      </div>

      <hr className="project-detail-props-divider" />

      <div className="project-detail-props-group">
        {personaRows.map(({ role, label }) => {
          const person = personas[role];
          return (
            <PropRow key={role} label={label}>
              <PersonSelect
                people={people}
                value={person?.id ?? null}
                disabled={isUpdatingPersona}
                compact
                fitContent
                hideChevron
                ariaLabel={label}
                className="w-full"
                triggerClassName={cn(
                  propTriggerClass,
                  !person && "project-detail-prop-empty"
                )}
                onChange={(personNodeId) => onPersonaChange(role, personNodeId)}
              />
            </PropRow>
          );
        })}
      </div>
    </aside>
  );
}
