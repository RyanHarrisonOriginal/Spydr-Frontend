import { afterEach, describe, expect, it, vi } from "vitest";
import {
  COARSE_POINTER_QUERY,
  getMediaQueryMatches,
  PHONE_LAYOUT_QUERY,
  subscribeMediaQuery,
} from "./mediaQuery";

function installMatchMedia(matchesByQuery: Record<string, boolean>) {
  const listeners = new Map<string, Set<(event: MediaQueryListEvent) => void>>();

  window.matchMedia = vi.fn((query: string) => {
    const mediaListeners = listeners.get(query) ?? new Set();
    listeners.set(query, mediaListeners);
    return {
      get matches() {
        return matchesByQuery[query] ?? false;
      },
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: (
        _type: string,
        listener: (event: MediaQueryListEvent) => void
      ) => {
        mediaListeners.add(listener);
      },
      removeEventListener: (
        _type: string,
        listener: (event: MediaQueryListEvent) => void
      ) => {
        mediaListeners.delete(listener);
      },
      dispatchEvent: () => false,
    } as MediaQueryList;
  });

  return {
    emit(query: string, matches: boolean) {
      matchesByQuery[query] = matches;
      for (const listener of listeners.get(query) ?? []) {
        listener({ matches, media: query } as MediaQueryListEvent);
      }
    },
  };
}

describe("mediaQuery", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("uses a max-width query aligned to the Tailwind md breakpoint", () => {
    expect(PHONE_LAYOUT_QUERY).toBe("(max-width: 767.98px)");
  });

  it("reads the current matchMedia result for the phone layout query", () => {
    installMatchMedia({ [PHONE_LAYOUT_QUERY]: true });
    expect(getMediaQueryMatches(PHONE_LAYOUT_QUERY)).toBe(true);
    expect(getMediaQueryMatches(COARSE_POINTER_QUERY)).toBe(false);
  });

  it("notifies subscribers when the viewport crosses the phone breakpoint", () => {
    const media = installMatchMedia({ [PHONE_LAYOUT_QUERY]: false });
    const onChange = vi.fn();
    const unsubscribe = subscribeMediaQuery(PHONE_LAYOUT_QUERY, onChange);

    expect(onChange).toHaveBeenCalledWith(false);
    media.emit(PHONE_LAYOUT_QUERY, true);
    expect(onChange).toHaveBeenLastCalledWith(true);
    unsubscribe();
  });
});
