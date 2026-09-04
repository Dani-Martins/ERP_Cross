import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { FornecedorService } from '../services/fornecedorService';
import type { FornecedorView } from '../types/entities';
import FornecedorCreateModal from './FornecedorCreateModal';
import '../pages/PaisesPage.css';

interface Props {
  onSelect: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function FornecedorLookupModal({ onSelect, onClose, zBase = 1000 }: Props) {
  const [all, setAll] = useState<FornecedorView[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  function load() {
    setLoading(true);
    FornecedorService.getAll()
      .then(res => setAll(res.data.filter(f => f.ativo)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = search
    ? all.filter(f => f.nome.toLowerCase().includes(search.toLowerCase()) ||
                      (f.nomeFantasia ?? '').toLowerCase().includes(search.toLowerCase()))
    : all;

  function handleCreated(id: number, nome: string) {
    setShowCreate(false);
    load();
    onSelect(id, nome);
  }

  return (
    <>
      <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
        <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Selecionar Fornecedor</h2>
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
              <div className="table-empty">Nenhum fornecedor encontrado.</div>
            ) : (
              <div className="lookup-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>FORNECEDOR</th>
                      <th style={{ width: 120 }}>CPF/CNPJ</th>
                      <th style={{ width: 110 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(f => (
                      <tr key={f.id}>
                        <td className="col-name">{f.nome}</td>
                        <td>{f.cpfCnpj}</td>
                        <td>
                          <button className="btn-select" onClick={() => onSelect(f.id, f.nome)}>
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
              <Plus size={15} /> Novo Fornecedor
            </button>
            <button className="btn-secondary" type="button" onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
      {showCreate && (
        <FornecedorCreateModal
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
          zBase={zBase + 100}
        />
      )}
    </>
  );
}
