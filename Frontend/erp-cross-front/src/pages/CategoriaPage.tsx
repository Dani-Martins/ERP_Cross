import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shapes,
  Plus,
  Pencil,
  Eye,
  Trash2,
  Search,
} from 'lucide-react';

import { CategoriaService } from '../services/categoriaService';
import type { CategoriaView } from '../types/entities';

import './PaisesPage.css';

export default function CategoriaPage() {

  const navigate = useNavigate();

  const [categorias, setCategorias] =
    useState<CategoriaView[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [busca, setBusca] =
    useState('');

  async function carregar() {

    try {

      const res =
        await CategoriaService.getAll();

      setCategorias(res.data);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    carregar();

  }, []);

  async function excluir(id: number) {

    if (!confirm('Deseja realmente excluir esta categoria?'))
      return;

    await CategoriaService.remove(id);

    carregar();

  }

  const filtrados = categorias.filter(c =>
    c.nomeCategoria
      .toLowerCase()
      .includes(busca.toLowerCase())
  );
  return (
  <div className="page-container">

    <div className="page-header">

      <div className="page-title-area">

        <Shapes
          size={24}
          className="page-title-icon"
        />

        <h1 className="page-title">
          Categorias
        </h1>

      </div>

      <button
        className="btn-primary"
        onClick={() => navigate('/categorias/novo')}
      >
        <Plus size={16} />
        Nova Categoria
      </button>

    </div>

    <div className="toolbar">

      <div className="search-box">

        <Search size={16} />

        <input
          type="text"
          placeholder="Pesquisar categoria..."
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
        Nenhuma categoria encontrada.
      </div>

    ) : (

      <div className="table-container">

        <table className="data-table">

          <thead>

            <tr>
              <th>CATEGORIA</th>
              <th>DESCRIÇÃO</th>
              <th>STATUS</th>
              <th style={{ width: 170 }}>
                AÇÕES
              </th>
            </tr>

          </thead>

          <tbody>
                          {filtrados.map(categoria => (

                <tr key={categoria.id}>

                  <td className="col-name">
                    {categoria.nomeCategoria}
                  </td>

                  <td>
                    {categoria.descricao || '—'}
                  </td>

                  <td>

                    <span
                      className={
                        categoria.ativo
                          ? 'status-active'
                          : 'status-inactive'
                      }
                    >
                      {categoria.ativo
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
                          navigate(`/categorias/visualizar/${categoria.id}`)
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="btn-icon"
                        title="Editar"
                        onClick={() =>
                          navigate(`/categorias/editar/${categoria.id}`)
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="btn-icon btn-danger"
                        title="Excluir"
                        onClick={() =>
                          excluir(categoria.id)
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