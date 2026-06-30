interface CollectionNoResultsProps {
  noun: string;
  onClearFilters(): void;
}

export function CollectionNoResults({ noun, onClearFilters }: CollectionNoResultsProps) {
  return (
    <div className="px-6 py-10 text-center">
      <p className="text-[13px] font-medium text-foreground/90">
        No {noun} match your filters
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="mt-2 text-[12px] text-primary hover:underline"
      >
        Clear filters
      </button>
    </div>
  );
}
