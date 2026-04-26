import { createBrowserRouter } from 'react-router';
import AppShell from './AppShell';
import Gta5Page from './games/gta5/Gta5Page';
import Rdr2Layout from './games/rdr2/Rdr2Layout';
import Rdr2Hub from './games/rdr2/Rdr2Hub';
import IndexRedirect from './IndexRedirect';
import ChecklistTracker from './trackers/ChecklistTracker';
import { herbs } from './games/rdr2/trackers/herbs';
import { horses } from './games/rdr2/trackers/horses';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: IndexRedirect },
      { path: 'gta5', Component: Gta5Page },
      {
        path: 'rdr2',
        Component: Rdr2Layout,
        children: [
          { index: true, Component: Rdr2Hub },
          { path: 'herbs', element: <ChecklistTracker tracker={herbs} /> },
          { path: 'horses', element: <ChecklistTracker tracker={horses} /> },
        ],
      },
      { path: '*', Component: IndexRedirect },
    ],
  },
]);
