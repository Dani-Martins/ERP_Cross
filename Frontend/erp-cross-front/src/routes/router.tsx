import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import PaisesPage from '../pages/PaisesPage';
import PaisFormPage from '../pages/PaisFormPage';
import PaisViewPage from '../pages/PaisViewPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'paises', element: <PaisesPage /> },
      { path: 'paises/novo', element: <PaisFormPage /> },
      { path: 'paises/editar/:id', element: <PaisFormPage /> },
      { path: 'paises/visualizar/:id', element: <PaisViewPage /> },
    ],
  },
]);

export default router;
