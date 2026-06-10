import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Plus, Search, X, Eye, Pencil, Trash2 } from 'lucide-react';
import { ClienteService } from '../services/clienteService';
import type { ClienteView } from '../types/entities';
import './PaisesPage.css';

export default function ClientesPage() {
  const navigate = useNavigate();
  const [all, setAll] = useState<ClienteView[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativos' | 'inativos'>('ativos');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

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
          <button className="btn-primary" onClick={() => navigate('/clientes/novo')}>
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
                  <td><span className="tag">{c.cpfCnpj}</span></td>
                  <td>{c.pf ? 'Pessoa Física' : 'Pessoa Jurídica'}</td>
                  <td>{c.nomeCidade ?? '—'}</td>
                  <td>
                    <span className={`status-badge ${c.ativo ? 'status-active' : 'status-inactive'}`}>
                      {c.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button className="btn-icon btn-view" title="Visualizar" onClick={() => navigate(`/clientes/visualizar/${c.id}`)}>
                      <Eye size={16} />
                    </button>
                    <button className="btn-icon btn-edit" title="Editar" onClick={() => navigate(`/clientes/editar/${c.id}`)}>
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
