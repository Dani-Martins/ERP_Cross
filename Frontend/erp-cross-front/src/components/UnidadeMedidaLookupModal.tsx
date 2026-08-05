import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { UnidadeMedidaService } from '../services/unidadeMedidaService';
import type { UnidadeMedidaView } from '../types/entities';
import '../pages/PaisesPage.css';

interface Props {
  onSelect: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function UnidadeMedidaLookupModal({ onSelect, onClose, zBase = 1000 }: Props) {
  const [all, setAll] = useState<UnidadeMedidaView[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    UnidadeMedidaService.getAll()
      .then(res => setAll(res.data.filter(u => u.ativo)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? all.filter(u =>
        u.nomeUnidade.toLowerCase().includes(search.toLowerCase()) ||
        (u.sigla?.toLowerCase().includes(search.toLowerCase()) ?? false)
      )
    : all;

  return (
    <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
      <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Selecionar Unidade de Medida</h2>
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
            <div className="table-empty">Nenhuma unidade encontrada.</div>
          ) : (
            <div className="lookup-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>UNIDADE</th>
                    <th style={{ width: 100 }}>SIGLA</th>
                    <th style={{ width: 110 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td className="col-name">{u.nomeUnidade}</td>
                      <td><span className="tag">{u.sigla}</span></td>
                      <td>
                        <button className="btn-select" onClick={() => onSelect(u.id, u.nomeUnidade)}>
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
          <button className="btn-secondary" type="button" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
