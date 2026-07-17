import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Plus,
  Pencil,
  Eye,
  Trash2,
  Search,
} from 'lucide-react';

import { MarcaService } from '../services/marcaService';
import type { MarcaView } from '../types/entities';

import './PaisesPage.css';

export default function MarcaPage() {

  const navigate = useNavigate();

  const [marcas, setMarcas] = useState<MarcaView[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  async function carregar() {
    try {
      const res = await MarcaService.getAll();
      setMarcas(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(id: number) {

    if (!confirm('Deseja realmente excluir esta marca?'))
      return;

    await MarcaService.remove(id);

    carregar();
  }

  const filtrados = marcas.filter(m =>
    m.nomeMarca
      .toLowerCase()
      .includes(busca.toLowerCase())
  );
    return (
    <div className="page-container">

      <div className="page-header">

        <div className="page-title-area">
          <Badge
            size={24}
            className="page-title-icon"
          />

          <h1 className="page-title">
            Marcas
          </h1>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/marcas/novo')}
        >
          <Plus size={16} />
          Nova Marca
        </button>

      </div>

      <div className="toolbar">

        <div className="search-box">

          <Search size={16} />

          <input
            type="text"
            placeholder="Pesquisar marca..."
            value={busca}
            onChange={e =>
              setBusca(e.target.value)
            }
          />

        </div>

      </div>

      {loading ? (

        <div className="table-loading">
          Carregando...
        </div>

      ) : filtrados.length === 0 ? (

        <div className="table-empty">
          Nenhuma marca encontrada.
        </div>

      ) : (

        <div className="table-container">

          <table className="data-table">

            <thead>

              <tr>
                <th>MARCA</th>
                <th>DESCRIÇÃO</th>
                <th>STATUS</th>
                <th style={{ width: 170 }}>
                  AÇÕES
                </th>
              </tr>

            </thead>

            <tbody>
                              {filtrados.map(marca => (

                <tr key={marca.id}>

                  <td className="col-name">
                    {marca.nomeMarca}
                  </td>

                  <td>
                    {marca.descricao || '—'}
                  </td>

                  <td>

                    <span
                      className={
                        marca.ativo
                          ? 'status-active'
                          : 'status-inactive'
                      }
                    >
                      {marca.ativo
                        ? 'Ativo'
                        : 'Inativo'}
                    </span>

                  </td>

                  <td>

                    <div className="table-actions">

                      <button
                        className="btn-icon"
                        title="Visualizar"
                        onClick={() =>
                          navigate(`/marcas/visualizar/${marca.id}`)
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="btn-icon"
                        title="Editar"
                        onClick={() =>
                          navigate(`/marcas/editar/${marca.id}`)
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="btn-icon btn-danger"
                        title="Excluir"
                        onClick={() =>
                          excluir(marca.id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}