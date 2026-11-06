import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { UserButton } from "@clerk/react";
import { clerkUserButtonProps } from "@/lib/clerkAppearance";
import { SpydrMark } from "@/components/SpydrMark";
import { OrganizationSwitcher } from "@/domain/spydr/features/organizations/components/OrganizationSwitcher";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import { formatPerson } from "@/domain/spydr/utils/projectPersonas";
import { workPersonPath } from "@/domain/spydr/features/work/utils/workPaths";
import "../shell-chrome.css";

export function TopBar() {
  const { currentUserPerson, currentUserPersonId } = useCurrentUserPerson();
  const me = currentUserPerson
    ? formatPerson(currentUserPerson, currentUserPersonId)
    : null;

  return (
    <header className="shell-topbar z-30 flex h-12 shrink-0 items-center gap-2 px-3 md:gap-3 md:px-4">
      <Link
        to="/today"
        className="flex shrink-0 items-center gap-1.5 md:hidden"
        aria-label="Spydr home"
      >
        <SpydrMark size={22} className="shrink-0" />
      </Link>
      <OrganizationSwitcher />

      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        {currentUserPerson && me ? (
          <Link
            to={workPersonPath(currentUserPerson.id)}
            className="hidden items-center gap-2 rounded-lg px-1.5 py-1 text-[13px] font-medium text-[var(--fg)] transition-colors hover:bg-[var(--surface-hover)] ring-focus sm:inline-flex"
          >
            <span className="shell-topbar-avatar" aria-hidden>
              {me.initials}
            </span>
            <span className="max-w-[120px] truncate text-[var(--muted)]">
              {me.label}
            </span>
          </Link>
        ) : null}
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--fg)] ring-focus"
        >
          <Bell className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
        <UserButton
          {...clerkUserButtonProps({
            avatarBox: "h-5 w-5 rounded-full border-0 shadow-[inset_0_0_0_1px_#262B33] bg-[#1A1E25]",
            userButtonAvatarBox: "h-5 w-5 rounded-full border-0",
          })}
        />
      </div>
    </header>
  );
}
