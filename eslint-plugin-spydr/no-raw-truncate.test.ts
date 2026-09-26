import { createRequire } from "node:module";
import { RuleTester } from "eslint";

const require = createRequire(import.meta.url);
const plugin = require("./index.cjs") as {
  rules: { "no-raw-truncate": import("eslint").Rule.RuleModule };
};

const tester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
});

tester.run("no-raw-truncate", plugin.rules["no-raw-truncate"], {
      valid: [
        {
          filename: "src/domain/spydr/features/shared/components/TruncatedText.tsx",
          code: `export const sample = "min-w-0 truncate";`,
        },
        {
          filename: "src/AlreadyThere.tsx",
          code: `export const sample = "truncate";`,
          options: [{ allow: ["src/AlreadyThere.tsx"] }],
        },
        {
          filename: "src/Plain.tsx",
          code: `export const sample = "min-w-0 flex-1";`,
        },
      ],
      invalid: [
        {
          filename: "src/NewView.tsx",
          code: `export function View() { return <span className="min-w-0 truncate" />; }`,
          errors: [{ messageId: "banned" }],
        },
        {
          filename: "src/NewView.tsx",
          code: `export const sample = "mt-1 line-clamp-2 text-[12px]";`,
          errors: [{ messageId: "banned" }],
        },
        {
          filename: "src/NewView.tsx",
          code: "export const sample = `md:truncate`;",
          errors: [{ messageId: "banned" }],
        },
      ],
});
