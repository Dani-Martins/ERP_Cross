import { useEffect, useState } from 'react';
import { Plus, Search, X, Eye, FileText, XCircle } from 'lucide-react';
import { NotaVendaService } from '../services/notaVendaService';
import { ContaReceberService } from '../services/contasService';
import NotaVendaFormPage from './NotaVendaFormPage';
import NotaVendaViewPage from './NotaVendaViewPage';
import type { ContaReceberView, NotaVendaView } from '../types/entities';
import './PaisesPage.css';
import './NotaCompraPage.css';

type StatusNota = 'Em andamento' | 'Pago' | 'Cancelado';
type FiltroStatusNota = 'todos' | 'em-andamento' | 'pago' | 'cancelado';

function obterStatusNota(nota: NotaVendaView, contasReceber: ContaReceberView[]): StatusNota {
  const parcelas = contasReceber.filter(conta =>
    conta.numeroNota === nota.numeroNota && conta.modelo === nota.modelo &&
    conta.serie === nota.serie && conta.clienteId === nota.clienteId
  );
  if (!nota.ativo || nota.status?.toUpperCase() === 'CANCELADO' ||
    parcelas.some(conta => conta.status === 'CANCELADO' || Boolean(conta.dataCancelamento))) return 'Cancelado';
  if (parcelas.length > 0 && parcelas.every(conta =>
    conta.status === 'PAGO' || conta.status === 'RECEBIDO' || Boolean(conta.dataRecebimento)
  )) return 'Pago';
  return 'Em andamento';
}

export default function NotaVendaPage() {
  const [notas, setNotas] = useState<NotaVendaView[]>([]);
  const [contasReceber, setContasReceber] = useState<ContaReceberView[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notaParaVisualizar, setNotaParaVisualizar] = useState<NotaVendaView | null>(null);
  const [notaParaCancelar, setNotaParaCancelar] = useState<NotaVendaView | null>(null);
  const [cancelandoConta, setCancelandoConta] = useState(false);
  const [erroCancelamento, setErroCancelamento] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FiltroStatusNota>('todos');

  async function load() {
    setLoading(true);
    try {
      await ContaReceberService.sincronizarNotasVenda().catch(() => undefined);
      const [notasRes, contasRes] = await Promise.all([
        NotaVendaService.getAll(),
        ContaReceberService.getAll().catch(() => ({ data: [] as ContaReceberView[] })),
      ]);
      setNotas(notasRes.data);
      setContasReceber(contasRes.data);
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
      await NotaVendaService.cancelarConta(
        notaParaCancelar.numeroNota,
        notaParaCancelar.modelo,
        notaParaCancelar.serie,
        notaParaCancelar.clienteId,
      );
      setNotaParaCancelar(null);
      await load();
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setErroCancelamento(apiError.response?.data?.message ?? 'Não foi possível cancelar a conta a receber.');
    } finally {
      setCancelandoConta(false);
    }
  }

  const filtered = notas.filter((nota) => {
    const matchBusca = (nota.numeroNota ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (nota.nomeCliente ?? '').toLowerCase().includes(search.toLowerCase());
    const status = obterStatusNota(nota, contasReceber);
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
          <FileText size={24} className="page-title-icon" />
          <h1 className="page-title">Notas de Venda</h1>
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
              placeholder="Buscar por número ou cliente..."
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
                <th>Cliente</th>
                <th>Emissão</th>
                <th>Total</th>
                <th>Status</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((nota) => {
                const contasDaNota = contasReceber.filter(conta =>
                  conta.numeroNota === nota.numeroNota && conta.modelo === nota.modelo &&
                  conta.serie === nota.serie && conta.clienteId === nota.clienteId
                );
                const parcelaPaga = contasDaNota.some(conta =>
                  conta.status === 'PAGO' || conta.status === 'RECEBIDO' || Boolean(conta.dataRecebimento)
                );
                const statusFinanceiro = obterStatusNota(nota, contasReceber);
                const contaEmAberto = contasDaNota.some(conta =>
                  conta.ativo && conta.status !== 'CANCELADO' && !conta.dataCancelamento
                );
                const podeCancelar = nota.ativo && nota.status?.toUpperCase() !== 'CANCELADO' &&
                  contasDaNota.length > 0 && !parcelaPaga && contaEmAberto;
                const motivoBloqueio = parcelaPaga
                  ? 'Não é possível cancelar: já existe parcela paga/recebida.'
                  : contasDaNota.length === 0
                    ? 'Não há conta a receber vinculada a esta nota.'
                    : !contaEmAberto
                      ? 'A conta a receber já está cancelada.'
                      : 'A nota está inativa.';
                return (
                <tr key={`${nota.numeroNota}-${nota.modelo}-${nota.serie}-${nota.clienteId}`}>
                  <td className="col-id">{nota.id}</td>
                  <td className="col-name">{nota.numeroNota}</td>
                  <td>{nota.modelo}</td>
                  <td>{nota.serie}</td>
                  <td>{nota.nomeCliente ?? '—'}</td>
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
                      onClick={() => setNotaParaVisualizar(nota)}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      title={podeCancelar ? 'Cancelar conta a receber vinculada' : motivoBloqueio}
                      aria-label="Cancelar conta a receber vinculada"
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
          <div className="modal nota-create-modal" role="dialog" aria-modal="true" aria-labelledby="nota-venda-modal-title">
            <div className="modal-header">
              <h2 id="nota-venda-modal-title">Nova Nota de Venda</h2>
              <button className="modal-close" type="button" aria-label="Fechar cadastro" onClick={closeCreateModal}>
                <X size={20} />
              </button>
            </div>
            <div className="nota-create-modal-body">
              <NotaVendaFormPage onClose={closeCreateModal} />
            </div>
          </div>
        </div>
      )}

      {notaParaVisualizar && (
        <div className="modal-overlay nota-create-modal-overlay">
          <div className="modal nota-create-modal" role="dialog" aria-modal="true" aria-labelledby="nota-venda-view-title">
            <div className="modal-header">
              <h2 id="nota-venda-view-title">Visualizar Nota de Venda</h2>
              <button className="modal-close" type="button" aria-label="Fechar visualização" onClick={() => setNotaParaVisualizar(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="nota-create-modal-body">
              <NotaVendaViewPage notaKey={{
                numeroNota: notaParaVisualizar.numeroNota,
                modelo: notaParaVisualizar.modelo,
                serie: notaParaVisualizar.serie,
                clienteId: notaParaVisualizar.clienteId,
              }} onClose={() => setNotaParaVisualizar(null)} />
            </div>
          </div>
        </div>
      )}

      {notaParaCancelar !== null && (
        <div className="modal-overlay" onClick={() => setNotaParaCancelar(null)}>
          <div className="modal modal-sm" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Cancelar Conta a Receber</h2>
              <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setNotaParaCancelar(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Cancelar as parcelas em aberto da conta da nota {notaParaCancelar.numeroNota}?</p>
              <p>A nota de venda permanecerá ativa. Esta ação só pode ser feita antes de qualquer recebimento.</p>
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