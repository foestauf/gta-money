import { useEffect } from 'react';

const SUFFIX = 'Rockstar Trackers';

export function useDocumentTitle(parts: string[]) {
  useEffect(() => {
    const segments = parts.filter(Boolean);
    document.title = segments.length
      ? `${segments.join(' — ')} — ${SUFFIX}`
      : SUFFIX;
  }, [parts]);
}
