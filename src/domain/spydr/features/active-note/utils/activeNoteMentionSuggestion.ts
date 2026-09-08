import Mention, { type MentionOptions } from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import {
  ActiveNoteMentionList,
  type ActiveNoteMentionListRef,
} from "../components/ActiveNoteMentionList";
import {
  filterMentionItems,
  parseSuggestionQuery,
  type ActiveNoteMentionItem,
  type ActiveNoteMentionKind,
} from "../utils/activeNoteMentions";

const KIND_VALUES = new Set<ActiveNoteMentionKind>(["project", "task", "note"]);

function asKind(value: unknown): ActiveNoteMentionKind | null {
  return typeof value === "string" && KIND_VALUES.has(value as ActiveNoteMentionKind)
    ? (value as ActiveNoteMentionKind)
    : null;
}

export const ActiveNoteMention = Mention.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      kind: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-kind"),
        renderHTML: (attributes) => {
          if (!attributes.kind) return {};
          return { "data-kind": attributes.kind };
        },
      },
    };
  },
}).configure({
  HTMLAttributes: {
    class: "active-note-mention",
  },
  deleteTriggerWithBackspace: true,
  renderText({ node }) {
    const kind = asKind(node.attrs.kind);
    const label = String(node.attrs.label ?? node.attrs.id ?? "");
    if (kind) return `@${kind} ${label}`;
    return `@${label}`;
  },
  renderHTML({ node, options }) {
    const kind = asKind(node.attrs.kind);
    const label = String(node.attrs.label ?? node.attrs.id ?? "");
    const text = kind ? `@${kind} ${label}` : `@${label}`;
    return [
      "span",
      {
        ...options.HTMLAttributes,
        "data-type": "mention",
        "data-id": node.attrs.id,
        "data-label": node.attrs.label,
        "data-kind": kind ?? undefined,
      },
      text,
    ];
  },
});

export function createActiveNoteMentionSuggestion(options: {
  getItems: () => readonly ActiveNoteMentionItem[];
  getIsLoading: () => boolean;
}): NonNullable<MentionOptions["suggestion"]> {
  return {
    char: "@",
    allowSpaces: true,
    allowedPrefixes: [" ", "(", "[", "{"],
    items: ({ query }) => {
      const parsed = parseSuggestionQuery(query);
      return filterMentionItems(options.getItems(), parsed);
    },
    render: () => {
      let component: ReactRenderer<ActiveNoteMentionListRef> | null = null;
      let unmount: (() => void) | null = null;

      return {
        onStart(props) {
          component = new ReactRenderer(ActiveNoteMentionList, {
            props: {
              items: props.items as ActiveNoteMentionItem[],
              command: props.command,
              isLoading: options.getIsLoading(),
            },
            editor: props.editor,
          });
          // Floating UI positions this body-mounted node without a z-index;
          // lift it above Active Note's z-[1] frosted plate (backdrop-blur).
          component.element.style.zIndex = "50";
          unmount = props.mount(component.element);
        },
        onUpdate(props) {
          component?.updateProps({
            items: props.items as ActiveNoteMentionItem[],
            command: props.command,
            isLoading: options.getIsLoading(),
          });
        },
        onKeyDown(props) {
          if (props.event.key === "Escape") {
            unmount?.();
            component?.destroy();
            unmount = null;
            component = null;
            return true;
          }
          return component?.ref?.onKeyDown(props) ?? false;
        },
        onExit() {
          unmount?.();
          component?.destroy();
          unmount = null;
          component = null;
        },
      };
    },
  };
}
