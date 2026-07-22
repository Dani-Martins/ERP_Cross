import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Car,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

import { VeiculoService } from '../services/veiculoService';

import type {
  VeiculoView,
} from '../types/entities';

import './PaisesPage.css';

export default function VeiculoPage() {

  const navigate = useNavigate();

  const [veiculos, setVeiculos] =
    useState<VeiculoView[]>([]);

  const [busca, setBusca] =
    useState('');

  const [loading, setLoading] =
    useState(true);
      async function carregar() {

    setLoading(true);

    try {

      const res =
        await VeiculoService.getAll();

      setVeiculos(res.data);

    } finally {

      setLoading(false);

    }

  }

  async function excluir(id: number) {

    if (!confirm('Deseja realmente excluir este veículo?'))
      return;

    await VeiculoService.delete(id);

    carregar();

  }

  useEffect(() => {

    carregar();

  }, []);

  const filtrados = veiculos.filter(v => {

    const texto = busca.toLowerCase();

    return (
      v.placa.toLowerCase().includes(texto) ||
      v.modelo.toLowerCase().includes(texto) ||
      v.marca.toLowerCase().includes(texto)
    );

  });
  return (
  <div className="page-container">

    <div className="page-header">

      <div className="page-title-area">

        <Car
          size={24}
          className="page-title-icon"
        />

        <h1 className="page-title">
          Veículos
        </h1>

      </div>

      <button
        className="btn-primary"
        onClick={() => navigate('/veiculos/novo')}
      >
        <Plus size={16} />
        Novo Veículo
      </button>

    </div>

    <div className="toolbar">

      <div className="search-box">

        <Search size={16} />

        <input
          type="text"
          placeholder="Pesquisar veículo..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />

      </div>

    </div>

    {loading ? (

      <div className="table-loading">
        Carregando...
      </div>

    ) : filtrados.length === 0 ? (

      <div className="table-empty">
        Nenhum veículo encontrado.
      </div>

    ) : (

      <div className="table-container">

        <table className="data-table">

          <thead>

            <tr>

              <th>PLACA</th>

              <th>MODELO</th>

              <th>MARCA</th>

              <th>ANO</th>

              <th>STATUS</th>

              <th style={{ width: 170 }}>
                AÇÕES
              </th>

            </tr>

          </thead>

          <tbody>
                          {filtrados.map(veiculo => (

                <tr key={veiculo.id}>

                  <td className="col-name">
                    {veiculo.placa}
                  </td>

                  <td>
                    {veiculo.modelo}
                  </td>

                  <td>
                    {veiculo.marca}
                  </td>

                  <td>
                    {veiculo.ano || '—'}
                  </td>

                  <td>

                    <span
                      className={
                        veiculo.ativo
                          ? 'status-active'
                          : 'status-inactive'
                      }
                    >
                      {veiculo.ativo
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
                          navigate(`/veiculos/visualizar/${veiculo.id}`)
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="btn-icon"
                        title="Editar"
                        onClick={() =>
                          navigate(`/veiculos/editar/${veiculo.id}`)
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="btn-icon btn-danger"
                        title="Excluir"
                        onClick={() =>
                          excluir(veiculo.id)
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