import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface LogChildEditValues {
  title: string;
  body: string;
}

interface LogChildEditDialogProps {
  open: boolean;
  heading: string;
  titleLabel?: string;
  bodyLabel?: string;
  titleOptional?: boolean;
  values: LogChildEditValues;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: LogChildEditValues) => void;
}

export function LogChildEditDialog({
  open,
  heading,
  titleLabel = "Title",
  bodyLabel = "Body",
  titleOptional = false,
  values,
  isSaving = false,
  onOpenChange,
  onSave,
}: LogChildEditDialogProps) {
  const [draft, setDraft] = useState(values);

  useEffect(() => {
    if (open) setDraft(values);
  }, [open, values]);

  const canSave = titleOptional || draft.title.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{heading}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground">{titleLabel}</label>
            <Input
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              placeholder={titleOptional ? "Optional" : undefined}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground">{bodyLabel}</label>
            <Textarea
              value={draft.body}
              onChange={(event) =>
                setDraft((current) => ({ ...current, body: event.target.value }))
              }
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSave || isSaving}
            onClick={() => onSave(draft)}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
