import { Link } from "react-router-dom";
import { Show, UserButton, useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { clerkUserButtonProps } from "@/lib/clerkAppearance";

export function AuthControls() {
  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/sign-in">Sign in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/sign-up">Sign up</Link>
        </Button>
      </Show>
      <Show when="signed-in">
        <ProfileBadge />
      </Show>
    </div>
  );
}

function ProfileBadge() {
  const { user } = useUser();
  const display =
    user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "Account";

  return (
    <div className="flex items-center gap-2 rounded-md border border-border/50 bg-card/60 pl-1 pr-2 py-1">
      <UserButton
        {...clerkUserButtonProps({
          avatarBox: "h-8 w-8 rounded-sm border border-border",
          userButtonAvatarBox: "h-8 w-8 rounded-sm border border-border",
        })}
      />
      <span className="text-sm font-medium text-foreground/90 max-w-[140px] truncate">
        {display}
      </span>
    </div>
  );
}
