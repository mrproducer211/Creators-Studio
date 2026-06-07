"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface SavedContextValue {
  savedIds:   Set<number>;
  toggle:     (id: number) => void;
  isSaved:    (id: number) => boolean;
  count:      number;
  loading:    boolean;
}

const SavedContext = createContext<SavedContextValue>({
  savedIds: new Set(),
  toggle:   () => {},
  isSaved:  () => false,
  count:    0,
  loading:  false,
});

const STORAGE_KEY = "nhp_saved_properties";

export function SavedProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  // Helper to load guest bookmarks from localStorage
  const loadLocal = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const arr: number[] = JSON.parse(stored);
        Promise.resolve().then(() => {
          setSavedIds(new Set(arr));
        });
      } else {
        Promise.resolve().then(() => {
          setSavedIds(new Set());
        });
      }
    } catch {
      Promise.resolve().then(() => {
        setSavedIds(new Set());
      });
    }
  }, []);

  // Sync bookmarks based on authentication status
  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user?.email) {
      const syncBookmarks = async () => {
        setLoading(true);
        try {
          // 1. Get local storage bookmarks to merge
          const stored = localStorage.getItem(STORAGE_KEY);
          const localIds: number[] = stored ? JSON.parse(stored) : [];

          // 2. If local bookmarks exist, merge/sync them to DB first
          if (localIds.length > 0) {
            await fetch("/api/bookmarks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ syncIds: localIds }),
            });
            // Clear local storage guest bookmarks after successful sync
            localStorage.removeItem(STORAGE_KEY);
          }

          // 3. Fetch all bookmarks for user from DB
          const res = await fetch("/api/bookmarks");
          if (res.ok) {
            const data = await res.json();
            setSavedIds(new Set(data.ids || []));
          }
        } catch (err) {
          console.error("Failed to sync bookmarks:", err);
        } finally {
          setLoading(false);
        }
      };

      syncBookmarks();
    } else {
      // Guest/logged out case: read from local storage
      loadLocal();
    }
  }, [status, session, loadLocal]);

  // Persist guest/offline bookmarks to localStorage whenever savedIds changes
  useEffect(() => {
    if (status === "authenticated") return; // Logged-in users persist to DB, not localStorage

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedIds]));
    } catch {}
  }, [savedIds, status]);

  const toggle = useCallback(async (id: number) => {
    if (status !== "authenticated") {
      // Allow guest users to toggle local bookmarks
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }

    // 1. Update UI state instantly (optimistic update)
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    // 2. Perform DB persist if authenticated
    if (status === "authenticated") {
      try {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId: id }),
        });
      } catch (err) {
        console.error("Failed to toggle DB bookmark:", err);
      }
    }
  }, [status]);

  const isSaved  = useCallback((id: number) => savedIds.has(id), [savedIds]);
  const count    = savedIds.size;

  return (
    <SavedContext.Provider value={{ savedIds, toggle, isSaved, count, loading }}>
      {children}
    </SavedContext.Provider>
  );
}

export const useSaved = () => useContext(SavedContext);
