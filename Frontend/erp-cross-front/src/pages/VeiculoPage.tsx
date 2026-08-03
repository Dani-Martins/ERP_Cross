import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X, Eye, Pencil, Trash2, Car } from 'lucide-react';
import { VeiculoService } from '../services/veiculoService';
import type { VeiculoView } from '../types/entities';
import './PaisesPage.css';

export default function VeiculoPage() {
  const navigate = useNavigate();
  const [veiculos, setVeiculos] = useState<VeiculoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ativos' | 'inativos' | 'todos'>('ativos');

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await VeiculoService.getAll();
      setVeiculos(res.data);
    } catch {
      setVeiculos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = veiculos.filter((v) => {
    const matchSearch =
      v.placa.toLowerCase().includes(search.toLowerCase()) ||
      v.modelo.toLowerCase().includes(search.toLowerCase()) ||
      v.marca.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativos' ? v.ativo : !v.ativo);
    return matchSearch && matchStatus;
  });

  async function handleDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await VeiculoService.delete(deleteId);
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
          <Car size={24} className="page-title-icon" />
          <h1 className="page-title">Veículos</h1>
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
              placeholder="Buscar por placa, modelo ou marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className="btn-primary" onClick={() => navigate('/veiculos/novo')}>
            <Plus size={16} /> Novo Veículo
          </button>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">
            {search ? 'Nenhum veículo encontrado para a busca.' : 'Nenhum veículo cadastrado.'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Placa</th>
                <th>Modelo</th>
                <th>Marca</th>
                <th>Ano</th>
                <th>Status</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((veiculo) => (
                <tr key={veiculo.id}>
                  <td className="col-id">{veiculo.id}</td>
                  <td className="col-name">{veiculo.placa}</td>
                  <td>{veiculo.modelo}</td>
                  <td>{veiculo.marca}</td>
                  <td>{veiculo.ano || '—'}</td>
                  <td>
                    <span className={`status-badge ${veiculo.ativo ? 'status-active' : 'status-inactive'}`}>
                      {veiculo.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button
                      className="btn-icon btn-view"
                      title="Visualizar"
                      onClick={() => navigate(`/veiculos/visualizar/${veiculo.id}`)}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      title="Editar"
                      onClick={() => navigate(`/veiculos/editar/${veiculo.id}`)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      title="Excluir"
                      onClick={() => setDeleteId(veiculo.id)}
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
              <p>Tem certeza que deseja excluir este veículo? Esta ação só pode ser desfeita por um Administrador.</p>
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