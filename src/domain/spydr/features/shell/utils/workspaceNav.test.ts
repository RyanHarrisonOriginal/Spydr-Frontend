import { describe, expect, it } from "vitest";
import { mobilePrimaryTabs } from "./workspaceNav";

describe("mobilePrimaryTabs", () => {
  it("treats nested work routes as the Work tab", () => {
    const work = mobilePrimaryTabs.find((tab) => tab.id === "work");
    expect(work?.isActive("/work")).toBe(true);
    expect(work?.isActive("/projects/abc")).toBe(true);
    expect(work?.isActive("/tasks/abc")).toBe(true);
    expect(work?.isActive("/people/abc")).toBe(true);
    expect(work?.isActive("/today")).toBe(false);
    expect(work?.isActive("/notes/abc")).toBe(false);
  });

  it("treats /today as the Today tab", () => {
    const today = mobilePrimaryTabs.find((tab) => tab.id === "today");
    expect(today?.isActive("/today")).toBe(true);
    expect(today?.isActive("/work")).toBe(false);
    expect(today?.isActive("/dashboard")).toBe(false);
  });
});
