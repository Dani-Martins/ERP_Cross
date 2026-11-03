import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { FornecedorService } from '../services/fornecedorService';
import type { FornecedorView } from '../types/entities';
import FornecedorFormPage from '../pages/FornecedorFormPage';
import '../pages/PaisesPage.css';

interface Props {
  onSelect: (
    id: number,
    nome: string,
    idCondicaoPagamento?: number,
    nomeCondicaoPagamento?: string,
    idTransportadora?: number,
    nomeTransportadora?: string,
  ) => void;
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

  function handleCreated(fornecedor: FornecedorView) {
    setShowCreate(false);
    load();
    onSelect(
      fornecedor.id,
      fornecedor.nome,
      fornecedor.idCondicaoPagamento,
      fornecedor.nomeCondicaoPagamento,
      fornecedor.idTransportadora,
      fornecedor.nomeTransportadora,
    );
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
                          <button className="btn-select" onClick={() => onSelect(
                            f.id,
                            f.nome,
                            f.idCondicaoPagamento,
                            f.nomeCondicaoPagamento,
                            f.idTransportadora,
                            f.nomeTransportadora,
                          )}>
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
        <div className="modal-overlay" style={{ zIndex: zBase + 100 }} onClick={() => setShowCreate(false)}>
          <div className="modal modal-form-page modal-fornecedor" role="dialog" aria-modal="true" aria-labelledby="fornecedor-create-title" onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              <h2 id="fornecedor-create-title">Novo Fornecedor</h2>
              <button className="modal-close" type="button" aria-label="Fechar cadastro" onClick={() => setShowCreate(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="account-page-modal-body">
              <FornecedorFormPage
                onClose={() => setShowCreate(false)}
                onSaved={handleCreated}
                lookupZBase={zBase + 101}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
