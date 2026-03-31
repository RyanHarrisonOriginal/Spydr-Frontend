import { ArrowRight, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface OntologyCardItem {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  nodeCount?: number;
  typeDistribution?: Record<string, number>;
}

interface OntologyCardProps {
  ontology: OntologyCardItem;
  onOpen: (ontology: OntologyCardItem) => void;
  onEdit: (ontology: OntologyCardItem) => void;
  onDelete: (id: string) => void;
  updatedLabel: string;
  /** Returns CSS color (e.g. hsl(...)) for a node type id; used for distribution bar */
  getTypeColor?: (typeId: string) => string;
  animationDelay?: number;
}

export function OntologyCard({
  ontology,
  onOpen,
  onEdit,
  onDelete,
  updatedLabel,
  getTypeColor,
  animationDelay = 0,
}: OntologyCardProps) {
  const nodeCount = ontology.nodeCount ?? 0;
  const distribution = ontology.typeDistribution
    ? Object.entries(ontology.typeDistribution).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <Card
      className={cn(
        "group p-5 cursor-pointer hover:shadow-md hover:border-border/60 transition-all duration-300 animate-subtle-rise card-interactive relative overflow-hidden"
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={() => onOpen(ontology)}
    >
      <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-primary/0 group-hover:bg-primary/40 transition-colors duration-300 rounded-full opacity-0 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-medium text-foreground group-hover:text-primary transition-colors duration-200 truncate tracking-tight mb-2">
            {ontology.name}
          </h3>
          {nodeCount > 0 && distribution.length > 0 && getTypeColor && (
            <div className="flex items-center gap-3 mb-2.5">
              <div className="flex h-1.5 rounded-full overflow-hidden flex-1 max-w-[180px] bg-muted/50">
                {distribution.map(([typeId, count]) => (
                  <div
                    key={typeId}
                    className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-200"
                    style={{
                      width: `${(count / nodeCount) * 100}%`,
                      backgroundColor: getTypeColor(typeId),
                      opacity: 0.85,
                    }}
                    title={`${typeId}: ${count}`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground/60 tabular-nums shrink-0">
                {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
              </span>
            </div>
          )}
          {ontology.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-1.5 leading-relaxed">
              {ontology.description}
            </p>
          ) : null}
          <span className="text-[11px] text-muted-foreground/50">{updatedLabel}</span>
        </div>
        <div className="flex items-center gap-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
          <ArrowRight className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all duration-200" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(ontology)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(ontology.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
