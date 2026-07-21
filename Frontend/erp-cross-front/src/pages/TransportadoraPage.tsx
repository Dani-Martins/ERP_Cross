import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Plus,
  Pencil,
  Eye,
  Trash2,
  Search,
} from 'lucide-react';

import { TransportadoraService } from '../services/transportadoraService';
import type { TransportadoraView } from '../types/entities';

import './PaisesPage.css';

export default function TransportadoraPage() {

  const navigate = useNavigate();

  const [transportadoras, setTransportadoras] =
    useState<TransportadoraView[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [busca, setBusca] =
    useState('');

  async function carregar() {

    try {

      const res =
        await TransportadoraService.getAll();

      setTransportadoras(res.data);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    carregar();

  }, []);

  async function excluir(id: number) {

    if (!confirm('Deseja realmente excluir esta transportadora?'))
      return;

    await TransportadoraService.remove(id);

    carregar();

  }

  const filtrados = transportadoras.filter(t =>
    t.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (t.nomeFantasia ?? '')
      .toLowerCase()
      .includes(busca.toLowerCase()) ||
    t.cpfCnpj
      .includes(busca)
  );
  return (
  <div className="page-container">

    <div className="page-header">

      <div className="page-title-area">

        <Truck
          size={24}
          className="page-title-icon"
        />

        <h1 className="page-title">
          Transportadoras
        </h1>

      </div>

      <button
        className="btn-primary"
        onClick={() => navigate('/transportadoras/novo')}
      >
        <Plus size={16} />
        Nova Transportadora
      </button>

    </div>

    <div className="toolbar">

      <div className="search-box">

        <Search size={16} />

        <input
          type="text"
          placeholder="Pesquisar transportadora..."
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
        Nenhuma transportadora encontrada.
      </div>

    ) : (

      <div className="table-container">

        <table className="data-table">

          <thead>

            <tr>

              <th>NOME</th>

              <th>NOME FANTASIA</th>

              <th>CPF/CNPJ</th>

              <th>CIDADE</th>

              <th>STATUS</th>

              <th style={{ width: 170 }}>
                AÇÕES
              </th>

            </tr>

          </thead>

          <tbody>
                          {filtrados.map(transportadora => (

                <tr key={transportadora.id}>

                  <td className="col-name">
                    {transportadora.nome}
                  </td>

                  <td>
                    {transportadora.nomeFantasia || '—'}
                  </td>

                  <td>
                    {transportadora.cpfCnpj}
                  </td>

                  <td>
                    {transportadora.nomeCidade || '—'}
                  </td>

                  <td>

                    <span
                      className={
                        transportadora.ativo
                          ? 'status-active'
                          : 'status-inactive'
                      }
                    >
                      {transportadora.ativo
                        ? 'Ativa'
                        : 'Inativa'}
                    </span>

                  </td>

                  <td>

                    <div className="table-actions">

                      <button
                        className="btn-icon"
                        title="Visualizar"
                        onClick={() =>
                          navigate(`/transportadoras/visualizar/${transportadora.id}`)
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="btn-icon"
                        title="Editar"
                        onClick={() =>
                          navigate(`/transportadoras/editar/${transportadora.id}`)
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="btn-icon btn-danger"
                        title="Excluir"
                        onClick={() =>
                          excluir(transportadora.id)
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