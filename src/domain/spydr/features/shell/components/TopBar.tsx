import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { UserButton } from "@clerk/react";
import { clerkUserButtonProps } from "@/lib/clerkAppearance";
import { SpydrMark } from "@/components/SpydrMark";
import { OrganizationSwitcher } from "@/domain/spydr/features/organizations/components/OrganizationSwitcher";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import { PersonMeBadge } from "@/domain/spydr/features/people/components/PersonIdentity";
import { personDisplayName } from "@/domain/spydr/utils/projectPersonas";

export function TopBar() {
  const { currentUserPerson } = useCurrentUserPerson();

  return (
    <header className="spydr-rule z-30 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur-sm md:gap-3 md:px-4">
      <Link
        to="/active-note"
        className="flex shrink-0 items-center gap-1.5 md:hidden"
        aria-label="Spydr home"
      >
        <SpydrMark size={32} className="shrink-0" />
      </Link>
      <OrganizationSwitcher />

      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        {currentUserPerson ? (
          <Link
            to={`/people/${currentUserPerson.id}`}
            className="hidden items-center gap-1.5 rounded-sm border border-highlight/25 bg-highlight/6 px-2 py-1 text-[11px] text-highlight transition-colors hover:border-highlight/40 hover:bg-highlight/10 sm:inline-flex"
          >
            <PersonMeBadge compact />
            <span className="max-w-[120px] truncate">
              {personDisplayName(currentUserPerson)}
            </span>
          </Link>
        ) : null}
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-sm border border-border bg-muted/20 text-muted-foreground transition-colors hover:border-highlight/30 hover:text-foreground ring-focus md:h-8 md:w-8"
        >
          <Bell className="h-3.5 w-3.5" />
        </button>
        <UserButton
          {...clerkUserButtonProps({
            avatarBox: "h-7 w-7 rounded-sm border border-border",
            userButtonAvatarBox: "h-7 w-7 rounded-sm border border-border",
          })}
        />
      </div>
    </header>
  );
}
