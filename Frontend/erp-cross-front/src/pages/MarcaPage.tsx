import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X, Eye, Pencil, Trash2, Badge } from 'lucide-react';
import { MarcaService } from '../services/marcaService';
import type { MarcaView } from '../types/entities';
import './PaisesPage.css';

export default function MarcaPage() {
  const navigate = useNavigate();
  const [marcas, setMarcas] = useState<MarcaView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ativos' | 'inativos' | 'todos'>('ativos');

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await MarcaService.getAll();
      setMarcas(res.data);
    } catch {
      setMarcas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = marcas.filter((m) => {
    const matchSearch =
      m.nomeMarca.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativos' ? m.ativo : !m.ativo);
    return matchSearch && matchStatus;
  });

  async function handleDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await MarcaService.remove(deleteId);
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
          <Badge size={24} className="page-title-icon" />
          <h1 className="page-title">Marcas</h1>
          <span className="page-badge">{filtered.length}</span>
        </div>
        <div className="page-actions">
          <div className="filter-select-group">
            <label htmlFor="statusFilter">Status</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ativos' | 'inativos' | 'todos')}
            >
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
              <option value="todos">Todos</option>
            </select>
          </div>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className="btn-primary" onClick={() => navigate('/marcas/novo')}>
            <Plus size={16} /> Nova Marca
          </button>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">
            {search ? 'Nenhuma marca encontrada para a busca.' : 'Nenhuma marca cadastrada.'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Marca</th>
                <th>Descrição</th>
                <th>Status</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((marca) => (
                <tr key={marca.id}>
                  <td className="col-id">{marca.id}</td>
                  <td className="col-name">{marca.nomeMarca}</td>
                  <td>{marca.descricao || '—'}</td>
                  <td>
                    <span className={`status-badge ${marca.ativo ? 'status-active' : 'status-inactive'}`}>
                      {marca.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button
                      className="btn-icon btn-view"
                      title="Visualizar"
                      onClick={() => navigate(`/marcas/visualizar/${marca.id}`)}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      title="Editar"
                      onClick={() => navigate(`/marcas/editar/${marca.id}`)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      title="Excluir"
                      onClick={() => setDeleteId(marca.id)}
                    >
                      <Trash2 size={15} />
                    </button>
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
              <p>Tem certeza que deseja excluir esta marca? Esta ação só pode ser desfeita por um Administrador.</p>
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