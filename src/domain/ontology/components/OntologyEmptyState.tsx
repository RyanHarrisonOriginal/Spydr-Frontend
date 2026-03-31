import { Plus } from "lucide-react";

interface OntologyEmptyStateProps {
  onCreate: () => void;
}

export function OntologyEmptyState({ onCreate }: OntologyEmptyStateProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCreate();
        }
      }}
      className="group border border-dashed border-border/60 rounded-xl p-16 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/30 hover:bg-primary/[0.015] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 transition-all duration-300 animate-subtle-rise"
      onClick={onCreate}
    >
      {/* Yin-yang nod: two circles, one solid one soft */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-foreground/30 group-hover:bg-primary/50 transition-colors" />
        <div className="w-14 h-14 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-muted/80 transition-colors">
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>
        <span className="w-2 h-2 rounded-full bg-foreground/10 group-hover:bg-primary/30 transition-colors" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">New ontology</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-1">
        Start organizing thoughts, ideas, and projects into meaningful structures.
      </p>
      <p className="text-xs text-muted-foreground/80 max-w-sm leading-relaxed">
        Click to create your first map—a place for concepts to take shape.
      </p>
    </div>
  );
}
