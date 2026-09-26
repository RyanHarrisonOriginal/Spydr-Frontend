/**
 * Single layout breakpoint. Tailwind `md` and the phone media query both
 * derive from this width so CSS and `useIsPhone` flip on the same edge.
 */
export const MD_BREAKPOINT_PX = 768;

/**
 * Complement of `min-width: ${MD_BREAKPOINT_PX}px`.
 * The 0.02px inset is Tailwind's max-width complement, computed here so the
 * boundary is not a second literal.
 */
export const PHONE_LAYOUT_QUERY = `(max-width: ${MD_BREAKPOINT_PX - 0.02}px)`;
