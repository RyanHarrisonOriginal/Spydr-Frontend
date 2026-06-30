import { Bell, Search } from "lucide-react";
import { UserButton } from "@clerk/react";

export function TopBar() {
  return (
    <header className="z-30 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <button
        type="button"
        className="group flex h-8 w-full max-w-xl items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 text-left text-[13px] text-muted-foreground transition-colors hover:border-highlight/30 hover:bg-muted/50 ring-focus"
      >
        <Search className="h-3.5 w-3.5 opacity-70 transition-colors group-hover:text-highlight" />
        <span>Search the web&hellip; tasks, people, decisions.</span>
        <span className="ml-auto hidden items-center gap-1 sm:flex">
          <span className="kbd">⌘</span>
          <span className="kbd">K</span>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-muted/30 text-muted-foreground transition-colors hover:border-highlight/30 hover:text-foreground ring-focus">
          <Bell className="h-3.5 w-3.5" />
        </button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-7 w-7 border border-border",
            },
          }}
        />
      </div>
    </header>
  );
}
