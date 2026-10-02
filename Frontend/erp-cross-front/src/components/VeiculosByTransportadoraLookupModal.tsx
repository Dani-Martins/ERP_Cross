import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import axios from 'axios';
import type { VeiculoView } from '../types/entities';
import VeiculoCreateModal from './VeiculoCreateModal';
import '../pages/PaisesPage.css';

interface Props {
  transportadoraId: number;
  onSelect: (id: number, placa: string, modelo: string, marca: string, ano: number | null) => void;
  onClose: () => void;
  zBase?: number;
}

export default function VeiculosByTransportadoraLookupModal({
  transportadoraId,
  onSelect,
  onClose,
  zBase = 1000
}: Props) {
  const [all, setAll] = useState<VeiculoView[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!transportadoraId) {
      setLoading(false);
      return;
    }

    axios
      .get<VeiculoView[]>(`http://localhost:5000/api/veiculo/transportadora/${transportadoraId}`)
      .then(res => setAll(res.data.filter(v => v.ativo)))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, [transportadoraId]);

  const filtered = search
    ? all.filter(v =>
        v.placa.toLowerCase().includes(search.toLowerCase()) ||
        v.modelo.toLowerCase().includes(search.toLowerCase()) ||
        v.marca?.toLowerCase().includes(search.toLowerCase())
      )
    : all;

  function handleCreated(id: number, placa: string, modelo: string, marca: string, ano: number | null) {
    setShowCreate(false);
    onSelect(id, placa, modelo, marca, ano);
  }

  return (
    <>
      <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
        <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Selecionar Veículo</h2>
            <button className="modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <div className="modal-body lookup-modal-body">
            <div className="lookup-search-bar">
              <Search size={15} className="lookup-search-icon" />
              <input
                type="text"
                placeholder="Pesquisar por placa, modelo ou marca..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            {loading ? (
              <div className="table-loading">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="table-empty">Nenhum veículo encontrado nesta transportadora.</div>
            ) : (
              <div className="lookup-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>PLACA</th>
                      <th>MODELO</th>
                      <th>MARCA</th>
                      <th>ANO</th>
                      <th style={{ width: 110 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(v => (
                      <tr key={v.id}>
                        <td className="col-name" style={{ fontWeight: 'bold' }}>
                          {v.placa}
                        </td>
                        <td>{v.modelo}</td>
                        <td>{v.marca || '—'}</td>
                        <td style={{ textAlign: 'center' }}>{v.ano}</td>
                        <td>
                          <button
                            className="btn-select"
                            onClick={() =>
                              onSelect(v.id, v.placa, v.modelo, v.marca ?? '', v.ano ?? null)
                            }
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
            <button
              className="btn-primary"
              type="button"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={15} /> Novo Veículo
            </button>
            <button className="btn-secondary" type="button" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>

      {showCreate && (
        <VeiculoCreateModal
          defaultTransportadoraId={transportadoraId}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
