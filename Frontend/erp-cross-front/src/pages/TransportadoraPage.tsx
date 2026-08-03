import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X, Eye, Pencil, Trash2, Truck } from 'lucide-react';
import { TransportadoraService } from '../services/transportadoraService';
import type { TransportadoraView } from '../types/entities';
import './PaisesPage.css';

export default function TransportadoraPage() {
  const navigate = useNavigate();
  const [transportadoras, setTransportadoras] = useState<TransportadoraView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ativos' | 'inativos' | 'todos'>('ativos');

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await TransportadoraService.getAll();
      setTransportadoras(res.data);
    } catch {
      setTransportadoras([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = transportadoras.filter((t) => {
    const matchSearch =
      t.nome.toLowerCase().includes(search.toLowerCase()) ||
      (t.nomeFantasia ?? '').toLowerCase().includes(search.toLowerCase()) ||
      t.cpfCnpj.includes(search);
    const matchStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativos' ? t.ativo : !t.ativo);
    return matchSearch && matchStatus;
  });

  async function handleDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await TransportadoraService.remove(deleteId);
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
          <Truck size={24} className="page-title-icon" />
          <h1 className="page-title">Transportadoras</h1>
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
              placeholder="Buscar por nome ou CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className="btn-primary" onClick={() => navigate('/transportadoras/novo')}>
            <Plus size={16} /> Nova Transportadora
          </button>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">
            {search ? 'Nenhuma transportadora encontrada para a busca.' : 'Nenhuma transportadora cadastrada.'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Transportadora</th>
                <th>CNPJ</th>
                <th>Cidade</th>
                <th>Status</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((transportadora) => (
                <tr key={transportadora.id}>
                  <td className="col-id">{transportadora.id}</td>
                  <td className="col-name">
                    {transportadora.nome}
                    {transportadora.nomeFantasia && (
                      <span className="view-muted">{transportadora.nomeFantasia}</span>
                    )}
                  </td>
                  <td>{transportadora.cpfCnpj}</td>
                  <td>{transportadora.nomeCidade || '—'}</td>
                  <td>
                    <span className={`status-badge ${transportadora.ativo ? 'status-active' : 'status-inactive'}`}>
                      {transportadora.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button
                      className="btn-icon btn-view"
                      title="Visualizar"
                      onClick={() => navigate(`/transportadoras/visualizar/${transportadora.id}`)}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      title="Editar"
                      onClick={() => navigate(`/transportadoras/editar/${transportadora.id}`)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      title="Excluir"
                      onClick={() => setDeleteId(transportadora.id)}
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
              <p>Tem certeza que deseja excluir esta transportadora? Esta ação só pode ser desfeita por um Administrador.</p>
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