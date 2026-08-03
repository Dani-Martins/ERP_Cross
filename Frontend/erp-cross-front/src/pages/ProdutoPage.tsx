import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X, Eye, Pencil, Trash2, Package } from 'lucide-react';
import { ProdutoService } from '../services/produtoService';
import type { ProdutoView } from '../types/entities';
import './PaisesPage.css';

export default function ProdutoPage() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<ProdutoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ativos' | 'inativos' | 'todos'>('ativos');

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await ProdutoService.getAll();
      setProdutos(res.data);
    } catch {
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = produtos.filter((p) => {
    const matchSearch =
      p.nomeProduto.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativos' ? p.ativo : !p.ativo);
    return matchSearch && matchStatus;
  });

  async function handleDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await ProdutoService.remove(deleteId);
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
          <Package size={24} className="page-title-icon" />
          <h1 className="page-title">Produtos</h1>
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
          <button className="btn-primary" onClick={() => navigate('/produtos/novo')}>
            <Plus size={16} /> Novo Produto
          </button>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">
            {search ? 'Nenhum produto encontrado para a busca.' : 'Nenhum produto cadastrado.'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Produto</th>
                <th>Custo</th>
                <th>Lucro %</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Status</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((produto) => (
                <tr key={produto.id}>
                  <td className="col-id">{produto.id}</td>
                  <td className="col-name">{produto.nomeProduto}</td>
                  <td>
                    {produto.custoCompra.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </td>
                  <td>{produto.lucroPercentual.toFixed(2)}%</td>
                  <td>
                    {produto.precoVenda.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </td>
                  <td>{produto.estoque}</td>
                  <td>
                    <span className={`status-badge ${produto.ativo ? 'status-active' : 'status-inactive'}`}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button
                      className="btn-icon btn-view"
                      title="Visualizar"
                      onClick={() => navigate(`/produtos/visualizar/${produto.id}`)}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      title="Editar"
                      onClick={() => navigate(`/produtos/editar/${produto.id}`)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      title="Excluir"
                      onClick={() => setDeleteId(produto.id)}
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
              <p>Tem certeza que deseja excluir este produto? Esta ação só pode ser desfeita por um Administrador.</p>
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