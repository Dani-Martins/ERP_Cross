import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X, Eye, Pencil, Trash2, FileText } from 'lucide-react';
import { NotaVendaService } from '../services/notaVendaService';
import type { NotaVendaView } from '../types/entities';
import './PaisesPage.css';

type DeleteKey = {
  numeroNota: string;
  modelo: string;
  serie: string;
  clienteId: number;
} | null;

export default function NotaVendaPage() {
  const navigate = useNavigate();
  const [notas, setNotas] = useState<NotaVendaView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [deleteId, setDeleteId] = useState<DeleteKey>(null);
  const [deleting, setDeleting] = useState(false);

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
      n.numeroNota.toLowerCase().includes(search.toLowerCase()) ||
      (n.nomeCliente ?? '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <FileText size={24} className="page-title-icon" />
          <h1 className="page-title">Notas de Venda</h1>
          <span className="page-badge">{filtered.length}</span>
        </div>
        <div className="page-actions">
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
                    {new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    {nota.totalPagar.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </td>
                  <td>
                    <span className={`status-badge ${nota.ativo ? 'status-active' : 'status-inactive'}`}>
                      {nota.status ?? (nota.ativo ? 'Ativa' : 'Inativa')}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button
                      className="btn-icon btn-view"
                      title="Visualizar"
                      onClick={() =>
                        navigate(
                          `/notas-venda/visualizar/${nota.numeroNota}/${nota.modelo}/${nota.serie}/${nota.clienteId}`
                        )
                      }
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      title="Editar"
                      onClick={() =>
                        navigate(
                          `/notas-venda/editar/${nota.numeroNota}/${nota.modelo}/${nota.serie}/${nota.clienteId}`
                        )
                      }
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      title="Excluir"
                      onClick={() => setDeleteId({
                        numeroNota: nota.numeroNota,
                        modelo: nota.modelo,
                        serie: nota.serie,
                        clienteId: nota.clienteId
                      })}
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
    </div>
  );
}