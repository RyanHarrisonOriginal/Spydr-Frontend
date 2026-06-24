import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundScreen() {
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="text-center animate-reveal">
        <h1 className="text-2xl font-semibold tracking-tight">Not found</h1>
        <p className="text-muted-foreground mt-2 text-[15px]">This page does not exist.</p>
        <Button asChild className="mt-4">
          <Link to="/">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
