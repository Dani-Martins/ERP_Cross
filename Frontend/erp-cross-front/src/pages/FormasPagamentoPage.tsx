import { useEffect, useState } from 'react';
import { CreditCard, Plus, Search, X, Eye, Pencil, Trash2 } from 'lucide-react';
import { FormaPagamentoService } from '../services/formaPagamentoService';
import type { FormaPagamentoView } from '../types/entities';
import FormaPagamentoFormPage from './FormaPagamentoFormPage';
import FormaPagamentoViewPage from './FormaPagamentoViewPage';
import './PaisesPage.css';

export default function FormasPagamentoPage() {
  const [all, setAll] = useState<FormaPagamentoView[]>([]);
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
    FormaPagamentoService.getAll()
      .then(res => setAll(res.data))
      .finally(() => setLoading(false));
  }

  function fecharModal() {
    setShowCreate(false);
    setEditingId(null);
    setViewingId(null);
    load();
  }

  const filtered = all.filter(f => {
    const matchStatus =
      filterStatus === 'todos' ? true :
      filterStatus === 'ativos' ? f.ativo : !f.ativo;
    const matchSearch = !search ||
      f.nomeFormaPagamento.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  async function handleDelete() {
    if (deleteId == null) return;
    setDeleting(true);
    try {
      await FormaPagamentoService.remove(deleteId);
      setDeleteId(null);
      load();
    } catch {
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <CreditCard size={24} className="page-title-icon" />
          <h1 className="page-title">Formas de Pagamento</h1>
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
            <Plus size={16} /> Nova Forma
          </button>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">Nenhuma forma de pagamento encontrada.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>Forma de Pagamento</th>
                <th>Aceita Parcela</th>
                <th>Status</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id}>
                  <td className="col-id">{f.id}</td>
                  <td className="col-name">{f.nomeFormaPagamento}</td>
                  <td>
                    <span className={`status-badge ${f.aceitaParcela ? 'status-active' : 'status-inactive'}`}>
                      {f.aceitaParcela ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${f.ativo ? 'status-active' : 'status-inactive'}`}>
                      {f.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button className="btn-icon btn-view" title="Visualizar" onClick={() => setViewingId(f.id)}>
                      <Eye size={16} />
                    </button>
                    <button className="btn-icon btn-edit" title="Editar" onClick={() => setEditingId(f.id)}>
                      <Pencil size={16} />
                    </button>
                    <button className="btn-icon btn-delete" title="Excluir" onClick={() => setDeleteId(f.id)}>
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
              <h2>{viewingId !== null ? 'Visualizar Forma de Pagamento' : editingId !== null ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}</h2>
              <button className="modal-close" type="button" aria-label="Fechar" onClick={fecharModal}><X size={18} /></button>
            </div>
            <div className="account-page-modal-body">
              {viewingId !== null && (
                <FormaPagamentoViewPage
                  formaId={viewingId}
                  onClose={fecharModal}
                  onEdit={id => { setEditingId(id); setViewingId(null); }}
                />
              )}
              {editingId !== null && <FormaPagamentoFormPage formaId={editingId} onClose={fecharModal} />}
              {showCreate && <FormaPagamentoFormPage onClose={fecharModal} />}
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
              <p>Tem certeza que deseja excluir esta forma de pagamento? Esta ação só pode ser desfeita por um Administrador.</p>
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
