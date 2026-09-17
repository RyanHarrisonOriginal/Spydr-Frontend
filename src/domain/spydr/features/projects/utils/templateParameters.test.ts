import { describe, expect, it } from "vitest";
import {
  defaultSpawnedParamValues,
  newKeysFromTemplateDraft,
  newParameterEntries,
  normalizeSpawnedParamValues,
  UNSPECIFIED_PARAM_VALUE,
} from "./templateParameters";

describe("template parameter save helpers", () => {
  it("detects newly introduced parameter keys", () => {
    expect(
      newParameterEntries(
        [{ key: "NEW_COMPANY_NAME" }],
        [
          { key: "NEW_COMPANY_NAME", label: "Company" },
          { key: "REGION", label: "Region" },
        ]
      )
    ).toEqual([{ key: "REGION", label: "Region" }]);
  });

  it("detects new keys used in task text even if the parameter list is stale", () => {
    expect(
      newKeysFromTemplateDraft({
        previousKeys: [{ key: "VAR1" }],
        parameters: [{ key: "VAR1", label: "Var 1" }],
        titleTemplate: "{{VAR1}} Launch",
        tasks: [{ titleTemplate: "email {{VAR2}}" }],
      })
    ).toEqual([{ key: "VAR2", label: "Var2" }]);
  });

  it("defaults connected project values to UNSPECIFIED", () => {
    expect(
      defaultSpawnedParamValues(["project-1", "project-2"], ["REGION"])
    ).toEqual({
      "project-1": { REGION: UNSPECIFIED_PARAM_VALUE },
      "project-2": { REGION: UNSPECIFIED_PARAM_VALUE },
    });
  });

  it("restores empty submitted values to UNSPECIFIED", () => {
    expect(
      normalizeSpawnedParamValues({
        "project-1": { REGION: "  west  ", CONTACT: "   " },
      })
    ).toEqual({
      "project-1": { REGION: "west", CONTACT: UNSPECIFIED_PARAM_VALUE },
    });
  });
});
