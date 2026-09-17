import { cn } from "@/lib/utils";
import { toRenderableHtml } from "@/domain/spydr/utils/richText";

interface RichTextHtmlProps {
  html: string;
  className?: string;
}

export function RichTextHtml({ html, className }: RichTextHtmlProps) {
  const rendered = toRenderableHtml(html);
  if (!rendered) return null;

  return (
    <div
      className={cn("spydr-rich-text", className)}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}
