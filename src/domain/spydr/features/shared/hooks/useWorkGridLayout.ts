import { useEffect, useRef, useState, type MutableRefObject } from "react";
import {
  resolveWorkGridLayout,
  type FittedGridLayout,
  type FittedTrack,
} from "@/domain/spydr/features/shared/utils/fitGridTracks";

export function useWorkGridLayout(
  tracks: FittedTrack[],
  paddingX: number
): FittedGridLayout & {
  ref: MutableRefObject<HTMLDivElement | null>;
  availableWidth: number;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setAvailableWidth((current) => (Math.abs(current - width) < 0.5 ? current : width));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    availableWidth,
    ...resolveWorkGridLayout(tracks, availableWidth, paddingX),
  };
}
