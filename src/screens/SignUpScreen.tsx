import { SignUp } from "@clerk/react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { WebField } from "@/components/WebField";
import { clerkAppearance } from "@/lib/clerkAppearance";
import { authRoutes } from "@/config/auth";

export default function SignUpScreen() {
  return (
    <div className="spydr-surface relative flex h-full flex-col overflow-y-auto bg-background">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[min(100%,42rem)] opacity-80"
        aria-hidden
      >
        <WebField className="h-full w-full" intensity="focus" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/55 to-transparent" />
      </div>

      <header className="relative z-10 sticky top-0 flex h-20 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm md:px-10">
        <Logo size="md" />
        <Link
          to="/sign-in"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign in
        </Link>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col items-center justify-center gap-14 p-8 md:flex-row md:gap-20 md:p-12">
        <section className="order-2 w-full max-w-sm text-center md:order-1 md:text-left">
          <Logo size="xl" className="mb-8 justify-center md:justify-start" />
          <h1 className="mb-3 text-2xl font-semibold tracking-[-0.03em] text-foreground md:text-[2rem]">
            Spin your web
          </h1>
          <p className="max-w-sm text-[14px] leading-relaxed text-muted-foreground">
            Projects, tasks, decisions, people&mdash;one connected surface.
            Create an account and start mapping it.
          </p>
        </section>

        <section
          className="order-1 flex w-full max-w-md flex-col items-center md:order-2"
          data-clerk-sign-up-container
        >
          <SignUp
            fallbackRedirectUrl="/"
            signInUrl={authRoutes.signInUrl}
            appearance={clerkAppearance}
          />
        </section>
      </main>
    </div>
  );
}
