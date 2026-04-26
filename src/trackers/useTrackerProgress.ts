import { useCallback, useMemo, useState } from 'react';

function storageKey(trackerId: string): string {
  return `tracker:${trackerId}`;
}

function loadDone(trackerId: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(trackerId));
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveDone(trackerId: string, done: Set<string>) {
  try {
    localStorage.setItem(storageKey(trackerId), JSON.stringify([...done]));
  } catch { /* ignore */ }
}

export function useTrackerProgress(trackerId: string, total: number) {
  const [done, setDone] = useState<Set<string>>(() => loadDone(trackerId));

  const toggle = useCallback((itemId: string) => {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId); else next.add(itemId);
      saveDone(trackerId, next);
      return next;
    });
  }, [trackerId]);

  const reset = useCallback(() => {
    if (window.confirm('Reset progress on this tracker? This cannot be undone.')) {
      const empty = new Set<string>();
      saveDone(trackerId, empty);
      setDone(empty);
    }
  }, [trackerId]);

  const count = done.size;
  const pct = useMemo(() => total === 0 ? 0 : Math.round((count / total) * 100), [count, total]);

  return { done, toggle, reset, count, total, pct };
}
