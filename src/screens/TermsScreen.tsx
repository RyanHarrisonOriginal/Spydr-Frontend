import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export default function TermsScreen() {
  return (
    <div className="spydr-atmosphere flex h-full flex-col overflow-y-auto text-foreground">
      <header className="spydr-rule spydr-glass sticky top-0 z-10 flex h-14 items-center justify-between border-b border-white/10 px-4 md:px-8">
        <Logo size="sm" />
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">Back</Link>
        </Button>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 md:px-8">
        <h1 className="mb-4 text-[32px] font-semibold tracking-[-0.02em]">
          Terms
        </h1>
        <p className="text-[16px] leading-relaxed text-foreground/75">
          These terms of use are a placeholder and will be replaced with
          Spydr&apos;s published terms. Until then, contact support for
          licensing questions.
        </p>
      </main>
    </div>
  );
}
