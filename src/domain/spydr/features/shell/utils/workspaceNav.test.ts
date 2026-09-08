import { describe, expect, it } from "vitest";
import { mobilePrimaryTabs } from "./workspaceNav";

describe("mobilePrimaryTabs", () => {
  it("treats nested work routes as the Work tab", () => {
    const work = mobilePrimaryTabs.find((tab) => tab.id === "work");
    expect(work?.isActive("/work")).toBe(true);
    expect(work?.isActive("/projects/abc")).toBe(true);
    expect(work?.isActive("/tasks/abc")).toBe(true);
    expect(work?.isActive("/people/abc")).toBe(true);
    expect(work?.isActive("/notes/abc")).toBe(false);
  });

  it("treats past active notes as the Note tab", () => {
    const note = mobilePrimaryTabs.find((tab) => tab.id === "active-note");
    expect(note?.isActive("/active-note")).toBe(true);
    expect(note?.isActive("/active-note/session-1")).toBe(true);
    expect(note?.isActive("/dashboard")).toBe(false);
  });
});
