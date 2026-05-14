import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import PaisesPage from '../pages/PaisesPage';

// Páginas serão adicionadas progressivamente aqui
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'paises', element: <PaisesPage /> },
      // { path: 'cidades', element: <CidadesPage /> },
      // { path: 'cargos', element: <CargosPage /> },
      // ... demais módulos
    ],
  },
]);

export default router;
