import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { UserButton } from "@clerk/react";
import { OrganizationSwitcher } from "@/domain/spydr/features/organizations/components/OrganizationSwitcher";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import { PersonMeBadge } from "@/domain/spydr/features/people/components/PersonIdentity";
import { personDisplayName } from "@/domain/spydr/utils/projectPersonas";

export function TopBar() {
  const { currentUserPerson } = useCurrentUserPerson();

  return (
    <header className="z-30 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-sm">
      <OrganizationSwitcher />

      <div className="ml-auto flex items-center gap-2">
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
          className="grid h-8 w-8 place-items-center rounded-sm border border-border bg-muted/20 text-muted-foreground transition-colors hover:border-highlight/30 hover:text-foreground ring-focus"
        >
          <Bell className="h-3.5 w-3.5" />
        </button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-7 w-7 rounded-sm border border-border",
              userButtonPopoverCard:
                "border border-border bg-popover shadow-md",
              userButtonPopoverActionButton:
                "text-foreground hover:bg-muted",
            },
          }}
        />
      </div>
    </header>
  );
}
