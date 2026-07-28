import { dark } from "@clerk/ui/themes";

/**
 * Clerk appearance — charcoal void aligned with Spydr tokens.
 *
 * Important: in dark mode, `colorNeutral` must stay light (near-white).
 * Clerk mixes borders/hovers from it; a dark neutral inverts the UI.
 */
export const clerkAppearance = {
  theme: dark,
  variables: {
    // Crimson action (Spydr --primary)
    colorPrimary: "#cd2d4d",
    colorPrimaryForeground: "#ffffff",

    // Match page canvas — avoid a lighter floating panel
    colorBackground: "#0a0c0f",
    colorInput: "#111318",
    colorInputForeground: "#e2e5eb",
    colorMuted: "#14171c",

    // Type
    colorForeground: "#e2e5eb",
    colorMutedForeground: "#7a808c",

    // Light neutral so Clerk can derive dark-theme borders/hovers
    colorNeutral: "#e2e5eb",
    colorBorder: "#1f2228",
    colorShadow: "#000000",
    colorRing: "#308cfc",

    colorDanger: "#df3430",
    colorSuccess: "#3d9a6e",
    colorWarning: "#c4923a",
    colorModalBackdrop: "rgba(8, 10, 14, 0.78)",

    borderRadius: "0.375rem",
    fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
    fontFamilyMono: "var(--font-mono), ui-monospace, monospace",
    fontSize: "0.8125rem",
  },
  elements: {
    rootBox: "font-sans w-full",
    logoBox: "hidden",
    logoImage: "hidden",
    card: "shadow-none border border-border/80 rounded-md bg-background",
    cardBox: "shadow-none",
    headerTitle: "text-foreground font-semibold tracking-tight",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton:
      "border-border bg-muted/40 text-foreground shadow-none hover:bg-muted/70",
    socialButtonsBlockButtonText: "text-foreground",
    formFieldLabel:
      "text-muted-foreground font-mono text-[10px] uppercase tracking-[0.14em]",
    formFieldInput:
      "border-border bg-card text-foreground shadow-none placeholder:text-muted-foreground/60",
    formFieldInputShowPasswordButton:
      "text-muted-foreground hover:text-foreground",
    footer: "!bg-transparent",
    footerAction: "!bg-transparent",
    footerActionText: "text-muted-foreground",
    footerActionLink: "!text-[hsl(var(--highlight))] hover:!text-[hsl(var(--highlight)/0.9)]",
    formButtonPrimary:
      "!bg-primary !text-primary-foreground shadow-none hover:!bg-primary/90",
    dividerLine: "bg-border",
    dividerText:
      "text-muted-foreground font-mono text-[10px] uppercase tracking-[0.14em]",
    identityPreviewEditButton:
      "!text-[hsl(var(--highlight))] hover:!text-[hsl(var(--highlight)/0.9)]",
    formFieldErrorText: "text-destructive",
    alertText: "text-foreground",
    // UserButton / account menu
    userButtonPopoverCard: "border border-border !bg-popover shadow-md",
    userButtonPopoverMain: "!bg-popover",
    userButtonPopoverFooter: "!bg-muted/40 border-t border-border",
    userButtonPopoverActionButton: "text-foreground hover:!bg-muted",
    userButtonPopoverActionButtonText: "text-foreground",
    userButtonPopoverActionButtonIcon: "text-muted-foreground",
    userPreviewMainIdentifier: "text-foreground",
    userPreviewSecondaryIdentifier: "text-muted-foreground",
  },
};
