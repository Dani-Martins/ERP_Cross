import { useEffect, useState } from 'react';
import { Plus, Search, X, Eye, FileText } from 'lucide-react';
import { NotaVendaService } from '../services/notaVendaService';
import NotaVendaFormPage from './NotaVendaFormPage';
import NotaVendaViewPage from './NotaVendaViewPage';
import type { NotaVendaView } from '../types/entities';
import './PaisesPage.css';
import './NotaCompraPage.css';

export default function NotaVendaPage() {
  const [notas, setNotas] = useState<NotaVendaView[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notaParaVisualizar, setNotaParaVisualizar] = useState<{
    numeroNota: string;
    modelo: string;
    serie: string;
    clienteId: number;
  } | null>(null);
  const [search, setSearch] = useState('');

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

  function closeCreateModal() {
    setShowCreateModal(false);
    void load();
  }

  const filtered = notas.filter((n) =>
    (n.numeroNota ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (n.nomeCliente ?? '').toLowerCase().includes(search.toLowerCase())
  );

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
                <th>Cliente</th>
                <th>Emissão</th>
                <th>Total</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((nota) => (
                <tr key={`${nota.numeroNota}-${nota.modelo}-${nota.serie}-${nota.clienteId}`}>
                  <td className="col-id">{nota.id}</td>
                  <td className="col-name">{nota.numeroNota}</td>
                  <td>{nota.modelo}</td>
                  <td>{nota.serie}</td>
                  <td>{nota.nomeCliente ?? '—'}</td>
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
                      onClick={() => setNotaParaVisualizar({
                        numeroNota: nota.numeroNota,
                        modelo: nota.modelo,
                        serie: nota.serie,
                        clienteId: nota.clienteId,
                      })}
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
          <div className="modal nota-create-modal" role="dialog" aria-modal="true" aria-labelledby="nota-venda-modal-title">
            <div className="modal-header">
              <h2 id="nota-venda-modal-title">Nova Nota de Venda</h2>
              <button className="modal-close" type="button" aria-label="Fechar cadastro" onClick={closeCreateModal}>
                <X size={20} />
              </button>
            </div>
            <div className="nota-create-modal-body">
              <NotaVendaFormPage onClose={closeCreateModal} />
            </div>
          </div>
        </div>
      )}

      {notaParaVisualizar && (
        <div className="modal-overlay nota-create-modal-overlay">
          <div className="modal nota-create-modal" role="dialog" aria-modal="true" aria-labelledby="nota-venda-view-title">
            <div className="modal-header">
              <h2 id="nota-venda-view-title">Visualizar Nota de Venda</h2>
              <button className="modal-close" type="button" aria-label="Fechar visualização" onClick={() => setNotaParaVisualizar(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="nota-create-modal-body">
              <NotaVendaViewPage notaKey={notaParaVisualizar} onClose={() => setNotaParaVisualizar(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}