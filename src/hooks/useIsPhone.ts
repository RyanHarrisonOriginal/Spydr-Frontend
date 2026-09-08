import {
  COARSE_POINTER_QUERY,
  NO_HOVER_QUERY,
  PHONE_LAYOUT_QUERY,
} from "@/lib/mediaQuery";
import { useMediaQuery } from "./useMediaQuery";

/** True when the viewport is below the phone layout breakpoint. */
export function useIsPhone(): boolean {
  return useMediaQuery(PHONE_LAYOUT_QUERY);
}

/** True when the primary pointing device is coarse (typical phones / touch). */
export function useCoarsePointer(): boolean {
  return useMediaQuery(COARSE_POINTER_QUERY);
}

/** True when the primary input cannot hover (typical phones). */
export function useNoHover(): boolean {
  return useMediaQuery(NO_HOVER_QUERY);
}
