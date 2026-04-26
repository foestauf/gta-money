import { NavLink, Outlet, useLocation } from 'react-router';
import './Rdr2Hub.css';
import './theme.css';

export default function Rdr2Layout() {
  const location = useLocation();
  const onTrackerPage = location.pathname !== '/rdr2';

  return (
    <>
      {onTrackerPage && (
        <nav className="rdr2-tracker-nav">
          <NavLink to="/rdr2" end>Hub</NavLink>
          <NavLink to="/rdr2/herbs">Herbs</NavLink>
          <NavLink to="/rdr2/horses">Horses</NavLink>
        </nav>
      )}
      <Outlet />
    </>
  );
}
