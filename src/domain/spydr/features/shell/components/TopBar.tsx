import { Bell, Search } from "lucide-react";
import { UserButton } from "@clerk/react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <div className="group flex h-8 w-full max-w-xl items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 text-left text-[13px] text-muted-foreground">
        <Search className="h-3.5 w-3.5 opacity-70" />
        <span>Search and capture are coming with the Today work.</span>
        <span className="ml-auto hidden items-center gap-1 sm:flex">
          <span className="kbd">⌘</span>
          <span className="kbd">K</span>
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-muted/40 text-muted-foreground row-hover ring-focus">
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
