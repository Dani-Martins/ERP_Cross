import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { CargoService } from '../services/cargoService';
import type { CargoView } from '../types/entities';
import '../pages/PaisesPage.css';

interface Props {
  onSelect: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function CargoLookupModal({
  onSelect,
  onClose,
  zBase = 1000,
}: Props) {

  const [all, setAll] = useState<CargoView[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CargoService.getAll()
      .then(res => setAll(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? all.filter(c =>
        c.nome.toLowerCase().includes(search.toLowerCase())
      )
    : all;

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: zBase }}
      onClick={onClose}
    >
      <div
        className="modal modal-lookup"
        onClick={e => e.stopPropagation()}
      >

        <div className="modal-header">

          <h2>Selecionar Cargo</h2>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>

        </div>

        <div className="modal-body lookup-modal-body">

          <div className="lookup-search-bar">

            <Search
              size={15}
              className="lookup-search-icon"
            />

            <input
              type="text"
              placeholder="Pesquisar cargo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />

          </div>

          {loading ? (

            <div className="table-loading">
              Carregando...
            </div>

          ) : filtered.length === 0 ? (

            <div className="table-empty">
              Nenhum cargo encontrado.
            </div>

          ) : (

            <div className="lookup-table-wrap">

              <table className="data-table">

                <thead>

                  <tr>

                    <th>CARGO</th>

                    <th>SALÁRIO BASE</th>

                    <th style={{ width: 110 }}></th>

                  </tr>

                </thead>

                <tbody>

                  {filtered.map(cargo => (

                    <tr key={cargo.id}>

                      <td className="col-name">
                        {cargo.nome}
                      </td>

                      <td>

                        {cargo.salarioBase.toLocaleString(
                          'pt-BR',
                          {
                            style: 'currency',
                            currency: 'BRL'
                          }
                        )}

                      </td>

                      <td>

                        <button
                          className="btn-select"
                          onClick={() =>
                            onSelect(
                              cargo.id,
                              cargo.nome
                            )
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
            className="btn-secondary"
            type="button"
            onClick={onClose}
          >

            Fechar

          </button>

        </div>

      </div>

    </div>
  );
}