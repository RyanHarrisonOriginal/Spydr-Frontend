const MAX_EMOJI_LENGTH = 64;

export const EMOJI_PRESETS = [
  "🚀",
  "⭐",
  "🔥",
  "💡",
  "🧠",
  "🎯",
  "📌",
  "✅",
  "🛠️",
  "📦",
  "🧭",
  "🗺️",
  "📊",
  "📈",
  "🧩",
  "🧪",
  "🖥️",
  "📱",
  "🔒",
  "🔑",
  "📝",
  "📚",
  "💬",
  "📣",
  "🤝",
  "🧑‍💻",
  "🏗️",
  "🌱",
  "🌟",
  "⚡",
  "🧲",
  "🧱",
  "🧰",
  "🪄",
  "🎨",
  "🎬",
  "📞",
  "🗓️",
  "⏳",
  "🏆",
  "💎",
  "🌊",
  "🌙",
  "☀️",
  "🍀",
  "🦋",
  "🐝",
  "🐙",
  "🦊",
  "🐱",
  "🐶",
  "🏠",
  "🏢",
  "🌍",
  "🛰️",
  "🚦",
  "🪙",
  "💳",
  "🛒",
  "🩺",
  "🎓",
  "🏛️",
  "🎵",
  "🎮",
] as const;

export function normalizeEmojiInput(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_EMOJI_LENGTH || /\s/.test(trimmed)) return null;

  const graphemes = [
    ...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(trimmed),
  ];
  if (graphemes.length !== 1) return null;
  return trimmed;
}

export function withEntityEmoji(
  emoji: string | null | undefined,
  title: string
): string {
  return emoji ? `${emoji} ${title}` : title;
}
