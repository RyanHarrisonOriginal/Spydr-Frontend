/**
 * Clerk theme — charcoal void, electric-blue signal, crimson action.
 * Matches the Spydr tactical surface (dark by default).
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "hsl(351, 64%, 49%)",
    colorBackground: "hsl(222, 14%, 10%)",
    colorInputBackground: "hsl(222, 16%, 7%)",
    colorText: "hsl(220, 14%, 92%)",
    colorTextSecondary: "hsl(220, 9%, 56%)",
    colorDanger: "hsl(2, 74%, 54%)",
    colorInputText: "hsl(220, 14%, 92%)",
    colorNeutral: "hsl(220, 12%, 16%)",
    borderRadius: "0.375rem",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    card: "shadow-none border border-border rounded-md bg-card",
    cardBox: "shadow-none",
    headerTitle: "text-foreground font-semibold tracking-tight",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton:
      "border-border bg-secondary hover:bg-muted text-foreground shadow-none",
    formFieldLabel: "text-foreground font-mono text-[10px] uppercase tracking-[0.14em]",
    formFieldInput:
      "border-border bg-background text-foreground shadow-none ring-offset-background",
    footerActionLink: "text-highlight hover:text-highlight/90",
    formButtonPrimary:
      "bg-primary hover:bg-primary/90 text-primary-foreground shadow-none",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground font-mono text-[10px] uppercase tracking-[0.14em]",
  },
};
