import type { ProjectAreaNode } from "@/domain/spydr/utils/types";
import {
  areaColorSurfaceStyle,
  resolveAreaColor,
} from "@/domain/spydr/utils/projectAreaColors";
import { AreaColorSwatch } from "./AreaColorSwatch";
import { ProjectListFieldSelect } from "./ProjectListFieldSelect";

interface ProjectAreaSelectProps {
  areas: ProjectAreaNode[];
  value: string;
  onChange(areaNodeId: string | null): void;
  disabled?: boolean;
  className?: string;
}

function findArea(areas: ProjectAreaNode[], areaId: string) {
  return areas.find((area) => area.id === areaId);
}

export function ProjectAreaSelect({
  areas,
  value,
  onChange,
  disabled = false,
  className,
}: ProjectAreaSelectProps) {
  const options = [
    { value: "", label: "Unassigned" },
    ...areas.map((area) => ({
      value: area.id,
      label: area.title,
    })),
  ];

  const hasValue = Boolean(value);
  const selectedColor = hasValue ? resolveAreaColor(findArea(areas, value)) : null;

  return (
    <ProjectListFieldSelect
      value={value}
      options={options}
      onChange={(next) => onChange(next ? next : null)}
      disabled={disabled}
      ariaLabel="Project area"
      menuLabel="Area"
      placeholder="Unassigned"
      emptyValue=""
      leading={
        hasValue && selectedColor ? (
          <AreaColorSwatch color={selectedColor} />
        ) : (
          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-dashed border-muted-foreground/40" />
        )
      }
      renderOptionLeading={(option) =>
        option.value ? (
          <AreaColorSwatch color={resolveAreaColor(findArea(areas, option.value))} />
        ) : (
          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-dashed border-muted-foreground/40" />
        )
      }
      triggerClassName={className}
      triggerStyle={
        hasValue && selectedColor ? areaColorSurfaceStyle(selectedColor) : undefined
      }
      labelClassName="font-medium tracking-tight text-foreground/90"
      getOptionStyle={(option, selected) => {
        if (!option.value) return undefined;
        const color = resolveAreaColor(findArea(areas, option.value));
        if (selected) {
          return areaColorSurfaceStyle(color);
        }
        return {
          backgroundColor: `hsl(${color} / 0.06)`,
        };
      }}
    />
  );
}
