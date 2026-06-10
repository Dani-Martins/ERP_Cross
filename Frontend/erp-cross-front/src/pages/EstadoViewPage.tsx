import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Map, Pencil } from 'lucide-react';
import { EstadoService } from '../services/estadoService';
import type { EstadoView } from '../types/entities';
import './PaisesPage.css';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const parts = value.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  }
  const d = new Date(value.replace(' ', 'T'));
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR');
}

export default function EstadoViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [estado, setEstado] = useState<EstadoView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EstadoService.getById(Number(id))
      .then((res) => setEstado(res.data))
      .catch(() => navigate('/estados'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="table-loading">Carregando...</div>
      </div>
    );
  }

  if (!estado) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <Map size={24} className="page-title-icon" />
          <h1 className="page-title">Visualizar Estado</h1>
        </div>
      </div>

      <div className="form-card">
        <div className="form-page">
          <div className="form-section">
            <h2 className="form-section-title">Dados do Estado</h2>

            <div className="view-group">
              <span className="view-label">Nome do Estado</span>
              <span className="view-value">{estado.nomeEstado}</span>
            </div>

            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Sigla do Estado</span>
                <span className="view-value">{estado.uf}</span>
              </div>
              <div className="view-group">
                <span className="view-label">País</span>
                <span className="view-value">{estado.nomePais ?? '—'}</span>
              </div>
            </div>

            <div className="view-group">
              <span className="view-label">Status</span>
              <span className={`status-badge ${estado.ativo ? 'status-active' : 'status-inactive'}`}>
                {estado.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div className="form-row view-dates">
              <div className="view-group">
                <span className="view-label">Criado em</span>
                <span className="view-value view-muted">{formatDate(estado.dataCriacao)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Atualizado em</span>
                <span className="view-value view-muted">{formatDate(estado.dataAtualizacao)}</span>
              </div>
            </div>
          </div>

          <div className="form-page-footer">
            <button
              className="btn-primary"
              onClick={() => navigate(`/estados/editar/${estado.id}`)}
            >
              <Pencil size={15} /> Editar
            </button>
            <button className="btn-secondary" onClick={() => navigate('/estados')}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
