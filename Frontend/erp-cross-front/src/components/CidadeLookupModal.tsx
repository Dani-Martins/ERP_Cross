import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { CidadeService } from '../services/cidadeService';
import type { CidadeView } from '../types/entities';
import CidadeCreateModal from './CidadeCreateModal';
import '../pages/PaisesPage.css';

interface Props {
  onSelect: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function CidadeLookupModal({ onSelect, onClose, zBase = 1000 }: Props) {
  const [all, setAll] = useState<CidadeView[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    CidadeService.getAll()
      .then(res => setAll(res.data.filter(c => c.ativo)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? all.filter(c =>
        c.nomeCidade.toLowerCase().includes(search.toLowerCase()) ||
        c.ddd.includes(search) ||
        (c.nomeEstado?.toLowerCase().includes(search.toLowerCase()) ?? false)
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
            <h2>Selecionar Cidade</h2>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-body lookup-modal-body">
            <div className="lookup-search-bar">
              <Search size={15} className="lookup-search-icon" />
              <input
                type="text"
                placeholder="Pesquisar por nome, DDD ou estado..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            {loading ? (
              <div className="table-loading">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="table-empty">Nenhuma cidade encontrada.</div>
            ) : (
              <div className="lookup-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>CIDADE</th>
                      <th>DDD</th>
                      <th>ESTADO</th>
                      <th style={{ width: 110 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id}>
                        <td className="col-name">{c.nomeCidade}</td>
                        <td><span className="tag">{c.ddd}</span></td>
                        <td>{c.nomeEstado ?? '—'}</td>
                        <td>
                          <button className="btn-select" onClick={() => onSelect(c.id, c.nomeCidade)}>
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
              <Plus size={15} /> Nova Cidade
            </button>
            <button className="btn-secondary" type="button" onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
      {showCreate && (
        <CidadeCreateModal
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
          zBase={zBase + 100}
        />
      )}
    </>
  );
}
