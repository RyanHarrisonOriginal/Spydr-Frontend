import { useLayoutEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { PersonNode } from "@/domain/spydr/utils/types";
import { personDisplayName, personGivenName, personInitials } from "@/domain/spydr/utils/projectPersonas";
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
  sm: "h-6 w-6 text-[9px] tracking-tight",
  md: "h-8 w-8 text-[10px] tracking-tight",
  lg: "h-10 w-10 text-[11px] tracking-tight",
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
      {personInitials(person)}
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

interface PersonNameFitProps {
  person: PersonNode;
  you?: boolean;
  className?: string;
  /** What to show when the full name does not fit the slot. */
  whenTight?: "given" | "initials";
}

/**
 * Spells the full name when the slot can hold it.
 * `given` uses a container breakpoint. `initials` measures the name against
 * the slot, so a short name stays whole in a narrower column.
 * The slot must have a defined width (flex-1 / grid track).
 */
export function PersonNameFit({
  person,
  you = false,
  className,
  whenTight = "given",
}: PersonNameFitProps) {
  const full = personDisplayName(person);
  const given = personGivenName(person) || full;
  const suffix = you ? " (You)" : "";
  const title = `${full}${suffix}`;

  if (whenTight === "initials") {
    return (
      <MeasuredPersonName
        full={title}
        initials={personInitials(person)}
        className={className}
      />
    );
  }

  return (
    <span className={cn("person-name-fit", className)} title={title}>
      <span className="person-name-fit__full">
        {full}
        {suffix}
      </span>
      <span className="person-name-fit__given">
        {given}
        {suffix}
      </span>
    </span>
  );
}

function MeasuredPersonName({
  full,
  initials,
  className,
}: {
  full: string;
  initials: string;
  className?: string;
}) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const [tight, setTight] = useState(false);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const probe = document.createElement("span");
    probe.textContent = full;
    probe.setAttribute("aria-hidden", "true");
    probe.style.position = "fixed";
    probe.style.left = "0";
    probe.style.top = "0";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.style.whiteSpace = "nowrap";
    probe.style.width = "max-content";
    probe.style.font = getComputedStyle(box).font;
    document.body.appendChild(probe);

    const fit = () => {
      setTight(probe.offsetWidth > box.clientWidth + 1);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => {
      observer.disconnect();
      probe.remove();
    };
  }, [full]);

  return (
    <span
      ref={boxRef}
      className={cn("block min-w-0 truncate", className)}
      title={full}
    >
      {tight ? initials : full}
    </span>
  );
}
