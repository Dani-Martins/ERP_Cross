import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import PaisesPage from '../pages/PaisesPage';
import PaisFormPage from '../pages/PaisFormPage';
import PaisViewPage from '../pages/PaisViewPage';
import EstadosPage from '../pages/EstadosPage';
import EstadoFormPage from '../pages/EstadoFormPage';
import EstadoViewPage from '../pages/EstadoViewPage';
import CidadesPage from '../pages/CidadesPage';
import CidadeFormPage from '../pages/CidadeFormPage';
import CidadeViewPage from '../pages/CidadeViewPage';

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
      { path: 'estados', element: <EstadosPage /> },
      { path: 'estados/novo', element: <EstadoFormPage /> },
      { path: 'estados/editar/:id', element: <EstadoFormPage /> },
      { path: 'estados/visualizar/:id', element: <EstadoViewPage /> },
      { path: 'cidades', element: <CidadesPage /> },
      { path: 'cidades/nova', element: <CidadeFormPage /> },
      { path: 'cidades/editar/:id', element: <CidadeFormPage /> },
      { path: 'cidades/visualizar/:id', element: <CidadeViewPage /> },
    ],
  },
]);

export default router;
