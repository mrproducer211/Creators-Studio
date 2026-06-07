"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface Ctx {
  ids:    number[];
  track:  (id: number) => void;
  clear:  () => void;
}

const RecentlyViewedContext = createContext<Ctx>({
  ids: [], track: () => {}, clear: () => {},
});

const STORAGE_KEY = "nhp_recently_viewed";
const MAX_ITEMS = 8;

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        Promise.resolve().then(() => {
          setIds(JSON.parse(stored) as number[]);
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch {}
  }, [ids]);

  const track = useCallback((id: number) => {
    setIds((prev) => {
      const without = prev.filter((x) => x !== id);
      return [id, ...without].slice(0, MAX_ITEMS);
    });
  }, []);

  const clear = useCallback(() => setIds([]), []);

  return (
    <RecentlyViewedContext.Provider value={{ ids, track, clear }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);
