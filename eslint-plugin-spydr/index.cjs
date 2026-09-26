const path = require("path");

const COMPONENT_SUFFIX = "src/domain/spydr/features/shared/components/TruncatedText.tsx";

function relativePath(filename) {
  const base = filename.split("\\").join("/");
  const marker = "/src/";
  const index = base.lastIndexOf(marker);
  if (index !== -1) return base.slice(index + 1);
  return path.relative(process.cwd(), filename).split(path.sep).join("/");
}

function bannedTokens(value) {
  if (!value) return [];
  const hits = [];
  for (const token of value.split(/\s+/)) {
    if (!token) continue;
    const bare = token.replace(/^!/, "").replace(/!$/, "");
    const body = bare.split(":").pop();
    if (body === "truncate" || (body && body.startsWith("line-clamp-"))) {
      hits.push(token);
    }
  }
  return hits;
}

/** @type {import("eslint").Rule.RuleModule} */
const noRawTruncate = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Ban raw truncate and line-clamp classes outside TruncatedText.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      banned:
        "Use TruncatedText instead of {{tokens}}. Raw truncate and line-clamp classes are only allowed in that component.",
    },
  },
  create(context) {
    const allow = new Set((context.options[0] && context.options[0].allow) || []);
    const filename = relativePath(context.getFilename());
    if (filename === COMPONENT_SUFFIX || filename.endsWith("/" + COMPONENT_SUFFIX) || allow.has(filename)) {
      return {};
    }

    function check(node, value) {
      const hits = bannedTokens(value);
      if (hits.length === 0) return;
      context.report({
        node,
        messageId: "banned",
        data: { tokens: hits.join(", ") },
      });
    }

    return {
      Literal(node) {
        if (typeof node.value === "string") check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.raw);
      },
    };
  },
};

module.exports = {
  rules: {
    "no-raw-truncate": noRawTruncate,
  },
  bannedTokens,
  relativePath,
};
