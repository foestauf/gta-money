import { NavLink, Outlet, useLocation } from 'react-router';
import { useLastRoute } from './hooks/useLastRoute';
import './AppShell.css';

function gameForPath(pathname: string): 'gta5' | 'rdr2' | 'none' {
  if (pathname === '/gta5' || pathname.startsWith('/gta5/')) return 'gta5';
  if (pathname === '/rdr2' || pathname.startsWith('/rdr2/')) return 'rdr2';
  return 'none';
}

export default function AppShell() {
  useLastRoute();
  const location = useLocation();
  const game = gameForPath(location.pathname);

  return (
    <div data-game={game === 'none' ? undefined : game}>
      <nav className="app-shell-nav">
        <span className="app-shell-brand">Rockstar Trackers</span>
        <div className="app-shell-games">
          <NavLink
            to="/gta5"
            className={({ isActive }) =>
              `app-shell-game-link${isActive ? ' active' : ''}`
            }
          >
            GTA V
          </NavLink>
          <NavLink
            to="/rdr2"
            className={({ isActive }) =>
              `app-shell-game-link${isActive ? ' active' : ''}`
            }
          >
            RDR2
          </NavLink>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
