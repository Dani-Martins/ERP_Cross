import { useEffect, useState } from 'react';
import { CalendarClock, Plus, Search, X, Eye, Pencil, Trash2 } from 'lucide-react';
import { CondicaoPagamentoService } from '../services/condicaoPagamentoService';
import type { CondicaoPagamentoView } from '../types/entities';
import CondicaoPagamentoFormPage from './CondicaoPagamentoFormPage';
import CondicaoPagamentoViewPage from './CondicaoPagamentoViewPage';
import './PaisesPage.css';

function fmtPercent(n: number) {
  return n > 0 ? `${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%` : '—';
}

export default function CondicoesPagamentoPage() {
  const [all, setAll] = useState<CondicaoPagamentoView[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativos' | 'inativos'>('ativos');
  const [loading, setLoading] = useState(true);

  // Estado de ação: qual ID está sendo acionado
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    CondicaoPagamentoService.getAll()
      .then(res => setAll(res.data))
      .finally(() => setLoading(false));
  }

  function fecharModal() {
    setShowCreate(false);
    setEditingId(null);
    setViewingId(null);
    load();
  }

  const filtered = all.filter(c => {
    const matchStatus =
      filterStatus === 'todos' ? true :
      filterStatus === 'ativos' ? c.ativo : !c.ativo;
    const matchSearch = !search ||
      c.nomeCondicao.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  async function handleDelete() {
    if (deleteId == null) return;
    setDeleting(true);
    await CondicaoPagamentoService.remove(deleteId);
    setDeleteId(null);
    setDeleting(false);
    load();
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <CalendarClock size={24} className="page-title-icon" />
          <h1 className="page-title">Condições de Pagamento</h1>
          <span className="page-badge">{filtered.length}</span>
        </div>
        <div className="page-actions">
          <div className="filter-select-group">
            <label>Status:</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
              <option value="todos">Todos</option>
            </select>
          </div>
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>
            )}
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Nova Condição
          </button>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">Nenhuma condição de pagamento encontrada.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>Condição de Pagamento</th>
                <th>Juros</th>
                <th>Multa</th>
                <th>Desconto</th>
                <th>Status</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="col-id">{c.id}</td>
                  <td className="col-name">{c.nomeCondicao}</td>
                  <td>{fmtPercent(c.taxaJuros)}</td>
                  <td>{fmtPercent(c.multa)}</td>
                  <td>{fmtPercent(c.desconto)}</td>
                  <td>
                    <span className={`status-badge ${c.ativo ? 'status-active' : 'status-inactive'}`}>
                      {c.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button className="btn-icon btn-view" title="Visualizar" onClick={() => setViewingId(c.id)}>
                      <Eye size={16} />
                    </button>
                    <button className="btn-icon btn-edit" title="Editar" onClick={() => setEditingId(c.id)}>
                      <Pencil size={16} />
                    </button>
                    <button className="btn-icon btn-delete" title="Excluir" onClick={() => setDeleteId(c.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(showCreate || editingId !== null || viewingId !== null) && (
        <div className="modal-overlay">
          <div className="modal modal-form-page" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>{viewingId !== null ? 'Visualizar Condição de Pagamento' : editingId !== null ? 'Editar Condição de Pagamento' : 'Nova Condição de Pagamento'}</h2>
              <button className="modal-close" type="button" aria-label="Fechar" onClick={fecharModal}><X size={18} /></button>
            </div>
            <div className="account-page-modal-body">
              {viewingId !== null && (
                <CondicaoPagamentoViewPage
                  condicaoId={viewingId}
                  onClose={fecharModal}
                  onEdit={id => { setEditingId(id); setViewingId(null); }}
                />
              )}
              {editingId !== null && <CondicaoPagamentoFormPage condicaoId={editingId} onClose={fecharModal} />}
              {showCreate && <CondicaoPagamentoFormPage onClose={fecharModal} />}
            </div>
          </div>
        </div>
      )}

      {deleteId != null && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Exclusão</h2>
              <button className="modal-close" onClick={() => setDeleteId(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir esta condição de pagamento? Esta ação só pode ser desfeita por um Administrador.</p>
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
    </div>
  );
}
