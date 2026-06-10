import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { CondicaoPagamentoService } from '../services/condicaoPagamentoService';
import type { CondicaoPagamentoView } from '../types/entities';
import '../pages/PaisesPage.css';

interface Props {
  onSelect: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function CondicaoPagamentoLookupModal({ onSelect, onClose, zBase = 1000 }: Props) {
  const [all, setAll] = useState<CondicaoPagamentoView[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CondicaoPagamentoService.getAll()
      .then(res => setAll(res.data.filter(c => c.ativo)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? all.filter(c => c.nomeCondicao.toLowerCase().includes(search.toLowerCase()))
    : all;

  return (
    <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
      <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Selecionar Condição de Pagamento</h2>
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
            <div className="table-empty">Nenhuma condição encontrada.</div>
          ) : (
            <div className="lookup-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>CONDIÇÃO</th>
                    <th>JUROS</th>
                    <th>DESCONTO</th>
                    <th style={{ width: 110 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td className="col-name">{c.nomeCondicao}</td>
                      <td>{c.taxaJuros > 0 ? `${c.taxaJuros}%` : '—'}</td>
                      <td>{c.desconto > 0 ? `${c.desconto}%` : '—'}</td>
                      <td>
                        <button className="btn-select" onClick={() => onSelect(c.id, c.nomeCondicao)}>
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
