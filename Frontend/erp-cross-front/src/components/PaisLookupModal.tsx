import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { PaisService } from '../services/paisService';
import type { PaisView } from '../types/entities';
import PaisCreateModal from './PaisCreateModal';
import '../pages/PaisesPage.css';

interface Props {
  onSelect: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function PaisLookupModal({ onSelect, onClose, zBase = 1000 }: Props) {
  const [all, setAll] = useState<PaisView[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    PaisService.getAll()
      .then(res => setAll(res.data.filter(p => p.ativo)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? all.filter(p =>
        p.nomePais.toLowerCase().includes(search.toLowerCase()) ||
        p.sigla.toLowerCase().includes(search.toLowerCase())
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
            <h2>Selecionar País</h2>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-body lookup-modal-body">
            <div className="lookup-search-bar">
              <Search size={15} className="lookup-search-icon" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou sigla..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            {loading ? (
              <div className="table-loading">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="table-empty">Nenhum país encontrado.</div>
            ) : (
              <div className="lookup-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>NOME</th>
                      <th>SIGLA</th>
                      <th>DDI</th>
                      <th style={{ width: 110 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id}>
                        <td className="col-name">{p.nomePais}</td>
                        <td><span className="tag">{p.sigla}</span></td>
                        <td>+{p.ddi}</td>
                        <td>
                          <button className="btn-select" onClick={() => onSelect(p.id, p.nomePais)}>
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
              <Plus size={15} /> Novo País
            </button>
            <button className="btn-secondary" type="button" onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
      {showCreate && (
        <PaisCreateModal
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
          zBase={zBase + 100}
        />
      )}
    </>
  );
}
