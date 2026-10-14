import { useEffect, useState } from 'react';
import { TrendingUp, Eye, CheckCircle, XCircle, Plus, Search, X } from 'lucide-react';
import { ContaReceberService } from '../services/contasService';
import type { ContaReceberView } from '../types/entities';
import ContaReceberFormPage from './ContaReceberFormPage';
import ContaReceberViewPage from './ContaReceberViewPage';
import './PaisesPage.css';

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtData(s?: string | null) {
  if (!s) return '—';
  const parts = s.split('/');
  if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2]}`;
  return s.substring(0, 10).split('-').reverse().join('/');
}

function hojeLocal() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 10);
}

export default function ContasReceberPage() {
  const [contas, setContas] = useState<ContaReceberView[]>([]);
  const [busca, setBusca] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'abertos' | 'pagos'>('todos');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [paymentAction, setPaymentAction] = useState<ContaReceberView | null>(null);
  const [paymentActioning, setPaymentActioning] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [cancelAction, setCancelAction] = useState<ContaReceberView | null>(null);
  const [cancelActioning, setCancelActioning] = useState(false);
  const [cancelError, setCancelError] = useState('');

  async function load() {
    setLoading(true);
    try {
      await ContaReceberService.sincronizarNotasVenda().catch(() => undefined);
      const res = await ContaReceberService.getAll();
      setContas(res.data);
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

  const filtradas = contas.filter(c => {
    if (!c.ativo) return false;
    const matchStatus =
      filterStatus === 'todos' ? true :
      filterStatus === 'pagos' ? (c.status === 'PAGO' || c.status === 'RECEBIDO') :
      c.status !== 'PAGO' && c.status !== 'RECEBIDO' && c.status !== 'CANCELADO';
    const matchBusca = !busca ||
      (c.nomeCliente ?? '').toLowerCase().includes(busca.toLowerCase()) ||
      c.numeroNota.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  async function handlePayment() {
    if (!paymentAction) return;
    setPaymentActioning(true);
    try {
      await ContaReceberService.receber(paymentAction.id, hojeLocal());
      setPaymentAction(null);
      await load();
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setPaymentError(apiError.response?.data?.message ?? 'Não foi possível registrar o recebimento. A parcela pode já estar encerrada.');
    } finally {
      setPaymentActioning(false);
    }
  }

  async function handleCancel() {
    if (!cancelAction) return;
    setCancelActioning(true);
    try {
      await ContaReceberService.cancelar(cancelAction.id);
      setCancelAction(null);
      await load();
    } catch (err) {
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
            <TrendingUp size={24} className="page-title-icon" />
            <h1 className="page-title">Contas a Receber</h1>
            <span className="page-badge">{filtradas.length}</span>
          </div>
          <div className="page-actions">
            <div className="filter-select-group">
              <label>Status:</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}>
                <option value="todos">Todos</option>
                <option value="abertos">Em Aberto</option>
                <option value="pagos">Pagos</option>
              </select>
            </div>
            <div className="search-box">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por cliente ou nº nota..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
              {busca && (
                <button className="search-clear" onClick={() => setBusca('')}><X size={14} /></button>
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
          ) : filtradas.length === 0 ? (
            <div className="table-empty">Nenhuma conta encontrada.</div>
          ) : (
            <table className="data-table contas-pagar-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Série</th>
                  <th>Nº Nota</th>
                  <th>Cliente</th>
                  <th>Parcela</th>
                  <th>Valor Parcela</th>
                  <th style={{ width: 110 }}>Vencimento</th>
                  <th style={{ width: 110 }}>Recebimento</th>
                  <th style={{ width: 110 }}>Cancelamento</th>
                  <th className="col-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(c => {
                  const encerrada = c.status === 'PAGO' || c.status === 'RECEBIDO' || c.status === 'CANCELADO';
                  return (
                  <tr key={c.id} className={c.status === 'CANCELADO' ? 'conta-parcela-cancelada' : c.status === 'PAGO' || c.status === 'RECEBIDO' ? 'conta-parcela-paga' : undefined}>
                    <td>{c.modelo}</td>
                    <td>{c.serie}</td>
                    <td>{c.numeroNota}</td>
                    <td>{c.nomeCliente ?? '—'}</td>
                    <td style={{ textAlign: 'center' }}>{c.numParcela}</td>
                    <td><strong>{fmtMoeda(c.valorParcela)}</strong></td>
                    <td>{fmtData(c.dataVencimento)}</td>
                    <td>{c.dataRecebimento ? fmtData(c.dataRecebimento) : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>{fmtData(c.dataCancelamento)}</td>
                    <td className="col-actions" style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn-icon btn-view" title="Visualizar" onClick={() => setViewingId(c.id)}>
                        <Eye size={16} />
                      </button>
                      {!encerrada && (
                        <>
                          <button className="btn-icon btn-success" title="Confirmar recebimento" onClick={() => { setPaymentError(''); setPaymentAction(c); }}>
                            <CheckCircle size={16} />
                          </button>
                          <button className="btn-icon btn-danger" title="Cancelar parcela e próximas em aberto" onClick={() => { setCancelError(''); setCancelAction(c); }}>
                            <XCircle size={16} />
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

      {paymentAction && (
        <div className="modal-overlay" onClick={() => setPaymentAction(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Recebimento</h2>
              <button className="modal-close" onClick={() => setPaymentAction(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Confirmar o recebimento irreversível da parcela {paymentAction.numParcela} da nota {paymentAction.numeroNota}?</p>
              <p>A data de recebimento será registrada automaticamente como hoje.</p>
              {paymentError && <p className="form-error">{paymentError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={handlePayment} disabled={paymentActioning}>
                {paymentActioning ? 'Processando...' : 'Confirmar Recebimento'}
              </button>
              <button className="btn-secondary" onClick={() => setPaymentAction(null)}>Voltar</button>
            </div>
          </div>
        </div>
      )}

      {cancelAction && (
        <div className="modal-overlay" onClick={() => setCancelAction(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Cancelamento</h2>
              <button className="modal-close" onClick={() => setCancelAction(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Cancelar irreversivelmente a parcela {cancelAction.numParcela} da nota {cancelAction.numeroNota}?</p>
              <p>Esta parcela e as seguintes em aberto serão canceladas. Parcelas já recebidas serão preservadas. A data de cancelamento será automática.</p>
              {cancelError && <p className="form-error">{cancelError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-danger" onClick={handleCancel} disabled={cancelActioning}>
                {cancelActioning ? 'Processando...' : 'Confirmar Cancelamento'}
              </button>
              <button className="btn-secondary" onClick={() => setCancelAction(null)}>Voltar</button>
            </div>
          </div>
        </div>
      )}

      {(showCreateModal || editingId !== null || viewingId !== null) && (
        <div className="modal-overlay account-page-modal-overlay">
          <div className="modal account-page-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>{viewingId !== null ? 'Visualizar Conta a Receber' : editingId !== null ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}</h2>
              <button className="modal-close" type="button" aria-label="Fechar" onClick={viewingId !== null ? closeViewModal : editingId !== null ? closeEditModal : closeCreateModal}>
                <X size={20} />
              </button>
            </div>
            <div className="account-page-modal-body">
              {viewingId !== null && <ContaReceberViewPage contaId={viewingId} onClose={closeViewModal} onEdit={id => { setEditingId(id); setViewingId(null); }} />}
              {editingId !== null && <ContaReceberFormPage contaId={editingId} onClose={closeEditModal} />}
              {showCreateModal && <ContaReceberFormPage onClose={closeCreateModal} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
