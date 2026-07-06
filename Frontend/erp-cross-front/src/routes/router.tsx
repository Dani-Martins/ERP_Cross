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
import ClientesPage from '../pages/ClientesPage';
import ClienteFormPage from '../pages/ClienteFormPage';
import ClienteViewPage from '../pages/ClienteViewPage';
import FormasPagamentoPage from '../pages/FormasPagamentoPage';
import FormaPagamentoFormPage from '../pages/FormaPagamentoFormPage';
import FormaPagamentoViewPage from '../pages/FormaPagamentoViewPage';
import CondicoesPagamentoPage from '../pages/CondicoesPagamentoPage';
import CondicaoPagamentoFormPage from '../pages/CondicaoPagamentoFormPage';
import CondicaoPagamentoViewPage from '../pages/CondicaoPagamentoViewPage';
import ContasReceberPage from '../pages/ContasReceberPage';
import ContaReceberFormPage from '../pages/ContaReceberFormPage';
import ContaReceberViewPage from '../pages/ContaReceberViewPage';
import ContasPagarPage from '../pages/ContasPagarPage';
import ContaPagarFormPage from '../pages/ContaPagarFormPage';
import ContaPagarViewPage from '../pages/ContaPagarViewPage';
import FuncionariosPage from '../pages/FuncionariosPage';
import FuncionarioFormPage from '../pages/FuncionarioFormPage';
import FuncionarioViewPage from '../pages/FuncionarioViewPage';
import FornecedoresPage from '../pages/FornecedoresPage';
import FornecedorFormPage from '../pages/FornecedorFormPage';
import FornecedorViewPage from '../pages/FornecedorViewPage';
import CargoPage from '../pages/CargoPage';
import CargoFormPage from '../pages/CargoPage';
import CargoViewPage from '../pages/CargoViewPage';

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
      { path: 'clientes', element: <ClientesPage /> },
      { path: 'clientes/novo', element: <ClienteFormPage /> },
      { path: 'clientes/editar/:id', element: <ClienteFormPage /> },
      { path: 'clientes/visualizar/:id', element: <ClienteViewPage /> },
      { path: 'formas-pagamento', element: <FormasPagamentoPage /> },
      { path: 'formas-pagamento/nova', element: <FormaPagamentoFormPage /> },
      { path: 'formas-pagamento/editar/:id', element: <FormaPagamentoFormPage /> },
      { path: 'formas-pagamento/visualizar/:id', element: <FormaPagamentoViewPage /> },
      { path: 'condicoes-pagamento', element: <CondicoesPagamentoPage /> },
      { path: 'condicoes-pagamento/nova', element: <CondicaoPagamentoFormPage /> },
      { path: 'condicoes-pagamento/editar/:id', element: <CondicaoPagamentoFormPage /> },
      { path: 'condicoes-pagamento/visualizar/:id', element: <CondicaoPagamentoViewPage /> },
      { path: 'contas-receber', element: <ContasReceberPage /> },
      { path: 'contas-receber/nova', element: <ContaReceberFormPage /> },
      { path: 'contas-receber/editar/:id', element: <ContaReceberFormPage /> },
      { path: 'contas-receber/visualizar/:id', element: <ContaReceberViewPage /> },
      { path: 'contas-pagar', element: <ContasPagarPage /> },
      { path: 'contas-pagar/nova', element: <ContaPagarFormPage /> },
      { path: 'contas-pagar/editar/:id', element: <ContaPagarFormPage /> },
      { path: 'contas-pagar/visualizar/:id', element: <ContaPagarViewPage /> },
      { path: 'funcionarios', element: <FuncionariosPage /> },
      { path: 'funcionarios/novo', element: <FuncionarioFormPage /> },
      { path: 'funcionarios/editar/:id', element: <FuncionarioFormPage /> },
      { path: 'funcionarios/visualizar/:id', element: <FuncionarioViewPage /> },
      { path: 'fornecedores', element: <FornecedoresPage /> },
      { path: 'fornecedores/novo', element: <FornecedorFormPage /> },
      { path: 'fornecedores/editar/:id', element: <FornecedorFormPage /> },
      { path: 'fornecedores/visualizar/:id', element: <FornecedorViewPage /> },
      { path: 'cargos', element: <CargoPage /> },
      { path: 'cargos/novo', element: <CargoFormPage /> },
      { path: 'cargos/editar/:id', element: <CargoFormPage /> },
      { path: 'cargos/visualizar/:id', element: <CargoViewPage /> },
    ],
  },
]);

export default router;
