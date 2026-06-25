import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreatePersonDialogProps {
  open: boolean;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onOpenChange(open: boolean): void;
  onSubmit(values: {
    fullName: string;
    email: string;
    title: string;
    organization: string;
  }): void;
}

const fieldClassName =
  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-[13px] ring-focus";

export function CreatePersonDialog({
  open,
  isSubmitting = false,
  errorMessage = null,
  onOpenChange,
  onSubmit,
}: CreatePersonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1.5 text-[12px]">
          <Plus className="h-3.5 w-3.5" />
          New person
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md gap-3 p-4">
        <DialogHeader>
          <DialogTitle className="text-base">Add person</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            onSubmit({
              fullName: String(data.get("fullName") ?? ""),
              email: String(data.get("email") ?? ""),
              title: String(data.get("title") ?? ""),
              organization: String(data.get("organization") ?? ""),
            });
          }}
        >
          <label className="block space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Full name
            </span>
            <input name="fullName" required className={fieldClassName} placeholder="Jane Doe" />
          </label>
          <label className="block space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Email
            </span>
            <input name="email" type="email" className={fieldClassName} placeholder="jane@org.com" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Title
              </span>
              <input name="title" className={fieldClassName} placeholder="Product lead" />
            </label>
            <label className="block space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Organization
              </span>
              <input name="organization" className={fieldClassName} placeholder="Acme" />
            </label>
          </div>
          {errorMessage ? (
            <p className="text-[12px] text-destructive">{errorMessage}</p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add person"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
