import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PHONE_LAYOUT_QUERY } from "@/lib/mediaQuery";
import { useIsPhone } from "./useIsPhone";
import { useMediaQuery } from "./useMediaQuery";

function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  window.matchMedia = vi.fn((query: string) => {
    return {
      get matches() {
        return matches;
      },
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: (
        _type: string,
        listener: (event: MediaQueryListEvent) => void
      ) => {
        listeners.add(listener);
      },
      removeEventListener: (
        _type: string,
        listener: (event: MediaQueryListEvent) => void
      ) => {
        listeners.delete(listener);
      },
      dispatchEvent: () => false,
    } as MediaQueryList;
  });

  return {
    setMatches(next: boolean) {
      matches = next;
      for (const listener of listeners) {
        listener({ matches, media: PHONE_LAYOUT_QUERY } as MediaQueryListEvent);
      }
    },
  };
}

describe("useMediaQuery", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("tracks phone layout from matchMedia, not the user agent", () => {
    const media = installMatchMedia(false);
    const { result } = renderHook(() => useIsPhone());
    expect(result.current).toBe(false);

    act(() => {
      media.setMatches(true);
    });
    expect(result.current).toBe(true);
  });

  it("re-subscribes when the query changes", () => {
    installMatchMedia(true);
    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: PHONE_LAYOUT_QUERY } }
    );
    expect(result.current).toBe(true);
    rerender({ query: "(min-width: 1280px)" });
    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 1280px)");
  });
});
