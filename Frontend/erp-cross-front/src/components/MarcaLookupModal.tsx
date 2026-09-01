import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { MarcaService } from '../services/marcaService';
import type { MarcaView } from '../types/entities';
import MarcaCreateModal from './MarcaCreateModal';
import '../pages/PaisesPage.css';

interface Props {
  onSelect: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function MarcaLookupModal({ onSelect, onClose, zBase = 1000 }: Props) {
  const [all, setAll] = useState<MarcaView[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    MarcaService.getAll()
      .then(res => setAll(res.data.filter(m => m.ativo)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? all.filter(m =>
        m.nomeMarca.toLowerCase().includes(search.toLowerCase())
      )
    : all;

  function handleCreated(id: number, nome: string) {
    setShowCreate(false);
    onSelect(id, nome);
  }

  return (
    <>
      <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
      <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Selecionar Marca</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body lookup-modal-body">
          <div className="lookup-search-bar">
            <Search size={15} className="lookup-search-icon" />
            <input
              type="text"
              placeholder="Pesquisar por nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          {loading ? (
            <div className="table-loading">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">Nenhuma marca encontrada.</div>
          ) : (
            <div className="lookup-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>MARCA</th>
                    <th style={{ width: 110 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => (
                    <tr key={m.id}>
                      <td className="col-name">{m.nomeMarca}</td>
                      <td>
                        <button className="btn-select" onClick={() => onSelect(m.id, m.nomeMarca)}>
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
            <Plus size={15} /> Nova Marca
          </button>
          <button className="btn-secondary" type="button" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
    {showCreate && (
      <MarcaCreateModal
        onCreated={handleCreated}
        onClose={() => setShowCreate(false)}
        zBase={zBase + 100}
      />
    )}
  </>);
}
