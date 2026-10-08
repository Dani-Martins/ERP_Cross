import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, Eye, CheckCircle, XCircle, Plus, Search, X } from 'lucide-react';
import { ContaPagarService } from '../services/contasService';
import type { ContaPagarView } from '../types/entities';
import './PaisesPage.css';

function fmtData(s: string) {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  return s.substring(0, 10).split('-').reverse().join('/');
}

export default function ContasPagarPage() {
  const navigate = useNavigate();
  
  const [contas, setContas] = useState<ContaPagarView[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'aberto' | 'finalizado' | 'cancelado' | 'todos'>('todos');
  const [loading, setLoading] = useState(true);
  
  // Estados de ação: exclusão
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Estados de ação: pagamento de parcela
  const [paymentActionId, setPaymentActionId] = useState<number | null>(null);
  const [paymentActioning, setPaymentActioning] = useState(false);
  
  // Estados de ação: cancelamento
  const [statusActionId, setStatusActionId] = useState<number | null>(null);
  const [statusActioning, setStatusActioning] = useState(false);

  useEffect(() => {
    // Notas de compra abertas que ainda não viraram conta entram aqui antes da listagem
    ContaPagarService.sincronizarNotas()
      .catch(() => undefined)
      .then(() => ContaPagarService.getAll())
      .then(res => setContas(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = contas.filter(c => {
    const matchSearch = !search ||
      (c.nomeFornecedor ?? '').toLowerCase().includes(search.toLowerCase()) ||
      c.numeroNota.toLowerCase().includes(search.toLowerCase());
    
    const contaStatus = (c.status || 'ABERTO').toUpperCase();
    const matchStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'aberto' && contaStatus === 'ABERTO') ||
      (statusFilter === 'finalizado' && (contaStatus === 'FINALIZADO' || contaStatus === 'FINALIZADA')) ||
      (statusFilter === 'cancelado' && contaStatus === 'CANCELADO');

    return matchSearch && matchStatus;
  });

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await ContaPagarService.remove(deleteId);
      setContas(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
      setDeleting(false);
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      setDeleting(false);
    }
  }

  async function handlePayment() {
    if (paymentActionId === null) return;
    setPaymentActioning(true);
    try {
      const conta = contas.find(c => c.id === paymentActionId);
      if (!conta?.proximaParcelaId) return;
      await ContaPagarService.pagarParcela(conta.proximaParcelaId, new Date().toISOString().substring(0, 10));
      const res = await ContaPagarService.getAll();
      setContas(res.data);
      setPaymentActionId(null);
    } catch (err) {
      console.error('Erro ao pagar parcela:', err);
    } finally {
      setPaymentActioning(false);
    }
  }

  async function handleCancelAccount() {
    if (statusActionId === null) return;
    setStatusActioning(true);
    try {
      await ContaPagarService.cancelar(statusActionId);
      setContas(prev =>
        prev.map(c =>
          c.id === statusActionId ? { ...c, status: 'CANCELADO' } : c
        )
      );
      setStatusActionId(null);
    } catch (err) {
      console.error('Erro ao cancelar conta:', err);
    } finally {
      setStatusActioning(false);
    }
  }

  function getStatusBadgeClass(status: string | null | undefined): string {
    const normalizedStatus = (status || 'ABERTO').toUpperCase();
    if (normalizedStatus === 'ABERTO') return 'badge-aberta';
    if (normalizedStatus === 'FINALIZADO' || normalizedStatus === 'FINALIZADA') return 'badge-finalizado';
    if (normalizedStatus === 'CANCELADO') return 'badge-cancelado';
    return 'badge-aberta';
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
            <button className="btn-primary" onClick={() => navigate('/contas-pagar/nova')}>
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
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nº Nota</th>
                  <th>Fornecedor</th>
                  <th>Emissão</th>
                  <th>Parcelas</th>
                  <th>Próx. Parcela</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                  <th className="col-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((conta) => (
                  <tr key={conta.id}>
                    <td className="col-id">{conta.id}</td>
                    <td className="col-name">{conta.numeroNota}</td>
                    <td>{conta.nomeFornecedor ?? '—'}</td>
                    <td>
                      {/^\d{2}\/\d{2}\/\d{4}$/.test(conta.dataEmissao)
                        ? conta.dataEmissao
                        : new Date(conta.dataEmissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <strong>{conta.parcelasPagas} de {conta.numParcela}</strong>
                    </td>
                    <td>
                      {conta.valorProximaParcela != null
                        ? conta.valorProximaParcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : '—'}
                    </td>
                    <td>
                      {conta.proximoVencimento ? fmtData(conta.proximoVencimento) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(conta.status)}`}>
                        {conta.status || 'ABERTO'}
                      </span>
                    </td>
                    <td className="col-actions">
                      <button
                        className="btn-icon btn-view"
                        title="Visualizar"
                        onClick={() => navigate(`/contas-pagar/visualizar/${conta.id}`)}
                      >
                        <Eye size={15} />
                      </button>
                      {(conta.status === 'ABERTO' || !conta.status) && (
                        <>
                          <button
                            className="btn-icon btn-success"
                            title="Pagar próxima parcela"
                            onClick={() => setPaymentActionId(conta.id)}
                            disabled={!conta.proximaParcelaId}
                            style={!conta.proximaParcelaId ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          >
                            <CheckCircle size={15} />
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            title="Cancelar"
                            onClick={() => setStatusActionId(conta.id)}
                          >
                            <XCircle size={15} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {deleteId !== null && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal modal-sm" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Exclusão</h2>
              <button className="modal-close" onClick={() => setDeleteId(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir esta conta a pagar? Esta ação só pode ser desfeita por um Administrador.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentActionId !== null && (
        <div className="modal-overlay" onClick={() => setPaymentActionId(null)}>
          <div className="modal modal-sm" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Pagamento</h2>
              <button className="modal-close" onClick={() => setPaymentActionId(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Confirmar o pagamento da próxima parcela desta conta?</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-success"
                onClick={handlePayment}
                disabled={paymentActioning}
              >
                {paymentActioning ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
              <button className="btn-secondary" onClick={() => setPaymentActionId(null)}>
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {statusActionId !== null && (
        <div className="modal-overlay" onClick={() => setStatusActionId(null)}>
          <div className="modal modal-sm" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Ação</h2>
              <button className="modal-close" onClick={() => setStatusActionId(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja cancelar esta conta a pagar?</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-danger"
                onClick={handleCancelAccount}
                disabled={statusActioning}
              >
                {statusActioning ? 'Processando...' : 'Cancelar'}
              </button>
              <button className="btn-secondary" onClick={() => setStatusActionId(null)}>
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
