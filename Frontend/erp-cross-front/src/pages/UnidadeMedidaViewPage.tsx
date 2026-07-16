import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Ruler, Pencil } from 'lucide-react';

import { UnidadeMedidaService } from '../services/unidadeMedidaService';
import type { UnidadeMedidaView } from '../types/entities';

import './PaisesPage.css';

function formatDate(value: string | null | undefined) {
  if (!value) return '—';

  const d = new Date(value);

  if (isNaN(d.getTime()))
    return '—';

  return d.toLocaleDateString('pt-BR');
}

export default function UnidadeMedidaViewPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [unidade, setUnidade] =
    useState<UnidadeMedidaView | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    UnidadeMedidaService.getById(Number(id))
      .then(r => setUnidade(r.data))
      .catch(() => navigate('/unidades'))
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

  if (!unidade)
    return null;
  return (
    <div className="page-container">

      <div className="page-header">

        <div className="page-title-area">
          <Ruler
            size={24}
            className="page-title-icon"
          />

          <h1 className="page-title">
            Visualizar Unidade de Medida
          </h1>

        </div>

      </div>

      <div className="form-card">

        <div className="form-page">

          <div className="form-section">

            <h2 className="form-section-title">
              Dados da Unidade
            </h2>

            <div className="view-group">

              <span className="view-label">
                Nome da Unidade
              </span>

              <span className="view-value">
                {unidade.nomeUnidade}
              </span>

            </div>

            <div className="view-group">

              <span className="view-label">
                Sigla
              </span>

              <span className="view-value">
                {unidade.sigla || '—'}
              </span>

            </div>

            <div className="view-group">

              <span className="view-label">
                Status
              </span>

              <span
                className={`status-badge ${
                  unidade.ativo
                    ? 'status-active'
                    : 'status-inactive'
                }`}
              >
                {unidade.ativo
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
                  {formatDate(unidade.dataCriacao)}
                </span>

              </div>

              <div className="view-group">

                <span className="view-label">
                  Atualizado em
                </span>

                <span className="view-value view-muted">
                  {formatDate(unidade.dataAtualizacao)}
                </span>

              </div>

            </div>

          </div>

          <div className="form-page-footer">

            <button
              className="btn-primary"
              onClick={() =>
                navigate(`/unidades/editar/${unidade.id}`)
              }
            >
              <Pencil size={15} />
              Editar
            </button>

            <button
              className="btn-secondary"
              onClick={() => navigate('/unidades')}
            >
              Voltar
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}