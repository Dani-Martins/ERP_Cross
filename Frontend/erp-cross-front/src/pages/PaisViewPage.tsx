import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Globe, Pencil } from 'lucide-react';
import { PaisService } from '../services/paisService';
import type { PaisView } from '../types/entities';
import './PaisesPage.css';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  // API retorna "dd/MM/yyyy" — converte para Date manualmente
  const parts = value.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  }
  // Fallback para ISO ou outros formatos
  const d = new Date(value.replace(' ', 'T'));
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR');
}

export default function PaisViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pais, setPais] = useState<PaisView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PaisService.getById(Number(id))
      .then((res) => setPais(res.data))
      .catch(() => navigate('/paises'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="table-loading">Carregando...</div>
      </div>
    );
  }

  if (!pais) return null;

  return (
    <div className="page-container">
      {/* Cabeçalho */}
      <div className="page-header">
        <div className="page-title-area">
          <Globe size={24} className="page-title-icon" />
          <h1 className="page-title">Visualizar País</h1>
        </div>
      </div>

      {/* Dados */}
      <div className="form-card">
        <div className="form-page">
          <div className="form-section">
            <h2 className="form-section-title">Dados do País</h2>

            <div className="view-group">
              <span className="view-label">Nome do País</span>
              <span className="view-value">{pais.nomePais}</span>
            </div>

            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Sigla</span>
                <span className="view-value">{pais.sigla}</span>
              </div>
              <div className="view-group">
                <span className="view-label">DDI</span>
                <span className="view-value">+{pais.ddi}</span>
              </div>
            </div>

            <div className="view-group">
              <span className="view-label">Status</span>
              <span className={`status-badge ${pais.ativo ? 'status-active' : 'status-inactive'}`}>
                {pais.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div className="form-row view-dates">
              <div className="view-group">
                <span className="view-label">Criado em</span>
                <span className="view-value view-muted">{formatDate(pais.dataCriacao)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Atualizado em</span>
                <span className="view-value view-muted">{formatDate(pais.dataAtualizacao)}</span>
              </div>
            </div>
          </div>

          <div className="form-page-footer">
            <button
              className="btn-primary"
              onClick={() => navigate(`/paises/editar/${pais.id}`)}
            >
              <Pencil size={15} /> Editar
            </button>
            <button className="btn-secondary" onClick={() => navigate('/paises')}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
