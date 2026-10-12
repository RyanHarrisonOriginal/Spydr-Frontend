import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTasksQuery } from "@/domain/spydr/features/shared/hooks/queries";
import {
  followUpIsoToLocal,
  followUpLocalToIso,
  type TaskStatus,
  type TaskStatusChange,
} from "@/domain/spydr/utils/taskStatus";
import { cn } from "@/lib/utils";

interface TaskStatusContextDialogProps {
  open: boolean;
  status: Extract<TaskStatus, "blocked" | "waiting">;
  excludeTaskId?: string;
  initialBlockedByTaskId?: string | null;
  initialFollowUpAt?: string | null;
  initialWaitingNote?: string | null;
  onOpenChange(open: boolean): void;
  onConfirm(change: TaskStatusChange): void;
}

export function TaskStatusContextDialog({
  open,
  status,
  excludeTaskId,
  initialBlockedByTaskId,
  initialFollowUpAt,
  initialWaitingNote,
  onOpenChange,
  onConfirm,
}: TaskStatusContextDialogProps) {
  const tasksQuery = useTasksQuery();
  const [query, setQuery] = useState("");
  const [blockedByTaskId, setBlockedByTaskId] = useState(initialBlockedByTaskId ?? "");
  const [followUpLocal, setFollowUpLocal] = useState(followUpIsoToLocal(initialFollowUpAt));
  const [waitingNote, setWaitingNote] = useState(initialWaitingNote ?? "");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setBlockedByTaskId(initialBlockedByTaskId ?? "");
    setFollowUpLocal(followUpIsoToLocal(initialFollowUpAt));
    setWaitingNote(initialWaitingNote ?? "");
  }, [open, initialBlockedByTaskId, initialFollowUpAt, initialWaitingNote]);

  const tasks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (tasksQuery.data ?? []).filter((task) => {
      if (task.id === excludeTaskId) return false;
      if (!needle) return true;
      return task.title.toLowerCase().includes(needle);
    });
  }, [excludeTaskId, query, tasksQuery.data]);

  const canConfirm =
    status === "blocked" ? blockedByTaskId.length > 0 : followUpLocal.length > 0;

  const confirm = () => {
    if (status === "blocked") {
      if (!blockedByTaskId) return;
      onConfirm({ status, blockedByTaskId });
      return;
    }
    const followUpAt = followUpLocalToIso(followUpLocal);
    if (!followUpAt) return;
    onConfirm({
      status,
      followUpAt,
      waitingNote: waitingNote.trim() ? waitingNote.trim() : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{status === "blocked" ? "Block this task" : "Mark as waiting"}</DialogTitle>
          <DialogDescription>
            {status === "blocked"
              ? "Choose the task that is blocking this one."
              : "Set when to follow up. A note is optional."}
          </DialogDescription>
        </DialogHeader>

        {status === "blocked" ? (
          <div className="grid gap-2">
            <Label htmlFor="blocker-search">Blocking task</Label>
            <Input
              id="blocker-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tasks"
            />
            <div className="max-h-56 overflow-y-auto rounded-md border border-border">
              {tasksQuery.isLoading ? (
                <p className="px-3 py-2 text-[12px] text-muted-foreground">Loading tasks…</p>
              ) : tasks.length === 0 ? (
                <p className="px-3 py-2 text-[12px] text-muted-foreground">No other tasks found.</p>
              ) : (
                tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    className={cn(
                      "block w-full truncate px-3 py-2 text-left text-[13px] hover:bg-muted/40",
                      task.id === blockedByTaskId && "bg-muted/60"
                    )}
                    onClick={() => setBlockedByTaskId(task.id)}
                  >
                    {task.title}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="follow-up-at">Follow-up time</Label>
              <Input
                id="follow-up-at"
                type="datetime-local"
                value={followUpLocal}
                onChange={(event) => setFollowUpLocal(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waiting-note">Note</Label>
              <Textarea
                id="waiting-note"
                value={waitingNote}
                onChange={(event) => setWaitingNote(event.target.value)}
                placeholder="What are you waiting on?"
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!canConfirm} onClick={confirm}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
