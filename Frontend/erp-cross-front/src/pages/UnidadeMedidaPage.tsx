import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ruler,
  Plus,
  Pencil,
  Eye,
  Trash2,
  Search,
} from 'lucide-react';

import { UnidadeMedidaService } from '../services/unidadeMedidaService';
import type { UnidadeMedidaView } from '../types/entities';

import './PaisesPage.css';

export default function UnidadeMedidaPage() {

  const navigate = useNavigate();

  const [unidades, setUnidades] = useState<UnidadeMedidaView[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  async function carregar() {
    try {
      const res = await UnidadeMedidaService.getAll();
      setUnidades(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(id: number) {

    if (!confirm('Deseja realmente excluir esta unidade de medida?'))
      return;

    await UnidadeMedidaService.remove(id);

    carregar();
  }

  const filtrados = unidades.filter(u =>
    u.nomeUnidade
      .toLowerCase()
      .includes(busca.toLowerCase())
  );
    return (
    <div className="page-container">

      <div className="page-header">

        <div className="page-title-area">
          <Ruler
            size={24}
            className="page-title-icon"
          />

          <h1 className="page-title">
            Unidades de Medida
          </h1>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/unidades/novo')}
        >
          <Plus size={16} />
          Nova Unidade
        </button>

      </div>

      <div className="toolbar">

        <div className="search-box">

          <Search size={16} />

          <input
            type="text"
            placeholder="Pesquisar unidade..."
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
          Nenhuma unidade encontrada.
        </div>

      ) : (

        <div className="table-container">

          <table className="data-table">

            <thead>

              <tr>
                <th>UNIDADE</th>
                <th>SIGLA</th>
                <th>STATUS</th>
                <th style={{ width: 170 }}>
                  AÇÕES
                </th>
              </tr>

            </thead>

            <tbody>
                              {filtrados.map(unidade => (

                <tr key={unidade.id}>

                  <td className="col-name">
                    {unidade.nomeUnidade}
                  </td>

                  <td>
                    {unidade.sigla || '—'}
                  </td>

                  <td>
                    <span
                      className={
                        unidade.ativo
                          ? 'status-active'
                          : 'status-inactive'
                      }
                    >
                      {unidade.ativo
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
                          navigate(`/unidades/visualizar/${unidade.id}`)
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="btn-icon"
                        title="Editar"
                        onClick={() =>
                          navigate(`/unidades/editar/${unidade.id}`)
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="btn-icon btn-danger"
                        title="Excluir"
                        onClick={() =>
                          excluir(unidade.id)
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