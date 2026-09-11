import Mention, { type MentionOptions } from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import {
  TemplateParameterSuggestionList,
  type TemplateParameterSuggestionListRef,
} from "./TemplateParameterSuggestionList";
import {
  filterParameterOptions,
  type TemplateParameterOption,
} from "../utils/templateParameters";

export const TemplateParameterMention = Mention.configure({
  HTMLAttributes: {
    class: "template-param-mention",
  },
  deleteTriggerWithBackspace: true,
  renderText({ node }) {
    const key = String(node.attrs.id ?? node.attrs.label ?? "");
    return `{{${key}}}`;
  },
  renderHTML({ node, options }) {
    const key = String(node.attrs.id ?? node.attrs.label ?? "");
    return [
      "span",
      {
        ...options.HTMLAttributes,
        "data-type": "mention",
        "data-id": key,
        "data-label": key,
      },
      `{{${key}}}`,
    ];
  },
});

/**
 * Trigger on `{{`. Selecting inserts a `{{KEY}}` chip from the parameter list.
 */
export function createTemplateParameterSuggestion(options: {
  getItems: () => readonly TemplateParameterOption[];
}): NonNullable<MentionOptions["suggestion"]> {
  return {
    char: "{{",
    allowSpaces: false,
    allowedPrefixes: null,
    items: ({ query }) =>
      filterParameterOptions(options.getItems(), query),
    render: () => {
      let component: ReactRenderer<TemplateParameterSuggestionListRef> | null =
        null;
      let unmount: (() => void) | null = null;

      return {
        onStart(props) {
          component = new ReactRenderer(TemplateParameterSuggestionList, {
            props: {
              items: props.items as TemplateParameterOption[],
              command: props.command,
            },
            editor: props.editor,
          });
          component.element.style.zIndex = "60";
          unmount = props.mount(component.element);
        },
        onUpdate(props) {
          component?.updateProps({
            items: props.items as TemplateParameterOption[],
            command: props.command,
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
