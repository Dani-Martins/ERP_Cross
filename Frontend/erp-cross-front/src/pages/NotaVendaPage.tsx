import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X, Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import { NotaVendaService } from '../services/notaVendaService';
import type { NotaVendaView } from '../types/entities';
import './PaisesPage.css';
import './NotaCompraPage.css';

export default function NotaVendaPage() {
  const navigate = useNavigate();
  const [notas, setNotas] = useState<NotaVendaView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'aberta' | 'finalizado' | 'cancelado' | 'todos'>('todos');

  const [deleteId, setDeleteId] = useState<{
    numeroNota: string;
    modelo: string;
    serie: string;
    clienteId: number;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const [statusActionId, setStatusActionId] = useState<{
    numeroNota: string;
    modelo: string;
    serie: string;
    clienteId: number;
  } | null>(null);
  const [statusActionType, setStatusActionType] = useState<'finalizar' | 'cancelar' | null>(null);
  const [statusActioning, setStatusActioning] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await NotaVendaService.getAll();
      setNotas(res.data);
    } catch {
      setNotas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = notas.filter((n) => {
    const matchSearch =
      (n.numeroNota ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (n.nomeCliente ?? '').toLowerCase().includes(search.toLowerCase());
    
    const notaStatus = (n.status || 'ABERTA').toUpperCase();
    const matchStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'aberta' && notaStatus === 'ABERTA') ||
      (statusFilter === 'finalizado' && (notaStatus === 'FINALIZADO' || notaStatus === 'FINALIZADA')) ||
      (statusFilter === 'cancelado' && notaStatus === 'CANCELADO');
    
    return matchSearch && matchStatus;
  });

  async function handleDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await NotaVendaService.remove(
        deleteId.numeroNota,
        deleteId.modelo,
        deleteId.serie,
        deleteId.clienteId
      );
      setDeleteId(null);
      load();
    } catch {
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange() {
    if (statusActionId === null || statusActionType === null) return;
    setStatusActioning(true);
    try {
      const nota = notas.find(n => 
        n.numeroNota === statusActionId.numeroNota &&
        n.modelo === statusActionId.modelo &&
        n.serie === statusActionId.serie &&
        n.clienteId === statusActionId.clienteId
      );
      if (!nota) return;
      
      const novoStatus = statusActionType === 'finalizar' ? 'FINALIZADO' : 'CANCELADO';
      const formToUpdate = {
        ...nota,
        status: novoStatus,
      };
      
      await NotaVendaService.update(
        statusActionId.numeroNota,
        statusActionId.modelo,
        statusActionId.serie,
        statusActionId.clienteId,
        formToUpdate
      );
      setStatusActionId(null);
      setStatusActionType(null);
      load();
    } catch {
      setStatusActionId(null);
      setStatusActionType(null);
    } finally {
      setStatusActioning(false);
    }
  }

  function getStatusBadgeClass(status: string | null | undefined): string {
    const normalizedStatus = (status || 'ABERTA').toUpperCase();
    if (normalizedStatus === 'ABERTA') return 'badge-aberta';
    if (normalizedStatus === 'FINALIZADO' || normalizedStatus === 'FINALIZADA') return 'badge-finalizado';
    if (normalizedStatus === 'CANCELADO') return 'badge-cancelado';
    return 'badge-aberta';
  }

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
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'aberta' | 'finalizado' | 'cancelado' | 'todos')}
            >
              <option value="aberta">Aberta</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
              <option value="todos">Todos</option>
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
          <button className="btn-primary" onClick={() => navigate('/notas-venda/nova')}>
            <Plus size={16} /> Nova Nota
          </button>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">
            {search ? 'Nenhuma nota encontrada para a busca.' : 'Nenhuma nota cadastrada.'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Número</th>
                <th>Cliente</th>
                <th>Emissão</th>
                <th>Total</th>
                <th>Status</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((nota) => (
                <tr key={`${nota.numeroNota}-${nota.modelo}-${nota.serie}-${nota.clienteId}`}>
                  <td className="col-id">{nota.numeroNota}</td>
                  <td className="col-name">{nota.numeroNota}</td>
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
                    <span className={`badge ${getStatusBadgeClass(nota.status)}`}>
                      {nota.status || 'EM ANDAMENTO'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button
                      className="btn-icon btn-view"
                      title="Visualizar"
                      onClick={() => navigate(`/notas-venda/visualizar/${nota.numeroNota}/${nota.modelo}/${nota.serie}/${nota.clienteId}`)}
                    >
                      <Eye size={15} />
                    </button>
                    {(nota.status === 'ABERTA' || !nota.status) && (
                      <>
                        <button
                          className="btn-icon btn-success"
                          title="Finalizar"
                          onClick={() => {
                            setStatusActionId({
                              numeroNota: nota.numeroNota,
                              modelo: nota.modelo,
                              serie: nota.serie,
                              clienteId: nota.clienteId
                            });
                            setStatusActionType('finalizar');
                          }}
                        >
                          <CheckCircle size={15} />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          title="Cancelar"
                          onClick={() => {
                            setStatusActionId({
                              numeroNota: nota.numeroNota,
                              modelo: nota.modelo,
                              serie: nota.serie,
                              clienteId: nota.clienteId
                            });
                            setStatusActionType('cancelar');
                          }}
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

      {deleteId !== null && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal modal-sm" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Exclusão</h2>
              <button className="modal-close" onClick={() => setDeleteId(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir esta nota de venda? Esta ação só pode ser desfeita por um Administrador.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {statusActionId !== null && statusActionType !== null && (
        <div className="modal-overlay" onClick={() => setStatusActionId(null)}>
          <div className="modal modal-sm" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Ação</h2>
              <button className="modal-close" onClick={() => setStatusActionId(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>
                {statusActionType === 'finalizar'
                  ? 'Tem certeza que deseja finalizar esta nota de venda?'
                  : 'Tem certeza que deseja cancelar esta nota de venda?'}
              </p>
            </div>
            <div className="modal-footer">
              <button
                className={statusActionType === 'finalizar' ? 'btn-success' : 'btn-danger'}
                onClick={handleStatusChange}
                disabled={statusActioning}
              >
                {statusActioning
                  ? 'Processando...'
                  : statusActionType === 'finalizar'
                    ? 'Finalizar'
                    : 'Cancelar'}
              </button>
              <button className="btn-secondary" onClick={() => setStatusActionId(null)}>Voltar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}