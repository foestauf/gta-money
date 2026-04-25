import { createBrowserRouter } from 'react-router';
import AppShell from './AppShell';
import Gta5Page from './games/gta5/Gta5Page';
import IndexRedirect from './IndexRedirect';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: IndexRedirect },
      { path: 'gta5', Component: Gta5Page },
      {
        path: 'rdr2',
        children: [
          { index: true, element: <div>RDR2 hub (placeholder)</div> },
          { path: 'herbs', element: <div>Herbs tracker (placeholder)</div> },
          { path: 'horses', element: <div>Horses tracker (placeholder)</div> },
        ],
      },
      { path: '*', Component: IndexRedirect },
    ],
  },
]);
