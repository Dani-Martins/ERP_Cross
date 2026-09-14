import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { TransportadoraService } from '../services/transportadoraService';
import type { TransportadoraView } from '../types/entities';
import TransportadoraCreateModal from './TransportadoraCreateModal';
import '../pages/PaisesPage.css';

interface Props {
  onSelect: (id: number, nomeTransportadora: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function TransportadoraLookupModal({ onSelect, onClose, zBase = 1000 }: Props) {
  const [all, setAll] = useState<TransportadoraView[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  function load() {
    setLoading(true);
    TransportadoraService.getAll()
      .then(res => setAll(res.data.filter(t => t.ativo)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = search
    ? all.filter(t => t.nome.toLowerCase().includes(search.toLowerCase()))
    : all;

  return (
    <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
      <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Selecionar Transportadora</h2>
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
            <div className="table-empty">Nenhuma transportadora encontrada.</div>
          ) : (
            <div className="lookup-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>TRANSPORTADORA</th>
                    <th style={{ width: 110 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td className="col-name">{t.nome}</td>
                      <td>
                        <button className="btn-select" onClick={() => onSelect(t.id, t.nome)}>
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
          <button type="button" className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Nova Transportadora
          </button>
          <button className="btn-secondary" type="button" onClick={onClose}>Fechar</button>
        </div>
      </div>
      {showCreateModal && (
        <TransportadoraCreateModal
          onCreated={(id, nome) => {
            onSelect(id, nome);
            setShowCreateModal(false);
          }}
          onClose={() => setShowCreateModal(false)}
          zBase={zBase + 100}
        />
      )}
    </div>
  );
}
