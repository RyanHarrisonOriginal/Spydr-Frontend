import { useLayoutEffect } from "react";
import { useCoarsePointer, useIsPhone } from "@/hooks/useIsPhone";

/**
 * Mirrors media-query phone detection onto `<html>` so CSS can share the
 * same contract as JS (`[data-phone]`, `[data-coarse-pointer]`).
 */
export function PhoneLayoutSync() {
  const isPhone = useIsPhone();
  const coarsePointer = useCoarsePointer();

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-phone", isPhone);
    root.toggleAttribute("data-coarse-pointer", coarsePointer);
    return () => {
      root.removeAttribute("data-phone");
      root.removeAttribute("data-coarse-pointer");
    };
  }, [coarsePointer, isPhone]);

  return null;
}
