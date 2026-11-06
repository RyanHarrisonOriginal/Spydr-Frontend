import { describe, expect, it } from "vitest";
import {
  collectCreateFormParameters,
  defaultSpawnedParamValues,
  newKeysFromTemplateDraft,
  newParameterEntries,
  normalizeSpawnedParamValues,
  UNSPECIFIED_PARAM_VALUE,
} from "./templateParameters";

describe("template parameter save helpers", () => {
  it("includes tokens used in template text that are not declared parameters", () => {
    expect(
      collectCreateFormParameters({
        titleTemplate: "{{NEW_COMPANY_NAME}} Go Live",
        bodyTemplate: "",
        parameters: [
          {
            id: "p1",
            key: "NEW_COMPANY_NAME",
            label: "New company name",
            required: true,
            defaultValue: null,
            sortOrder: 0,
          },
        ],
        tasks: [
          {
            titleTemplate:
              "determine whether {{NEW_COMPANY_NAME}}'s {{ERP}} data needs modeling",
            bodyTemplate: "",
          },
        ],
      }).map((param) => ({
        key: param.key,
        label: param.label,
        required: param.required,
      }))
    ).toEqual([
      { key: "NEW_COMPANY_NAME", label: "New company name", required: true },
      { key: "ERP", label: "Erp", required: true },
    ]);
  });

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
