import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TruncatedText } from "./TruncatedText";

const TEXT = "Northstar migration of the ontology graph export pipeline for Q4 reviewxxxxxxxx";

let overflow = false;
let resizeCallback: ResizeObserverCallback | null = null;

class ResizeObserverMock {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

function installLayout(nextOverflow: boolean) {
  overflow = nextOverflow;
  const descriptors = ["scrollWidth", "clientWidth", "scrollHeight", "clientHeight"] as const;
  const originals = descriptors.map((key) => Object.getOwnPropertyDescriptor(HTMLElement.prototype, key));

  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      return 80;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get() {
      return 20;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    get() {
      if (this.dataset.truncateMeasure !== "true" || !overflow) return 40;
      return (this.textContent?.length ?? 0) > 12 ? 240 : 40;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get() {
      if (this.dataset.truncateMeasure === "true") return overflow ? 80 : 20;
      return 20;
    },
  });

  return () => {
    descriptors.forEach((key, index) => {
      const original = originals[index];
      if (original) Object.defineProperty(HTMLElement.prototype, key, original);
    });
  };
}

describe("TruncatedText", () => {
  afterEach(() => {
    resizeCallback = null;
    vi.unstubAllGlobals();
  });

  it("does not open a popover when the text fits", () => {
    const restore = installLayout(false);
    try {
      render(<TruncatedText text="Short title" />);
      expect(screen.getByText("Short title", { ignore: "[aria-hidden='true']" })).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    } finally {
      restore();
    }
  });

  it("opens the full text on tap and exposes it to screen readers", async () => {
    const user = userEvent.setup();
    const restore = installLayout(true);
    try {
      render(<TruncatedText text={TEXT} />);

      const trigger = screen.getByRole("button", { name: TEXT });
      expect(trigger).toHaveAttribute("aria-label", TEXT);
      expect(trigger).not.toHaveAttribute("title");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      await user.click(trigger);
      expect(screen.getByRole("dialog", { name: TEXT })).toHaveTextContent(TEXT);
    } finally {
      restore();
    }
  });

  it("opens the full text on keyboard focus", async () => {
    const user = userEvent.setup();
    const restore = installLayout(true);
    try {
      render(<TruncatedText text={TEXT} />);

      await user.tab();
      expect(screen.getByRole("button", { name: TEXT })).toHaveFocus();
      expect(screen.getByRole("dialog", { name: TEXT })).toHaveTextContent(TEXT);
    } finally {
      restore();
    }
  });

  it("rechecks overflow when the slot resizes", () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    const restore = installLayout(false);
    try {
      render(<TruncatedText text={TEXT} />);
      expect(screen.queryByRole("button", { name: TEXT })).not.toBeInTheDocument();

      act(() => {
        overflow = true;
        resizeCallback?.([], {} as ResizeObserver);
      });
      expect(screen.getByRole("button", { name: TEXT })).toHaveAttribute("aria-label", TEXT);
    } finally {
      restore();
    }
  });

  it("copies the full string from the middle variant", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const restore = installLayout(true);
    try {
      render(<TruncatedText text={TEXT} variant="middle" />);

      await user.click(screen.getByRole("button", { name: "Copy" }));
      expect(writeText).toHaveBeenCalledWith(TEXT);
      expect(screen.getByRole("button", { name: TEXT })).toHaveAttribute("aria-label", TEXT);
    } finally {
      restore();
    }
  });
});
