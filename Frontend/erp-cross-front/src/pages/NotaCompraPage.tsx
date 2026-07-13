import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileDown,
  Plus,
  Pencil,
  Eye,
  Trash2,
  Search
} from 'lucide-react';

import { NotaCompraService } from '../services/notaCompraService';
import type { NotaCompraView } from '../types/entities';

import './PaisesPage.css';

export default function NotaCompraPage() {
  const navigate = useNavigate();

  const [notas, setNotas] = useState<NotaCompraView[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  async function carregar() {
    try {
      const res = await NotaCompraService.getAll();
      setNotas(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(id: number) {
    if (!confirm('Deseja realmente excluir esta nota de compra?'))
      return;

    await NotaCompraService.remove(id);
    carregar();
  }

  const filtradas = notas.filter(n =>
    (n.numeroNota ?? '')
      .toLowerCase()
      .includes(busca.toLowerCase())
  );
    return (
    <div className="page-container">

      <div className="page-header">
        <div className="page-title-area">
          <FileDown size={24} className="page-title-icon" />
          <h1 className="page-title">
            Notas de Compra
          </h1>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/nota-compras/nova')}
        >
          <Plus size={16} />
          Nova Nota de Compra
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />

          <input
            type="text"
            placeholder="Pesquisar nota..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="table-loading">
          Carregando...
        </div>
      ) : filtradas.length === 0 ? (
        <div className="table-empty">
          Nenhuma nota de compra encontrada.
        </div>
      ) : (
        <div className="table-container">

          <table className="data-table">

            <thead>
              <tr>
                <th>NÚMERO</th>
                <th>FORNECEDOR</th>
                <th>EMISSÃO</th>
                <th>TOTAL</th>
                <th style={{ width: 170 }}>
                  AÇÕES
                </th>
              </tr>
            </thead>

            <tbody>
                              {filtradas.map(nota => (
                <tr key={nota.id}>

                  <td className="col-name">
                    {nota.numeroNota}
                  </td>

                  <td>
                    {nota.nomeFornecedor ?? '—'}
                  </td>

                  <td>
                    {new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}
                  </td>

                  <td>
                    {nota.totalPagar.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </td>

                  <td>
                    <div className="table-actions">

                      <button
                        className="btn-icon"
                        title="Visualizar"
                        onClick={() =>
                          navigate(`/nota-compras/visualizar/${nota.id}`)
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="btn-icon"
                        title="Editar"
                        onClick={() =>
                          navigate(`/nota-compras/editar/${nota.id}`)
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="btn-icon btn-danger"
                        title="Excluir"
                        onClick={() => excluir(nota.id)}
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