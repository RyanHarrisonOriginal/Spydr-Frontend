import { richTextToPlainText } from "@/domain/spydr/utils/richText";

export interface NotePreview {
  title: string;
  snippet: string;
  untitled: boolean;
}

/**
 * Apple Notes / Bear style list copy: named title + body excerpt, or the
 * first line of the body when the note has no title.
 */
export function getNotePreview(title: string, body: string): NotePreview {
  const snippet = richTextToPlainText(body);
  const named = title.trim();
  if (named) {
    return { title: named, snippet, untitled: false };
  }
  if (!snippet) {
    return { title: "Untitled note", snippet: "", untitled: true };
  }

  const sentenceEnd = snippet.search(/[.!?](?:\s|$)/);
  const titleEnd =
    sentenceEnd >= 0 && sentenceEnd < 90 ? sentenceEnd + 1 : Math.min(snippet.length, 80);
  const derivedTitle = snippet.slice(0, titleEnd).trim();
  const rest = snippet.slice(titleEnd).trim();
  return { title: derivedTitle || snippet, snippet: rest, untitled: true };
}
