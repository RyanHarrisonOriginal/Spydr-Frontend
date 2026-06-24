import type { ProjectAreaNode } from "@/domain/spydr/utils/types";

export const DEFAULT_AREA_COLOR = "18 94% 50%";

export const AREA_COLOR_PRESETS = [
  "18 94% 50%",
  "210 90% 56%",
  "142 72% 42%",
  "280 68% 58%",
  "340 82% 56%",
  "45 92% 52%",
  "195 85% 46%",
  "12 78% 54%",
] as const;

export function resolveAreaColor(area: ProjectAreaNode | undefined): string {
  return area?.details?.color ?? DEFAULT_AREA_COLOR;
}

export function hslColorCss(color: string): string {
  return `hsl(${color})`;
}

export function areaColorSurfaceStyle(color: string) {
  return {
    borderColor: `hsl(${color} / 0.35)`,
    backgroundColor: `hsl(${color} / 0.1)`,
  } as const;
}

export function parseHslChannels(color: string) {
  const match = color.trim().match(/^(\d{1,3})\s+(\d{1,3})%\s+(\d{1,3})%$/);
  if (!match) {
    return { h: 18, s: 94, l: 50 };
  }
  return {
    h: Number(match[1]),
    s: Number(match[2]),
    l: Number(match[3]),
  };
}

export function hslChannelsToHex(color: string): string {
  const { h, s, l } = parseHslChannels(color);
  const saturation = s / 100;
  const lightness = l / 100;

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const huePrime = h / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));

  let r = 0;
  let g = 0;
  let b = 0;

  if (huePrime >= 0 && huePrime < 1) [r, g, b] = [chroma, x, 0];
  else if (huePrime < 2) [r, g, b] = [x, chroma, 0];
  else if (huePrime < 3) [r, g, b] = [0, chroma, x];
  else if (huePrime < 4) [r, g, b] = [0, x, chroma];
  else if (huePrime < 5) [r, g, b] = [x, 0, chroma];
  else [r, g, b] = [chroma, 0, x];

  const m = lightness - chroma / 2;
  const toHex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToHslChannels(hex: string): string {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return `0 0% ${Math.round(lightness * 100)}%`;
  }

  const saturation =
    delta / (1 - Math.abs(2 * lightness - 1));

  let hue = 0;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  return `${hue} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

export function nextAreaPresetColor(areaCount: number): string {
  return AREA_COLOR_PRESETS[areaCount % AREA_COLOR_PRESETS.length];
}
