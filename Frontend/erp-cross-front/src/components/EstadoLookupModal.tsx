import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { EstadoService } from '../services/estadoService';
import type { EstadoView } from '../types/entities';
import EstadoCreateModal from './EstadoCreateModal';
import '../pages/PaisesPage.css';

interface Props {
  onSelect: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function EstadoLookupModal({ onSelect, onClose, zBase = 1000 }: Props) {
  const [all, setAll] = useState<EstadoView[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    EstadoService.getAll()
      .then(res => setAll(res.data.filter(e => e.ativo)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? all.filter(e =>
        e.nomeEstado.toLowerCase().includes(search.toLowerCase()) ||
        e.uf.toLowerCase().includes(search.toLowerCase()) ||
        (e.nomePais?.toLowerCase().includes(search.toLowerCase()) ?? false)
      )
    : all;

  function handleCreated(id: number, nome: string) {
    setShowCreate(false);
    onSelect(id, nome);
  }

  return (
    <>
      <div
        className="modal-overlay"
        style={{ zIndex: zBase }}
        onClick={onClose}
      >
        <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Selecionar Estado</h2>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-body lookup-modal-body">
            <div className="lookup-search-bar">
              <Search size={15} className="lookup-search-icon" />
              <input
                type="text"
                placeholder="Pesquisar por nome, UF ou país..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            {loading ? (
              <div className="table-loading">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="table-empty">Nenhum estado encontrado.</div>
            ) : (
              <div className="lookup-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>NOME</th>
                      <th>UF</th>
                      <th>PAÍS</th>
                      <th style={{ width: 110 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(e => (
                      <tr key={e.id}>
                        <td className="col-name">{e.nomeEstado}</td>
                        <td><span className="tag">{e.uf}</span></td>
                        <td>{e.nomePais ?? '—'}</td>
                        <td>
                          <button className="btn-select" onClick={() => onSelect(e.id, e.nomeEstado)}>
                            Selecionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn-primary" type="button" onClick={() => setShowCreate(true)}>
              <Plus size={15} /> Novo Estado
            </button>
            <button className="btn-secondary" type="button" onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
      {showCreate && (
        <EstadoCreateModal
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
          zBase={zBase + 100}
        />
      )}
    </>
  );
}
