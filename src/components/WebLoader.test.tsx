import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WebLoader, WebLoaderScreen } from "@/components/WebLoader";
import { LoadingState } from "@/domain/spydr/features/shared/components/ListState";

describe("WebLoader", () => {
  it("exposes a polite status with the given label", () => {
    render(<WebLoader label="Loading workspace" />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading workspace");
  });

  it("falls back to the hexagonal mark when WebGL is unavailable", async () => {
    render(<WebLoader size="sm" />);
    await waitFor(() => {
      expect(document.querySelector("svg.spydr-web-loader-mark")).toBeTruthy();
    });
  });

  it("renders a full-screen loading label", () => {
    render(<WebLoaderScreen label="Spinning up the web" />);
    expect(screen.getByRole("status")).toHaveTextContent("Spinning up the web");
  });
});

describe("LoadingState", () => {
  it("pairs the web loader with the page title", () => {
    render(<LoadingState title="Loading work" />);
    expect(screen.getByText("Loading work…")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
