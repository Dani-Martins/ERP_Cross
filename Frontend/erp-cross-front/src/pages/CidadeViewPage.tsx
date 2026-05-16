import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Pencil } from 'lucide-react';
import { CidadeService } from '../services/cidadeService';
import type { CidadeView } from '../types/entities';
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

export default function CidadeViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cidade, setCidade] = useState<CidadeView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CidadeService.getById(Number(id))
      .then((res) => setCidade(res.data))
      .catch(() => navigate('/cidades'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="table-loading">Carregando...</div>
      </div>
    );
  }

  if (!cidade) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <MapPin size={24} className="page-title-icon" />
          <h1 className="page-title">Visualizar Cidade</h1>
        </div>
      </div>

      <div className="form-card">
        <div className="form-page">
          <div className="form-section">
            <h2 className="form-section-title">Dados da Cidade</h2>

            <div className="view-group">
              <span className="view-label">Nome da Cidade</span>
              <span className="view-value">{cidade.nomeCidade}</span>
            </div>

            <div className="form-row">
              <div className="view-group">
                <span className="view-label">DDD</span>
                <span className="view-value">{cidade.ddd}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Estado</span>
                <span className="view-value">{cidade.nomeEstado ?? '—'}</span>
              </div>
            </div>

            <div className="view-group">
              <span className="view-label">Status</span>
              <span className={`status-badge ${cidade.ativo ? 'status-active' : 'status-inactive'}`}>
                {cidade.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div className="form-row view-dates">
              <div className="view-group">
                <span className="view-label">Criado em</span>
                <span className="view-value view-muted">{formatDate(cidade.dataCriacao)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Atualizado em</span>
                <span className="view-value view-muted">{formatDate(cidade.dataAtualizacao)}</span>
              </div>
            </div>
          </div>

          <div className="form-page-footer">
            <button
              className="btn-primary"
              onClick={() => navigate(`/cidades/editar/${cidade.id}`)}
            >
              <Pencil size={15} /> Editar
            </button>
            <button className="btn-secondary" onClick={() => navigate('/cidades')}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
