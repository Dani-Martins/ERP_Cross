import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Pencil,
  Eye,
  Trash2,
  Search,
} from 'lucide-react';

import { NotaVendaService } from '../services/notaVendaService';
import type { NotaVendaView } from '../types/entities';

import './PaisesPage.css';

export default function NotaVendaPage() {
  const navigate = useNavigate();

  const [notas, setNotas] = useState<NotaVendaView[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  async function carregar() {
    try {
      const res = await NotaVendaService.getAll();
      setNotas(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(nota: NotaVendaView) {
    if (!confirm('Deseja realmente excluir esta nota de venda?')) return;

    await NotaVendaService.remove(
      nota.numeroNota,
      nota.modelo,
      nota.serie,
      nota.clienteId
    );

    carregar();
  }

  const filtradas = notas.filter(n =>
    n.numeroNota.toLowerCase().includes(busca.toLowerCase()) ||
    (n.nomeCliente ?? '').toLowerCase().includes(busca.toLowerCase())
  );
    return (
    <div className="page-container">

      <div className="page-header">
        <div className="page-title-area">
          <FileText size={24} className="page-title-icon" />
          <h1 className="page-title">Notas de Venda</h1>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/notas-venda/novo')}
        >
          <Plus size={16} />
          Nova Nota
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Pesquisar número da nota ou cliente..."
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
          Nenhuma nota encontrada.
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">

            <thead>
              <tr>
                <th>NÚMERO</th>
                <th>CLIENTE</th>
                <th>EMISSÃO</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th style={{ width: 170 }}>AÇÕES</th>
              </tr>
            </thead>

            <tbody>
              {filtradas.map(nota => (
                <tr
                  key={`${nota.numeroNota}-${nota.modelo}-${nota.serie}-${nota.clienteId}`}
                >
                  <td className="col-name">
                    {nota.numeroNota}
                  </td>

                  <td>
                    {nota.nomeCliente ?? '—'}
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
                    <span
                      className={`status-badge ${
                        nota.ativo ? 'status-active' : 'status-inactive'
                      }`}
                    >
                      {nota.status ?? (nota.ativo ? 'Ativa' : 'Inativa')}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        title="Visualizar"
                        onClick={() =>
                          navigate(
                            `/notas-venda/visualizar/${nota.numeroNota}/${nota.modelo}/${nota.serie}/${nota.clienteId}`
                          )
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="btn-icon"
                        title="Editar"
                        onClick={() =>
                          navigate(
                            `/notas-venda/editar/${nota.numeroNota}/${nota.modelo}/${nota.serie}/${nota.clienteId}`
                          )
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="btn-icon btn-danger"
                        title="Excluir"
                        onClick={() => excluir(nota)}
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