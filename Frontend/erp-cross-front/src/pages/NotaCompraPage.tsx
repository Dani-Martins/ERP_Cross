import { useEffect, useState } from 'react';
import { Plus, Search, X, Eye, FileDown, XCircle } from 'lucide-react';
import { NotaCompraService } from '../services/notaCompraService';
import { ContaPagarService } from '../services/contasService';
import NotaCompraFormPage from './NotaCompraFormPage';
import NotaCompraViewPage from './NotaCompraViewPage';
import type { ContaPagarView, NotaCompraView } from '../types/entities';
import './PaisesPage.css';
import './NotaCompraPage.css';

type StatusNota = 'Em andamento' | 'Pago' | 'Cancelado';
type FiltroStatusNota = 'todos' | 'em-andamento' | 'pago' | 'cancelado';

function obterStatusNota(nota: NotaCompraView, conta?: ContaPagarView): StatusNota {
  if (!nota.ativo || nota.status?.toUpperCase() === 'CANCELADO' || conta?.status === 'CANCELADO') return 'Cancelado';
  if (conta?.status === 'FINALIZADO' || Boolean(conta && (conta.numParcela ?? 0) > 0 &&
    (conta.parcelasPagas ?? 0) >= (conta.numParcela ?? 0))) return 'Pago';
  return 'Em andamento';
}

export default function NotaCompraPage() {
  const [notas, setNotas] = useState<NotaCompraView[]>([]);
  const [contasPagar, setContasPagar] = useState<ContaPagarView[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notaParaVisualizar, setNotaParaVisualizar] = useState<number | null>(null);
  const [notaParaCancelar, setNotaParaCancelar] = useState<NotaCompraView | null>(null);
  const [cancelandoConta, setCancelandoConta] = useState(false);
  const [erroCancelamento, setErroCancelamento] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FiltroStatusNota>('todos');

  async function load() {
    setLoading(true);
    try {
      await ContaPagarService.sincronizarNotas().catch(() => undefined);
      const [notasRes, contasRes] = await Promise.all([
        NotaCompraService.getAll(),
        ContaPagarService.getAll().catch(() => ({ data: [] as ContaPagarView[] })),
      ]);
      setNotas(notasRes.data);
      setContasPagar(contasRes.data);
    } catch {
      setNotas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function closeCreateModal() {
    setShowCreateModal(false);
    void load();
  }

  async function cancelarContaVinculada() {
    if (!notaParaCancelar) return;
    setCancelandoConta(true);
    setErroCancelamento('');
    try {
      await NotaCompraService.cancelarConta(notaParaCancelar.id);
      setNotaParaCancelar(null);
      await load();
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setErroCancelamento(apiError.response?.data?.message ?? 'Não foi possível cancelar a conta a pagar.');
    } finally {
      setCancelandoConta(false);
    }
  }

  const filtered = notas.filter((nota) => {
    const matchBusca = (nota.numeroNota ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (nota.nomeFornecedor ?? '').toLowerCase().includes(search.toLowerCase());
    const status = obterStatusNota(nota, contasPagar.find(conta => conta.notaCompraId === nota.id));
    const matchStatus = statusFilter === 'todos' ||
      (statusFilter === 'em-andamento' && status === 'Em andamento') ||
      (statusFilter === 'pago' && status === 'Pago') ||
      (statusFilter === 'cancelado' && status === 'Cancelado');
    return matchBusca && matchStatus;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <FileDown size={24} className="page-title-icon" />
          <h1 className="page-title">Notas de Compra</h1>
          <span className="page-badge">{filtered.length}</span>
        </div>
        <div className="page-actions">
          <div className="filter-select-group">
            <label htmlFor="statusFilter">Status</label>
            <select id="statusFilter" value={statusFilter} onChange={event => setStatusFilter(event.target.value as FiltroStatusNota)}>
              <option value="todos">Todos</option>
              <option value="em-andamento">Em andamento</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por número ou fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Nova Nota
          </button>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">
            {search || statusFilter !== 'todos' ? 'Nenhuma nota encontrada para os filtros.' : 'Nenhuma nota cadastrada.'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Número</th>
                <th>Modelo</th>
                <th>Série</th>
                <th>Fornecedor</th>
                <th>Emissão</th>
                <th>Total</th>
                <th>Status</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((nota) => {
                const conta = contasPagar.find(item => item.notaCompraId === nota.id);
                const statusFinanceiro = obterStatusNota(nota, conta);
                const podeCancelar = nota.ativo && nota.status?.toUpperCase() !== 'CANCELADO' &&
                  conta?.status === 'ABERTO' && conta.parcelasPagas === 0;
                const motivoBloqueio = conta?.parcelasPagas
                  ? 'Não é possível cancelar: já existe parcela paga.'
                  : conta?.status === 'CANCELADO'
                    ? 'A conta a pagar já está cancelada.'
                    : !conta
                      ? 'Não há conta a pagar vinculada a esta nota.'
                      : 'A nota está inativa ou a conta não está aberta.';
                return (
                <tr key={nota.id}>
                  <td className="col-id">{nota.id}</td>
                  <td className="col-name">{nota.numeroNota}</td>
                  <td>{nota.modelo}</td>
                  <td>{nota.serie}</td>
                  <td>{nota.nomeFornecedor ?? '—'}</td>
                  <td>
                    {/^\d{2}\/\d{2}\/\d{4}$/.test(nota.dataEmissao)
                      ? nota.dataEmissao
                      : new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    {nota.totalPagar.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </td>
                  <td>
                    <span className={`status-badge ${statusFinanceiro === 'Pago' ? 'status-active' : statusFinanceiro === 'Cancelado' ? 'status-inactive' : 'status-progress'}`}>
                      {statusFinanceiro}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button
                      className="btn-icon btn-view"
                      title="Visualizar"
                      onClick={() => setNotaParaVisualizar(nota.id)}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      title={podeCancelar ? 'Cancelar conta a pagar vinculada' : motivoBloqueio}
                      aria-label="Cancelar conta a pagar vinculada"
                      disabled={!podeCancelar}
                      onClick={() => { setErroCancelamento(''); setNotaParaCancelar(nota); }}
                    >
                      <XCircle size={15} />
                    </button>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay nota-create-modal-overlay">
          <div className="modal nota-create-modal" role="dialog" aria-modal="true" aria-labelledby="nota-compra-modal-title">
            <div className="modal-header">
              <h2 id="nota-compra-modal-title">Nova Nota de Compra</h2>
              <button className="modal-close" type="button" aria-label="Fechar cadastro" onClick={closeCreateModal}>
                <X size={20} />
              </button>
            </div>
            <div className="nota-create-modal-body">
              <NotaCompraFormPage onClose={closeCreateModal} />
            </div>
          </div>
        </div>
      )}

      {notaParaVisualizar !== null && (
        <div className="modal-overlay nota-create-modal-overlay">
          <div className="modal nota-create-modal" role="dialog" aria-modal="true" aria-labelledby="nota-compra-view-title">
            <div className="modal-header">
              <h2 id="nota-compra-view-title">Visualizar Nota de Compra</h2>
              <button className="modal-close" type="button" aria-label="Fechar visualização" onClick={() => setNotaParaVisualizar(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="nota-create-modal-body">
              <NotaCompraViewPage notaId={notaParaVisualizar} onClose={() => setNotaParaVisualizar(null)} />
            </div>
          </div>
        </div>
      )}

      {notaParaCancelar !== null && (
        <div className="modal-overlay" onClick={() => setNotaParaCancelar(null)}>
          <div className="modal modal-sm" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Cancelar Conta a Pagar</h2>
              <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setNotaParaCancelar(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Cancelar as parcelas em aberto da conta da nota {notaParaCancelar.numeroNota}?</p>
              <p>A nota de compra permanecerá ativa. Esta ação só pode ser feita antes de qualquer pagamento.</p>
              {erroCancelamento && <p className="form-error">{erroCancelamento}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-danger" onClick={cancelarContaVinculada} disabled={cancelandoConta}>
                {cancelandoConta ? 'Processando...' : 'Confirmar Cancelamento'}
              </button>
              <button className="btn-secondary" onClick={() => setNotaParaCancelar(null)}>Voltar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}