import { useEffect } from 'react';
import { useLocation } from 'react-router';

export const LAST_ROUTE_KEY = 'app:lastRoute';

export function useLastRoute() {
  const location = useLocation();
  useEffect(() => {
    try {
      localStorage.setItem(LAST_ROUTE_KEY, location.pathname);
    } catch { /* ignore quota / privacy errors */ }
  }, [location.pathname]);
}

export function readLastRoute(): string | null {
  try {
    return localStorage.getItem(LAST_ROUTE_KEY);
  } catch {
    return null;
  }
}
