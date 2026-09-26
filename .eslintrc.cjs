/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["spydr", "react-hooks"],
  ignorePatterns: [
    "dist/**",
    "node_modules/**",
    "coverage/**",
    "public/**",
    "eslint-plugin-spydr/**",
  ],
  rules: {
    "spydr/no-raw-truncate": ["error", { allow: require("./eslint-plugin-spydr/allowlist.cjs") }],
  },
};
