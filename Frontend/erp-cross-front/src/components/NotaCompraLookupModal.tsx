import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { NotaCompraService } from '../services/notaCompraService';
import type { NotaCompraView } from '../types/entities';
import '../pages/PaisesPage.css';

interface Props {
  onSelect: (nota: NotaCompraView) => void;
  onClose: () => void;
  zBase?: number;
}

export default function NotaCompraLookupModal({ onSelect, onClose, zBase = 1000 }: Props) {
  const [all, setAll] = useState<NotaCompraView[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    NotaCompraService.getAll()
      .then(res => setAll(res.data.filter(n => n.ativo)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? all.filter(n => 
        n.numeroNota.toLowerCase().includes(search.toLowerCase()) ||
        (n.nomeFornecedor ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : all;

  function formatDate(dateStr: string) {
    if (!dateStr) return '—';
    const parts = dateStr.split('/');
    if (parts.length === 3) return dateStr;
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  }

  function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
      <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Selecionar Nota de Compra</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body lookup-modal-body">
          <div className="lookup-search-bar">
            <Search size={15} className="lookup-search-icon" />
            <input
              type="text"
              placeholder="Pesquisar nota ou fornecedor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          {loading ? (
            <div className="table-loading">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">Nenhuma nota de compra encontrada.</div>
          ) : (
            <div className="lookup-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>NÚMERO DA NOTA</th>
                    <th>FORNECEDOR</th>
                    <th>DATA EMISSÃO</th>
                    <th>VALOR TOTAL</th>
                    <th style={{ width: 110 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(nota => (
                    <tr key={nota.id}>
                      <td className="col-name">{nota.numeroNota}</td>
                      <td>{nota.nomeFornecedor ?? '—'}</td>
                      <td>{formatDate(nota.dataEmissao)}</td>
                      <td>{formatCurrency(nota.totalPagar)}</td>
                      <td>
                        <button className="btn-select" onClick={() => onSelect(nota)}>
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
