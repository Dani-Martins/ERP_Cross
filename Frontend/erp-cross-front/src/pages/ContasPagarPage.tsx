import { useEffect, useState } from 'react';
import { TrendingDown, Eye, CheckCircle, XCircle, Plus, Search, X } from 'lucide-react';
import { ContaPagarService } from '../services/contasService';
import type { ContaPagarParcela, ContaPagarView } from '../types/entities';
import ContaPagarFormPage from './ContaPagarFormPage';
import ContaPagarViewPage from './ContaPagarViewPage';
import './PaisesPage.css';

type ContaPagarLinha = { conta: ContaPagarView; parcela: ContaPagarParcela };

function fmtData(s?: string | null) {
  if (!s) return '—';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  return s.substring(0, 10).split('-').reverse().join('/');
}

function hojeLocal() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 10);
}

export default function ContasPagarPage() {
  const [parcelas, setParcelas] = useState<ContaPagarLinha[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'aberto' | 'finalizado' | 'cancelado' | 'todos'>('todos');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [paymentAction, setPaymentAction] = useState<ContaPagarLinha | null>(null);
  const [paymentActioning, setPaymentActioning] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [cancelAction, setCancelAction] = useState<ContaPagarLinha | null>(null);
  const [cancelActioning, setCancelActioning] = useState(false);
  const [cancelError, setCancelError] = useState('');

  async function load() {
    setLoading(true);
    try {
      await ContaPagarService.sincronizarNotas().catch(() => undefined);
      const res = await ContaPagarService.getAll();
      const rows = await Promise.all(res.data.map(async conta => {
        const parcelasConta = await ContaPagarService.getParcelas(conta.id);
        return parcelasConta.data.map(parcela => ({ conta, parcela }));
      }));
      setParcelas(rows.flat());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function closeCreateModal() {
    setShowCreateModal(false);
    void load();
  }

  function closeViewModal() {
    setViewingId(null);
    void load();
  }

  function closeEditModal() {
    setEditingId(null);
    void load();
  }

  const filtered = parcelas.filter(({ conta, parcela }) => {
    const matchSearch = !search ||
      (conta.nomeFornecedor ?? '').toLowerCase().includes(search.toLowerCase()) ||
      conta.numeroNota.toLowerCase().includes(search.toLowerCase()) ||
      conta.modelo.toLowerCase().includes(search.toLowerCase()) ||
      conta.serie.toLowerCase().includes(search.toLowerCase());
    const contaStatus = parcela.cancelada ? 'CANCELADO' : parcela.pago ? 'FINALIZADO' : 'ABERTO';
    const matchStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'aberto' && contaStatus === 'ABERTO') ||
      (statusFilter === 'finalizado' && contaStatus === 'FINALIZADO') ||
      (statusFilter === 'cancelado' && contaStatus === 'CANCELADO');

    return matchSearch && matchStatus;
  });

  async function handlePayment() {
    if (!paymentAction) return;
    setPaymentActioning(true);
    try {
      await ContaPagarService.pagarParcela(paymentAction.parcela.id, hojeLocal());
      setPaymentAction(null);
      await load();
    } catch (err) {
      console.error('Erro ao pagar parcela:', err);
      const apiError = err as { response?: { data?: { message?: string } } };
      setPaymentError(apiError.response?.data?.message ?? 'Não foi possível registrar o pagamento. A parcela pode já estar encerrada.');
    } finally {
      setPaymentActioning(false);
    }
  }

  async function handleCancelParcela() {
    if (!cancelAction) return;
    setCancelActioning(true);
    try {
      await ContaPagarService.cancelarParcela(cancelAction.parcela.id);
      setCancelAction(null);
      await load();
    } catch (err) {
      console.error('Erro ao cancelar parcela:', err);
      const apiError = err as { response?: { data?: { message?: string } } };
      setCancelError(apiError.response?.data?.message ?? 'Não foi possível cancelar. Verifique se a migração do banco foi aplicada e se a parcela continua aberta.');
    } finally {
      setCancelActioning(false);
    }
  }

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-title-area">
            <TrendingDown size={24} className="page-title-icon" />
            <h1 className="page-title">Contas a Pagar</h1>
            <span className="page-badge">{filtered.length}</span>
          </div>
          <div className="page-actions">
            <div className="filter-select-group">
              <label htmlFor="statusFilter">Status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'aberto' | 'finalizado' | 'cancelado' | 'todos')}
              >
                <option value="todos">Todos</option>
                <option value="aberto">Aberto</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="search-box">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por fornecedor ou nº nota..."
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
              <Plus size={16} /> Nova Conta
            </button>
          </div>
        </div>

        <div className="table-card">
          {loading ? (
            <div className="table-loading">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">
              {search ? 'Nenhuma conta encontrada para a busca.' : 'Nenhuma conta cadastrada.'}
            </div>
          ) : (
            <table className="data-table contas-pagar-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Série</th>
                  <th>Nº Nota</th>
                  <th>Fornecedor</th>
                  <th>Parcela</th>
                  <th>Valor Parcela</th>
                  <th>Vencimento</th>
                  <th>Pagamento</th>
                  <th>Cancelamento</th>
                  <th className="col-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ conta, parcela }) => {
                  const encerrada = parcela.pago || parcela.cancelada;
                  return (
                  <tr key={parcela.id} className={parcela.cancelada ? 'conta-parcela-cancelada' : parcela.pago ? 'conta-parcela-paga' : undefined}>
                    <td>{conta.modelo || '—'}</td>
                    <td>{conta.serie || '—'}</td>
                    <td className="col-name">{conta.numeroNota}</td>
                    <td>{conta.nomeFornecedor ?? '—'}</td>
                    <td>{parcela.numParcela}/{conta.numParcela}</td>
                    <td>{parcela.valorParcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>{fmtData(parcela.dataVencimento)}</td>
                    <td>{fmtData(parcela.dataPagamento)}</td>
                    <td>{fmtData(parcela.dataCancelamento)}</td>
                    <td className="col-actions">
                      <button
                        className="btn-icon btn-view"
                        title="Visualizar"
                        onClick={() => setViewingId(conta.id)}
                      >
                        <Eye size={15} />
                      </button>
                      {!encerrada && (
                        <>
                          <button className="btn-icon btn-success" title="Confirmar pagamento" onClick={() => setPaymentAction({ conta, parcela })}>
                            <CheckCircle size={15} />
                          </button>
                          <button className="btn-icon btn-danger" title="Cancelar parcela e próximas em aberto" onClick={() => { setCancelError(''); setCancelAction({ conta, parcela }); }}>
                            <XCircle size={15} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {paymentAction !== null && (
        <div className="modal-overlay" onClick={() => setPaymentAction(null)}>
          <div className="modal modal-sm" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Pagamento</h2>
              <button className="modal-close" onClick={() => setPaymentAction(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Confirmar o pagamento irreversível da parcela {paymentAction.parcela.numParcela} da nota {paymentAction.conta.numeroNota}?</p>
              <p>Após confirmar, não será possível desfazer o pagamento.</p>
              {paymentError && <p className="form-error">{paymentError}</p>}
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary"
                onClick={handlePayment}
                disabled={paymentActioning}
              >
                {paymentActioning ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
              <button className="btn-secondary" onClick={() => setPaymentAction(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelAction !== null && (
        <div className="modal-overlay" onClick={() => setCancelAction(null)}>
          <div className="modal modal-sm" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Cancelamento</h2>
              <button className="modal-close" onClick={() => setCancelAction(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Cancelar irreversivelmente a parcela {cancelAction.parcela.numParcela} da nota {cancelAction.conta.numeroNota}?</p>
              <p>Esta parcela e as seguintes em aberto serão canceladas. Parcelas já pagas serão preservadas. A data de cancelamento será automática.</p>
              {cancelError && <p className="form-error">{cancelError}</p>}
            </div>
            <div className="modal-footer">
              <button
                className="btn-danger"
                onClick={handleCancelParcela}
                disabled={cancelActioning}
              >
                {cancelActioning ? 'Processando...' : 'Confirmar Cancelamento'}
              </button>
              <button className="btn-secondary" onClick={() => setCancelAction(null)}>
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {(showCreateModal || editingId !== null || viewingId !== null) && (
        <div className="modal-overlay account-page-modal-overlay">
          <div className="modal account-page-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>{viewingId !== null ? 'Visualizar Conta a Pagar' : editingId !== null ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}</h2>
              <button className="modal-close" type="button" aria-label="Fechar" onClick={viewingId !== null ? closeViewModal : editingId !== null ? closeEditModal : closeCreateModal}>
                <X size={20} />
              </button>
            </div>
            <div className="account-page-modal-body">
              {viewingId !== null && <ContaPagarViewPage contaId={viewingId} onClose={closeViewModal} onEdit={id => { setEditingId(id); setViewingId(null); }} />}
              {editingId !== null && <ContaPagarFormPage contaId={editingId} onClose={closeEditModal} />}
              {showCreateModal && <ContaPagarFormPage onClose={closeCreateModal} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
