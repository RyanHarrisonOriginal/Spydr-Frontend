import { SignUp } from "@clerk/react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { clerkAppearance } from "@/lib/clerkAppearance";

const nodeTeaserTypes = [
  { label: "Thought", badgeClass: "node-badge-thought" },
  { label: "Idea", badgeClass: "node-badge-idea" },
  { label: "Project", badgeClass: "node-badge-project" },
] as const;

export default function SignUpScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,720px)] h-[min(80vh,560px)] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }}
        aria-hidden
      />

      <header className="relative z-10 h-16 border-b border-border flex items-center justify-between px-6 md:px-10 bg-card/80 backdrop-blur-sm sticky top-0">
        <Logo size="sm" />
        <Link
          to="/sign-in"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign in
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 p-6 md:p-12 min-h-[calc(100vh-4rem)]">
        <section className="w-full max-w-md md:max-w-sm text-center md:text-left order-2 md:order-1">
          <div className="flex justify-center md:justify-start mb-5">
            <Logo size="xl" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-2">
            Start your map
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Thoughts, projects, notes—one canvas. Create an account and grow it from here.
          </p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {nodeTeaserTypes.map(({ label, badgeClass }) => (
              <span key={label} className={`node-badge ${badgeClass}`}>
                {label}
              </span>
            ))}
          </div>
        </section>

        <section className="w-full max-w-md flex flex-col items-center order-1 md:order-2" data-clerk-sign-up-container>
          <SignUp
            fallbackRedirectUrl="/"
            signInUrl="/sign-in"
            appearance={{
              ...clerkAppearance,
              elements: {
                ...(clerkAppearance.elements ?? {}),
                rootBox: "mx-auto w-full",
                card: "shadow-none border border-border rounded-lg bg-card w-full",
              },
            }}
          />
        </section>
      </main>
    </div>
  );
}
