import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, Pencil } from 'lucide-react';

import { CargoService } from '../services/cargoService';
import type { CargoView } from '../types/entities';

import './PaisesPage.css';

function formatDate(value: string | null |undefined): string {
  if (!value) return '—';

  const d = new Date(value.replace(' ', 'T'));

  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('pt-BR');
}

export default function CargoViewPage() {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const [cargo, setCargo] = useState<CargoView | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    CargoService.getById(Number(id))
      .then(res => setCargo(res.data))
      .catch(() => navigate('/cargos'))
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

  if (!cargo)
    return null;

  return (
    <div className="page-container">

      <div className="page-header">
        <div className="page-title-area">
          <Briefcase
            size={24}
            className="page-title-icon"
          />

          <h1 className="page-title">
            Visualizar Cargo
          </h1>
        </div>
      </div>

      <div className="form-card">
        <div className="form-page">

          <div className="form-section">

            <h2 className="form-section-title">
              Dados do Cargo
            </h2>

            <div className="view-group">
              <span className="view-label">
                Nome
              </span>

              <span className="view-value">
                {cargo.nomeCargo}
              </span>
            </div>

            <div className="view-group">
              <span className="view-label">
                Descrição
              </span>

              <span
                className="view-value"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {cargo.descricao || '—'}
              </span>
            </div>

            <div className="form-row"></div>
                          <div className="view-group">
                <span className="view-label">
                  Salário Base
                </span>

                <span className="view-value">
                  {cargo.salarioBase.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">
                  Exige CNH
                </span>

                <span className="view-value">
                  {cargo.exigeCnh ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>

            <div className="view-group">
              <span className="view-label">
                Status
              </span>

              <span
                className={`status-badge ${
                  cargo.ativo
                    ? 'status-active'
                    : 'status-inactive'
                }`}
              >
                {cargo.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

          </div>

          <div className="form-section">

            <h2 className="form-section-title">
              Informações do Sistema
            </h2>

            <div className="form-row"></div>
                          <div className="view-group">
                <span className="view-label">
                  Criado em
                </span>

                <span className="view-value view-muted">
                  {formatDate(cargo.dataCriacao)}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">
                  Atualizado em
                </span>

                <span className="view-value view-muted">
                  {formatDate(cargo.dataAtualizacao)}
                </span>
              </div>
            </div>

          </div>

          <div className="form-page-footer">

            <button
              className="btn-primary"
              onClick={() => navigate(`/cargos/editar/${cargo.id}`)}
            >
              <Pencil size={15} />
              Editar
            </button>

            <button
              className="btn-secondary"
              onClick={() => navigate('/cargos')}
            >
              Cancelar
            </button>

          </div>

        </div>
    );
}