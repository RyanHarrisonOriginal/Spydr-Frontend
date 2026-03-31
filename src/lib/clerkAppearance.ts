/**
 * Clerk theme aligned with app design: warm paper, primary blue, neo-brutal radius.
 * Use in ClerkProvider (global) and extend in SignIn/SignUp when needed.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "hsl(220, 85%, 55%)",
    colorBackground: "hsl(38, 20%, 99%)",
    colorInputBackground: "hsl(40, 10%, 94%)",
    colorText: "hsl(30, 10%, 15%)",
    colorTextSecondary: "hsl(30, 8%, 48%)",
    borderRadius: "0.625rem",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    card: "shadow-none border border-border rounded-lg bg-card",
    cardBox: "shadow-none",
    headerTitle: "text-foreground font-semibold",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton: "border-border bg-secondary hover:bg-muted text-foreground",
    formFieldLabel: "text-foreground",
    formFieldInput: "border-border bg-background text-foreground",
    footerActionLink: "text-primary hover:text-primary/90",
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground",
  },
};
