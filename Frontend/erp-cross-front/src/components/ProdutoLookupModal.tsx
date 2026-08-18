import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { ProdutoService } from '../services/produtoService';
import type { ProdutoView } from '../types/entities';
import '../pages/PaisesPage.css';

interface Props {
  onSelect: (id: number, nomeProduto: string, unidadeId?: number, nomeUnidade?: string, precoVenda?: number) => void;
  onClose: () => void;
  zBase?: number;
}

export default function ProdutoLookupModal({ onSelect, onClose, zBase = 1000 }: Props) {
  const [all, setAll] = useState<ProdutoView[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    ProdutoService.getAll()
      .then(res => setAll(res.data.filter(p => p.ativo)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = search
    ? all.filter(p => 
        p.nomeProduto.toLowerCase().includes(search.toLowerCase()) ||
        (p.codigoBarras && p.codigoBarras.toLowerCase().includes(search.toLowerCase()))
      )
    : all;

  return (
    <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
      <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Selecionar Produto</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body lookup-modal-body">
          <div className="lookup-search-bar">
            <Search size={15} className="lookup-search-icon" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou código de barras..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          {loading ? (
            <div className="table-loading">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">Nenhum produto encontrado.</div>
          ) : (
            <div className="lookup-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PRODUTO</th>
                    <th style={{ width: 100 }}>COD. BARRAS</th>
                    <th style={{ width: 100 }}>PREÇO</th>
                    <th style={{ width: 80 }}>ESTOQUE</th>
                    <th style={{ width: 110 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td className="col-name">{p.nomeProduto}</td>
                      <td>{p.codigoBarras || '—'}</td>
                      <td>R$ {Number(p.precoVenda).toFixed(2).replace('.', ',')}</td>
                      <td>{p.estoque}</td>
                      <td>
                        <button 
                          className="btn-select" 
                          onClick={() => onSelect(p.id, p.nomeProduto, p.unidadeId, p.nomeUnidade, p.precoVenda)}
                        >
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
