import { FileText } from "lucide-react";
import type { NoteNode } from "@/domain/spydr/utils/types";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";

interface NoteListProps {
  notes: NoteNode[];
}

export function NoteList({ notes }: NoteListProps) {
  return (
    <ul className="divide-y divide-border">
      {notes.map((note) => (
        <li key={note.id} className="flex items-start gap-4 px-6 py-4 row-hover">
          <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="truncate text-[13.5px] font-medium">{note.title}</h2>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {formatRelativeTime(note.updatedAt)}
              </span>
            </div>
            {note.body && (
              <p className="mt-1 truncate text-[12.5px] text-muted-foreground">
                {note.body}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
