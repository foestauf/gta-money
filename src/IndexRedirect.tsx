import { Navigate } from 'react-router';
import { readLastRoute } from './hooks/useLastRoute';

export default function IndexRedirect() {
  const last = readLastRoute();
  const target = last && (last.startsWith('/gta5') || last.startsWith('/rdr2'))
    ? last
    : '/gta5';
  return <Navigate to={target} replace />;
}
