import { useEffect, useRef, useState } from "react";
import {
  resolveListDensity,
  type ListDensity,
} from "@/domain/spydr/features/shared/utils/listDensity";

export function useListDensity(requiredWidth: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setAvailableWidth((current) => (current === width ? current : width));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const density: ListDensity = resolveListDensity(availableWidth, requiredWidth);
  return { density, ref };
}
