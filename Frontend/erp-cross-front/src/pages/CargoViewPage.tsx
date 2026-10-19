import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, Pencil } from 'lucide-react';
import { CargoService } from '../services/cargoService';
import type { CargoView } from '../types/entities';
import './PaisesPage.css';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
}

export default function CargoViewPage({ cargoId, onClose, onEdit }: { cargoId?: number; onClose?: () => void; onEdit?: (id: number) => void } = {}) {

  const routeParams = useParams<{ id: string }>();
  const id = cargoId?.toString() ?? routeParams.id;

  const navigate = useNavigate();

  const [cargo, setCargo] = useState<CargoView | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    CargoService.getById(Number(id))
      .then(res => setCargo(res.data))
      .catch(() => onClose ? onClose() : navigate('/cargos'))
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
                Setor
              </span>

              <span className="view-value">
                {cargo.setor || '—'}
              </span>
            </div>

            <div className="form-row">
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

            <div className="form-row">
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
              onClick={() => onEdit ? onEdit(cargo.id) : navigate(`/cargos/editar/${cargo.id}`)}
            >
              <Pencil size={15} />
              Editar
            </button>

            <button
              className="btn-secondary"
              onClick={() => onClose ? onClose() : navigate('/cargos')}
            >
              {onClose ? 'Fechar' : 'Cancelar'}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}