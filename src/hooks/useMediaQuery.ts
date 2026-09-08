import { useEffect, useState } from "react";
import { getMediaQueryMatches, subscribeMediaQuery } from "@/lib/mediaQuery";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => getMediaQueryMatches(query));

  useEffect(() => subscribeMediaQuery(query, setMatches), [query]);

  return matches;
}
