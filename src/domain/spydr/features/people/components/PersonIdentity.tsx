import { Sparkles } from "lucide-react";
import type { PersonNode } from "@/domain/spydr/utils/types";
import { personDisplayName, personInitial } from "@/domain/spydr/utils/projectPersonas";
import { useCurrentUserPerson } from "../context/CurrentUserPersonContext";
import { cn } from "@/lib/utils";

interface PersonMeBadgeProps {
  className?: string;
  compact?: boolean;
}

export function PersonMeBadge({ className, compact = false }: PersonMeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border border-highlight/40 bg-highlight/12 font-mono uppercase tracking-[0.14em] text-highlight shadow-[0_0_16px_hsl(var(--highlight)/0.12)]",
        compact ? "px-1.5 py-px text-[8px]" : "px-2 py-0.5 text-[9px]",
        className
      )}
    >
      <Sparkles className={compact ? "h-2 w-2" : "h-2.5 w-2.5"} aria-hidden />
      You
    </span>
  );
}

interface PersonAvatarProps {
  person: PersonNode | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const avatarSizeClass: Record<NonNullable<PersonAvatarProps["size"]>, string> = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-[11px]",
  lg: "h-10 w-10 text-[12px]",
};

export function PersonAvatar({
  person,
  className,
  size = "md",
}: PersonAvatarProps) {
  const { isMe } = useCurrentUserPerson();
  const isCurrentUser = isMe(person);

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-border bg-muted/40 font-mono font-medium text-foreground/80",
        avatarSizeClass[size],
        isCurrentUser && "person-me-avatar border-highlight/50 bg-highlight/10 text-highlight",
        className
      )}
      aria-label={isCurrentUser ? "Your profile avatar" : undefined}
    >
      {personInitial(person)}
    </span>
  );
}

interface PersonIdentityLabelProps {
  person: PersonNode | null | undefined;
  className?: string;
  showBadge?: boolean;
}

export function PersonIdentityLabel({
  person,
  className,
  showBadge = true,
}: PersonIdentityLabelProps) {
  const { isMe } = useCurrentUserPerson();
  const isCurrentUser = isMe(person);

  if (!person) return null;

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      <span className={cn("truncate", isCurrentUser && "text-highlight")}>
        {personDisplayName(person)}
      </span>
      {showBadge && isCurrentUser ? <PersonMeBadge compact /> : null}
    </span>
  );
}

export function personSelectLabel(
  person: PersonNode,
  isMe: (personOrId: PersonNode | string | null | undefined) => boolean
): string {
  const name = personDisplayName(person);
  return isMe(person) ? `${name} (You)` : name;
}
