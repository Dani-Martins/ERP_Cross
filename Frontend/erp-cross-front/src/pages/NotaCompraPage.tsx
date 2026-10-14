import { useEffect, useState } from 'react';
import { Plus, Search, X, Eye, FileDown } from 'lucide-react';
import { NotaCompraService } from '../services/notaCompraService';
import NotaCompraFormPage from './NotaCompraFormPage';
import NotaCompraViewPage from './NotaCompraViewPage';
import type { NotaCompraView } from '../types/entities';
import './PaisesPage.css';
import './NotaCompraPage.css';

export default function NotaCompraPage() {
  const [notas, setNotas] = useState<NotaCompraView[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notaParaVisualizar, setNotaParaVisualizar] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await NotaCompraService.getAll();
      setNotas(res.data);
    } catch {
      setNotas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function closeCreateModal() {
    setShowCreateModal(false);
    void load();
  }

  const filtered = notas.filter((n) =>
    (n.numeroNota ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (n.nomeFornecedor ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <FileDown size={24} className="page-title-icon" />
          <h1 className="page-title">Notas de Compra</h1>
          <span className="page-badge">{filtered.length}</span>
        </div>
        <div className="page-actions">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por número ou fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
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
                <th>Modelo</th>
                <th>Série</th>
                <th>Fornecedor</th>
                <th>Emissão</th>
                <th>Total</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((nota) => (
                <tr key={nota.id}>
                  <td className="col-id">{nota.id}</td>
                  <td className="col-name">{nota.numeroNota}</td>
                  <td>{nota.modelo}</td>
                  <td>{nota.serie}</td>
                  <td>{nota.nomeFornecedor ?? '—'}</td>
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
                  <td className="col-actions">
                    <button
                      className="btn-icon btn-view"
                      title="Visualizar"
                      onClick={() => setNotaParaVisualizar(nota.id)}
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay nota-create-modal-overlay">
          <div className="modal nota-create-modal" role="dialog" aria-modal="true" aria-labelledby="nota-compra-modal-title">
            <div className="modal-header">
              <h2 id="nota-compra-modal-title">Nova Nota de Compra</h2>
              <button className="modal-close" type="button" aria-label="Fechar cadastro" onClick={closeCreateModal}>
                <X size={20} />
              </button>
            </div>
            <div className="nota-create-modal-body">
              <NotaCompraFormPage onClose={closeCreateModal} />
            </div>
          </div>
        </div>
      )}

      {notaParaVisualizar !== null && (
        <div className="modal-overlay nota-create-modal-overlay">
          <div className="modal nota-create-modal" role="dialog" aria-modal="true" aria-labelledby="nota-compra-view-title">
            <div className="modal-header">
              <h2 id="nota-compra-view-title">Visualizar Nota de Compra</h2>
              <button className="modal-close" type="button" aria-label="Fechar visualização" onClick={() => setNotaParaVisualizar(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="nota-create-modal-body">
              <NotaCompraViewPage notaId={notaParaVisualizar} onClose={() => setNotaParaVisualizar(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}