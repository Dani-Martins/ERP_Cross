import { useEffect, useState } from 'react';
import { UserCircle, Plus, Search, X, Eye, Pencil, Trash2 } from 'lucide-react';
import { ClienteService } from '../services/clienteService';
import type { ClienteView } from '../types/entities';
import ClienteFormPage from './ClienteFormPage';
import ClienteViewPage from './ClienteViewPage';
import './PaisesPage.css';

/** Mascara CPF → ***.456.789-** | CNPJ → 12.345.678/****-** */
function maskDoc(doc: string, pf: boolean): string {
  const d = doc.replace(/\D/g, '');
  if (pf && d.length === 11) {
    return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
  }
  if (!pf && d.length === 14) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/****-**`;
  }
  // fallback: apenas oculta o meio
  return doc.slice(0, 3) + '***' + doc.slice(-2);
}

export default function ClientesPage() {
  const [all, setAll] = useState<ClienteView[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativos' | 'inativos'>('ativos');
  const [loading, setLoading] = useState(true);
  
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  // Estado de ação: qual ID está sendo acionado
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  function fecharModal() {
    setShowCreate(false);
    setEditingId(null);
    setViewingId(null);
    load();
  }

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    ClienteService.getAll()
      .then(res => setAll(res.data))
      .finally(() => setLoading(false));
  }

  const filtered = all.filter(c => {
    const matchStatus =
      filterStatus === 'todos' ? true :
      filterStatus === 'ativos' ? c.ativo :
      !c.ativo;
    const s = search.toLowerCase();
    const matchSearch = !s ||
      c.nome.toLowerCase().includes(s) ||
      (c.nomeFantasia?.toLowerCase().includes(s) ?? false) ||
      c.cpfCnpj.includes(s) ||
      (c.nomeCidade?.toLowerCase().includes(s) ?? false);
    return matchStatus && matchSearch;
  });

  async function handleDelete() {
    if (deleteId == null) return;
    setDeleting(true);
    await ClienteService.remove(deleteId);
    setDeleteId(null);
    setDeleting(false);
    load();
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <UserCircle size={24} className="page-title-icon" />
          <h1 className="page-title">Clientes</h1>
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
              placeholder="Buscar por nome, CPF/CNPJ ou cidade..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>
            )}
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Novo Cliente
          </button>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">Nenhum cliente encontrado.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>Cliente</th>
                <th>CPF / CNPJ</th>
                <th>Tipo</th>
                <th>Cidade</th>
                <th>Status</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="col-id">{c.id}</td>
                  <td className="col-name">
                    {c.nome}
                    {c.nomeFantasia && (
                      <span className="view-muted" style={{ display: 'block', fontSize: '0.78rem' }}>
                        {c.nomeFantasia}
                      </span>
                    )}
                  </td>
                  <td><span className="tag">{maskDoc(c.cpfCnpj, c.pf)}</span></td>
                  <td>{c.pf ? 'Pessoa Física' : 'Pessoa Jurídica'}</td>
                  <td>{c.nomeCidade ?? '—'}</td>
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
              <h2>{viewingId !== null ? 'Visualizar Cliente' : editingId !== null ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button className="modal-close" type="button" aria-label="Fechar" onClick={fecharModal}><X size={18} /></button>
            </div>
            <div className="account-page-modal-body">
              {viewingId !== null && (
                <ClienteViewPage
                  clienteId={viewingId}
                  onClose={fecharModal}
                  onEdit={id => { setEditingId(id); setViewingId(null); }}
                />
              )}
              {editingId !== null && <ClienteFormPage clienteId={editingId} onClose={fecharModal} />}
              {showCreate && <ClienteFormPage onClose={fecharModal} />}
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
              <p>Tem certeza que deseja excluir este cliente? Esta ação só pode ser desfeita por um Administrador.</p>
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
