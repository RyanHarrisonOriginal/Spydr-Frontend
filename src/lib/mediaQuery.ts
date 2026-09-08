/**
 * Phone layout is a viewport contract, not a device identity.
 *
 * User-Agent sniffing and Client Hints (`Sec-CH-UA-Mobile`) are the wrong
 * signal for UI: they miss resized windows, foldables, and desktop touch, and
 * they go stale. CSS Media Queries Level 4 + `window.matchMedia` is the
 * current platform API (MDN, W3C, Chrome).
 *
 * Layout uses the same max-width as Tailwind `md` (768px). Interaction
 * capability uses `pointer: coarse` / `hover: none` for tap-target sizing.
 */
export const PHONE_BREAKPOINT_PX = 768;

export const PHONE_LAYOUT_QUERY = `(max-width: ${PHONE_BREAKPOINT_PX - 0.02}px)`;

export const COARSE_POINTER_QUERY = "(pointer: coarse)";

export const NO_HOVER_QUERY = "(hover: none)";

export function subscribeMediaQuery(
  query: string,
  onChange: (matches: boolean) => void
): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    onChange(false);
    return () => undefined;
  }

  const media = window.matchMedia(query);
  const notify = () => onChange(media.matches);
  notify();
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}

export function getMediaQueryMatches(query: string): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(query).matches;
}
