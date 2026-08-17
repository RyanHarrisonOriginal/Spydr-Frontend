import { dark } from "@clerk/ui/themes";
import type { Appearance } from "@clerk/ui";

/**
 * Clerk appearance — charcoal void aligned with Spydr tokens.
 *
 * Covers every Clerk surface (SignIn/SignUp, UserButton, UserProfile,
 * verification, org chrome, billing, waitlist, session tasks) so nested
 * components opened from another component stay on-theme.
 *
 * Important: in dark mode, `colorNeutral` must stay light (near-white).
 * Clerk mixes borders/hovers from it; a dark neutral inverts the UI.
 */
const spydr = {
  background: "#0a0c0f",
  card: "#111318",
  popover: "#111318",
  sidebar: "#080a0e",
  foreground: "#e2e5eb",
  muted: "#14171c",
  mutedForeground: "#7a808c",
  border: "#1f2228",
  primary: "#cd2d4d",
  primaryForeground: "#ffffff",
  highlight: "#308cfc",
  highlightMuted: "rgba(48, 140, 252, 0.10)",
  danger: "#df3430",
  success: "#3d9a6e",
  warning: "#c4923a",
  shadow: "#000000",
  modalBackdrop: "rgba(8, 10, 14, 0.78)",
  radius: "0.375rem",
} as const;

const highlightLink =
  "!text-[hsl(var(--highlight))] hover:!text-[hsl(var(--highlight)/0.9)]";

const outlineControl =
  "border-border bg-card text-foreground shadow-none hover:bg-muted/70";

const popoverSurface =
  "!bg-popover !text-popover-foreground border border-border shadow-md";

const profileSurface = {
  backgroundColor: spydr.background,
  color: spydr.foreground,
  borderColor: spydr.border,
  boxShadow: "none",
  borderRadius: spydr.radius,
} as const;

const clerkTheme = {
  theme: dark,
  captcha: { theme: "dark", size: "flexible" },
  options: {
    logoPlacement: "none",
    socialButtonsVariant: "blockButton",
    socialButtonsPlacement: "top",
    shimmer: true,
  },
  variables: {
    colorPrimary: spydr.primary,
    colorPrimaryForeground: spydr.primaryForeground,

    colorBackground: spydr.background,
    colorInput: spydr.card,
    colorInputForeground: spydr.foreground,
    colorMuted: spydr.muted,

    colorForeground: spydr.foreground,
    colorMutedForeground: spydr.mutedForeground,

    colorNeutral: spydr.foreground,
    colorBorder: spydr.border,
    colorShadow: spydr.shadow,
    colorRing: spydr.highlight,
    colorShimmer: "rgba(48, 140, 252, 0.22)",

    colorDanger: spydr.danger,
    colorSuccess: spydr.success,
    colorWarning: spydr.warning,
    colorModalBackdrop: spydr.modalBackdrop,

    borderRadius: spydr.radius,
    fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
    fontFamilyButtons: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
    fontSize: "0.8125rem",
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 600,
    },
  },
  elements: {
    rootBox: "font-sans w-full",
    logoBox: "hidden",
    logoImage: "hidden",

    card: "shadow-none border border-border/80 rounded-md bg-background",
    cardBox: "shadow-none bg-background",
    actionCard: popoverSurface,
    popoverBox: popoverSurface,

    headerTitle: "text-foreground font-semibold tracking-tight",
    headerSubtitle: "text-muted-foreground",
    headerBackLink: highlightLink,
    backLink: highlightLink,

    main: "!bg-transparent",
    footer: "!bg-transparent border-t border-border/60",
    footerItem: "!bg-transparent",
    footerAction: "!bg-transparent",
    footerActionText: "text-muted-foreground",
    footerActionLink: highlightLink,
    footerPages: "!bg-transparent",
    footerPagesLink: "text-muted-foreground hover:!text-foreground",

    socialButtonsBlockButton: outlineControl,
    socialButtonsBlockButtonText: "text-foreground",
    socialButtonsIconButton: outlineControl,
    alternativeMethodsBlockButton: outlineControl,
    alternativeMethodsBlockButtonText: "text-foreground",
    lastAuthenticationStrategyBadge:
      "!bg-highlight/10 !text-highlight border border-highlight/25 font-mono text-[9px] uppercase tracking-[0.14em]",
    enterpriseConnectionButton: outlineControl,
    enterpriseConnectionButtonText: "text-foreground",

    formFieldLabel:
      "text-muted-foreground font-mono text-[10px] uppercase tracking-[0.14em]",
    formFieldHintText: "text-muted-foreground",
    formFieldInfoText: "text-muted-foreground",
    formFieldSuccessText: "!text-[hsl(var(--status-done))]",
    formFieldWarningText: "!text-[hsl(var(--status-doing))]",
    formFieldInput:
      "border-border bg-card text-foreground shadow-none placeholder:text-muted-foreground/60",
    formFieldInputShowPasswordButton:
      "text-muted-foreground hover:text-foreground",
    formFieldInputCopyToClipboardButton:
      "text-muted-foreground hover:text-foreground",
    formFieldRadioLabelTitle: "text-foreground",
    formFieldRadioLabelDescription: "text-muted-foreground",
    formFieldCheckboxLabel: "text-muted-foreground",
    formFieldAction: highlightLink,
    phoneInputBox: "border-border bg-card shadow-none",
    formInputGroup: "border-border bg-card shadow-none",

    formButtonPrimary:
      "!bg-primary !text-primary-foreground shadow-none hover:!bg-primary/90",
    formButtonReset:
      "text-muted-foreground hover:!text-foreground hover:!bg-muted",
    formResendCodeLink: highlightLink,
    identityPreviewEditButton: highlightLink,
    identityPreviewText: "text-foreground",

    dividerLine: "bg-border",
    dividerText:
      "text-muted-foreground font-mono text-[10px] uppercase tracking-[0.14em]",

    otpCodeFieldInput:
      "border-border bg-card text-foreground shadow-none",
    otpCodeFieldErrorText: "text-destructive",
    otpCodeFieldSuccessText: "!text-[hsl(var(--status-done))]",

    formFieldErrorText: "text-destructive",
    alert: "border border-border bg-muted/40 text-foreground",
    alertText: "text-foreground",
    alertTextContainer: "text-foreground",

    button: "rounded-md",
    input: "rounded-md",

    avatarBox: "rounded-sm border border-border",
    avatarImage: "rounded-sm",
    avatarImageActionsUpload: highlightLink,
    avatarImageActionsRemove: "!text-destructive hover:!text-destructive/90",

    userButtonTrigger: "rounded-sm focus:shadow-none",
    userButtonAvatarBox: "rounded-sm border border-border",
    userButtonAvatarImage: "rounded-sm",
    userButtonPopoverRootBox: "font-sans",
    userButtonPopoverCard: `${popoverSurface} rounded-md`,
    userButtonPopoverMain: "!bg-popover",
    userButtonPopoverFooter:
      "!bg-muted/40 border-t border-border text-muted-foreground",
    userButtonPopoverFooterPagesLink:
      "text-muted-foreground hover:!text-foreground",
    userButtonPopoverActionButton: "text-foreground hover:!bg-muted rounded-sm",
    userButtonPopoverActionButtonText: "text-foreground",
    userButtonPopoverActionButtonIcon: "text-muted-foreground",
    userButtonPopoverCustomItemButton:
      "text-foreground hover:!bg-muted rounded-sm",
    userPreviewMainIdentifier: "text-foreground",
    userPreviewSecondaryIdentifier: "text-muted-foreground",

    organizationSwitcherTrigger:
      "border border-border bg-card text-foreground rounded-md",
    organizationSwitcherTriggerIcon: "text-muted-foreground",
    organizationSwitcherPopoverCard: `${popoverSurface} rounded-md`,
    organizationSwitcherPopoverMain: "!bg-popover",
    organizationSwitcherPopoverFooter:
      "!bg-muted/40 border-t border-border",
    organizationSwitcherPopoverActionButton:
      "text-foreground hover:!bg-muted rounded-sm",
    organizationSwitcherPreviewButton: "hover:!bg-muted rounded-sm",
    organizationPreviewMainIdentifier: "text-foreground",
    organizationPreviewSecondaryIdentifier: "text-muted-foreground",

    organizationListPreviewButton: "hover:!bg-muted rounded-sm",
    organizationListCreateOrganizationActionButton:
      "!bg-primary !text-primary-foreground shadow-none hover:!bg-primary/90",
    membersPageInviteButton:
      "!bg-primary !text-primary-foreground shadow-none hover:!bg-primary/90",

    modalBackdrop: {
      backgroundColor: spydr.modalBackdrop,
    },
    modalContent: {
      ...profileSurface,
      backgroundColor: spydr.background,
    },
    modalCloseButton:
      "text-muted-foreground hover:!text-foreground hover:!bg-muted",

    navbar: {
      backgroundColor: spydr.sidebar,
      borderColor: spydr.border,
      color: spydr.mutedForeground,
    },
    navbarButtons: "!bg-transparent",
    navbarButton: {
      color: spydr.mutedForeground,
      borderRadius: spydr.radius,
      "&:hover": {
        backgroundColor: spydr.muted,
        color: spydr.foreground,
      },
    },
    navbarButton__active: {
      backgroundColor: spydr.highlightMuted,
      color: spydr.highlight,
      boxShadow: `inset 2px 0 0 0 ${spydr.highlight}`,
    },
    navbarButtonIcon: "text-current",
    navbarButtonText: "text-current",
    navbarMobileMenuRow: "!bg-muted/40 border-b border-border",
    navbarMobileMenuButton: "text-foreground",

    scrollBox: "!bg-background",
    pageScrollBox: "!bg-background",
    page: "!bg-background text-foreground",
    profilePage: "!bg-background",
    profileSection: "border-border",
    profileSectionHeader: "border-border",
    profileSectionTitleText:
      "text-foreground font-semibold tracking-tight",
    profileSectionSubtitleText: "text-muted-foreground",
    profileSectionItem: "text-foreground",
    profileSectionPrimaryButton: highlightLink,
    profileSectionContent: "!bg-transparent",

    tabListContainer: "border-border",
    tabButton:
      "text-muted-foreground hover:!text-foreground data-[state=active]:!text-highlight",
    tabPanel: "!bg-transparent",

    table: "border-border",
    tableHead: "text-muted-foreground bg-muted/40",
    tableBody: "!bg-transparent",
    tableRow: "hover:!bg-muted/40 border-border",
    tableHeaderCell:
      "text-muted-foreground font-mono text-[10px] uppercase tracking-[0.14em]",
    tableBodyCell: "text-foreground",
    paginationButton: "text-muted-foreground hover:!bg-muted",
    paginationRowText: "text-muted-foreground",

    menuList: popoverSurface,
    menuButton: "text-muted-foreground hover:!bg-muted hover:!text-foreground",
    menuItem: "text-foreground hover:!bg-muted",

    selectButton: outlineControl,
    selectButtonIcon: "text-muted-foreground",
    selectOptionsContainer: popoverSurface,
    selectOption: "text-foreground hover:!bg-muted",
    selectSearchInput: "border-border bg-card text-foreground",

    badge:
      "!bg-muted !text-muted-foreground border border-border font-mono text-[9px] uppercase tracking-[0.14em]",
    notificationBadge: "!bg-primary !text-primary-foreground",
    tagInputContainer: "border-border bg-card",
    tagPillContainer: "!bg-muted !text-foreground border border-border",

    drawerBackdrop: {
      backgroundColor: spydr.modalBackdrop,
    },
    drawerRoot: "!bg-transparent",
    drawerContent: popoverSurface,
    drawerHeader: "border-b border-border",
    drawerTitle: "text-foreground font-semibold tracking-tight",
    drawerBody: "!bg-popover text-foreground",
    drawerFooter: "!bg-muted/40 border-t border-border",
    drawerClose: "text-muted-foreground hover:!text-foreground",
    drawerConfirmationRoot: popoverSurface,
    drawerConfirmationTitle: "text-foreground",
    drawerConfirmationDescription: "text-muted-foreground",

    tooltip: popoverSurface,
    tooltipContent: "!bg-popover text-foreground",
    tooltipText: "text-foreground",

    disclosureTrigger: "text-foreground hover:!bg-muted",
    disclosureContent: "!bg-transparent",

    switchRoot: "bg-muted",
    segmentedControlRoot: "border-border bg-muted/40",
    segmentedControlButton:
      "text-muted-foreground data-[state=checked]:!text-foreground data-[state=checked]:!bg-card",

    activeDevice: "border-border bg-card",
    activeDeviceListItem: "border-border",

    qrCodeContainer: "border border-border bg-card rounded-md",

    impersonationFab: `${popoverSurface} rounded-md`,
    impersonationFabTitle: "text-foreground",
    impersonationFabActionLink: highlightLink,

    pricingTableCard: "border border-border bg-card rounded-md shadow-none",
    pricingTableCardHeader: "border-border",
    pricingTableCardTitle: "text-foreground",
    pricingTableCardDescription: "text-muted-foreground",
    pricingTableCardFooter: "border-border",
    pricingTableCardFooterButton:
      "!bg-primary !text-primary-foreground shadow-none hover:!bg-primary/90",

    checkoutFormLineItemsRoot: "border-border bg-card",
    checkoutSuccessRoot: "bg-background",
    checkoutSuccessTitle: "text-foreground",
    checkoutSuccessDescription: "text-muted-foreground",

    apiKeysHeader: "text-foreground",
    apiKeysSearchInput: "border-border bg-card text-foreground",
    apiKeysAddButton:
      "!bg-primary !text-primary-foreground shadow-none hover:!bg-primary/90",
    apiKeysTable: "border-border",

    taskChooseOrganizationPreviewButton: "hover:!bg-muted rounded-sm",
    taskChooseOrganizationCreateOrganizationActionButton:
      "!bg-primary !text-primary-foreground shadow-none hover:!bg-primary/90",
    taskSetupMfaMethodSelectionItem: "border-border bg-card hover:!bg-muted",
  },
};

const authCardTheme = {
  ...clerkTheme,
  elements: {
    ...clerkTheme.elements,
    rootBox: "font-sans mx-auto w-full",
    card: "shadow-none border border-border/80 rounded-md bg-background w-full",
  },
};

export const clerkAppearance = {
  ...clerkTheme,
  signIn: authCardTheme,
  signUp: authCardTheme,
  userButton: clerkTheme,
  userProfile: clerkTheme,
  userAvatar: clerkTheme,
  userVerification: clerkTheme,
  organizationSwitcher: clerkTheme,
  organizationProfile: clerkTheme,
  organizationList: clerkTheme,
  createOrganization: clerkTheme,
  waitlist: clerkTheme,
  pricingTable: clerkTheme,
  checkout: clerkTheme,
  apiKeys: clerkTheme,
  oneTap: clerkTheme,
  taskChooseOrganization: clerkTheme,
  taskResetPassword: clerkTheme,
  enableOrganizations: clerkTheme,
} as Appearance;

export function clerkUserButtonProps(extraElements?: Record<string, string>) {
  return {
    appearance: {
      ...clerkAppearance,
      elements: {
        ...clerkAppearance.elements,
        ...extraElements,
      },
    },
    userProfileProps: {
      appearance: clerkAppearance,
    },
  };
}
