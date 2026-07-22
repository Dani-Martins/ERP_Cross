import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Car, Pencil } from 'lucide-react';

import { VeiculoService } from '../services/veiculoService';
import type { VeiculoView } from '../types/entities';

import './PaisesPage.css';

function formatDate(value: string | null | undefined) {

  if (!value)
    return '—';

  const data = new Date(value);

  if (isNaN(data.getTime()))
    return '—';

  return data.toLocaleDateString('pt-BR');

}

export default function VeiculoViewPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [veiculo, setVeiculo] =
    useState<VeiculoView | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    VeiculoService.getById(Number(id))
      .then(res => setVeiculo(res.data))
      .catch(() => navigate('/veiculos'))
      .finally(() => setLoading(false));

  }, [id, navigate]);

  if (loading) {

    return (

      <div className="page-container">

        <div className="table-loading">

          Carregando...

        </div>

      </div>

    );

  }

  if (!veiculo)
    return null;
return (

  <div className="page-container">

    <div className="page-header">

      <div className="page-title-area">

        <Car
          size={24}
          className="page-title-icon"
        />

        <h1 className="page-title">
          Visualizar Veículo
        </h1>

      </div>

    </div>

    <div className="form-card">

      <div className="form-page">

        <div className="form-section">

          <h2 className="form-section-title">
            Dados do Veículo
          </h2>

          <div className="view-group">
            <span className="view-label">
              Placa
            </span>

            <span className="view-value">
              {veiculo.placa}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              Modelo
            </span>

            <span className="view-value">
              {veiculo.modelo}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              Marca
            </span>

            <span className="view-value">
              {veiculo.marca}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              Ano
            </span>

            <span className="view-value">
              {veiculo.ano}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              Descrição
            </span>

            <span className="view-value">
              {veiculo.descricao || '—'}
            </span>
          </div>

        </div>

        <div className="form-section">

          <h2 className="form-section-title">
            Situação
          </h2>

          <div className="view-group">

            <span className="view-label">
              Status
            </span>

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

          </div>

        </div>

        <div className="form-section view-dates">

          <h2 className="form-section-title">
            Informações do Sistema
          </h2>

          <div className="form-row">

            <div className="view-group">

              <span className="view-label">
                Criado em
              </span>

              <span className="view-value view-muted">
                {formatDate(veiculo.dataCriacao)}
              </span>

            </div>

            <div className="view-group">

              <span className="view-label">
                Atualizado em
              </span>

              <span className="view-value view-muted">
                {formatDate(veiculo.dataAtualizacao)}
              </span>

            </div>

          </div>

        </div>

        <div className="form-page-footer">

          <button
            className="btn-primary"
            onClick={() =>
              navigate(`/veiculos/editar/${veiculo.id}`)
            }
          >
            <Pencil size={15} />
            Editar
          </button>

          <button
            className="btn-secondary"
            onClick={() =>
              navigate('/veiculos')
            }
          >
            Voltar
          </button>

        </div>

      </div>

    </div>

  </div>

);

}