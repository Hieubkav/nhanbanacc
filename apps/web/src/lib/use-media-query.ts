"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches(("matches" in e ? e.matches : (e as MediaQueryList).matches));
    };
    setMatches(mql.matches);
    // Safari < 14 fallback doesn't support addEventListener on MediaQueryList
    try {
      mql.addEventListener("change", onChange as any);
      return () => mql.removeEventListener("change", onChange as any);
    } catch {
      // @ts-ignore
      mql.addListener(onChange as any);
      return () => {
        // @ts-ignore
        mql.removeListener(onChange as any);
      };
    }
  }, [query]);

  return matches;
}

