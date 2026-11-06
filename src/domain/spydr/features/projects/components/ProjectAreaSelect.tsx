import { cn } from "@/lib/utils";
import type { ProjectAreaNode } from "@/domain/spydr/utils/types";
import {
  areaColorSurfaceStyle,
  hslColorCss,
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
  appearance?: "field" | "rail";
  wrapLabel?: boolean;
  fitContent?: boolean;
  quiet?: boolean;
}

function findArea(areas: ProjectAreaNode[], areaId: string) {
  return areas.find((area) => area.id === areaId);
}

const quietTriggerClassName =
  "h-7 min-h-7 gap-2 rounded-md border-transparent bg-transparent px-1 shadow-none hover:border-transparent hover:bg-accent data-[state=open]:border-transparent data-[state=open]:bg-accent data-[state=open]:ring-0";

export function ProjectAreaSelect({
  areas,
  value,
  onChange,
  disabled = false,
  className,
  appearance = "field",
  wrapLabel = false,
  fitContent = false,
  quiet = false,
}: ProjectAreaSelectProps) {
  const options = [
    { value: "", label: "Unassigned" },
    ...areas.map((area) => ({
      value: area.id,
      label: area.title,
    })),
  ];

  const hasValue = Boolean(value);
  const selectedArea = hasValue ? findArea(areas, value) : undefined;
  const selectedColor = hasValue ? resolveAreaColor(selectedArea) : null;
  const areaName = selectedArea?.title ?? "Unassigned";

  return (
    <ProjectListFieldSelect
      value={value}
      options={options}
      onChange={(next) => onChange(next ? next : null)}
      disabled={disabled}
      appearance={appearance}
      ariaLabel={appearance === "rail" ? `Area: ${areaName}` : "Project area"}
      placeholder="Unassigned"
      emptyValue=""
      wrapLabel={wrapLabel}
      fitContent={fitContent}
      hideChevron={quiet}
      leading={
        appearance === "field" ? (
          hasValue && selectedColor ? (
            <AreaColorSwatch color={selectedColor} className="h-2 w-2 border-0 shadow-none" />
          ) : quiet ? null : (
            <span className="inline-block h-2 w-2 shrink-0 rounded-full border border-dashed border-muted-foreground/40" />
          )
        ) : null
      }
      renderOptionLeading={(option) =>
        option.value ? (
          <AreaColorSwatch
            color={resolveAreaColor(findArea(areas, option.value))}
            className="h-2 w-2 border-0 shadow-none"
          />
        ) : (
          <span className="inline-block h-2 w-2 shrink-0 rounded-full border border-dashed border-muted-foreground/40" />
        )
      }
      triggerClassName={cn(quiet && appearance === "field" && quietTriggerClassName, className)}
      triggerStyle={
        quiet
          ? undefined
          : appearance === "rail"
            ? selectedColor
              ? { backgroundColor: hslColorCss(selectedColor) }
              : undefined
            : hasValue && selectedColor
              ? areaColorSurfaceStyle(selectedColor)
              : undefined
      }
      labelClassName={
        quiet
          ? "text-[13px] font-normal normal-case text-muted-foreground"
          : "font-medium tracking-tight text-foreground/90"
      }
      contentClassName="p-1.5"
    />
  );
}
