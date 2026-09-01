import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Pencil } from 'lucide-react';
import { MarcaService } from '../services/marcaService';
import type { MarcaView } from '../types/entities';
import './PaisesPage.css';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
}

export default function MarcaViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [marca, setMarca] = useState<MarcaView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    MarcaService.getById(Number(id))
      .then(res => setMarca(res.data))
      .catch(() => navigate('/marcas'))
      .finally(() => setLoading(false));

  }, [id, navigate]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="table-loading">Carregando...</div>
      </div>
    );
  }

  if (!marca) return null;

  return (
    <div className="page-container">
      {/* Cabeçalho */}
      <div className="page-header">
        <div className="page-title-area">
          <Badge size={24} className="page-title-icon" />
          <h1 className="page-title">Visualizar Marca</h1>
        </div>
      </div>

      {/* Dados */}
      <div className="form-card">
        <div className="form-page">
          <div className="form-section">
            <h2 className="form-section-title">Dados da Marca</h2>

            <div className="view-group">
              <span className="view-label">Marca</span>
              <span className="view-value">{marca.nomeMarca}</span>
            </div>

            <div className="view-group">
              <span className="view-label">Descrição</span>
              <span className="view-value">{marca.descricao || '—'}</span>
            </div>

            <div className="view-group">
              <span className="view-label">Status</span>
              <span className={`status-badge ${marca.ativo ? 'status-active' : 'status-inactive'}`}>
                {marca.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div className="form-row view-dates">
              <div className="view-group">
                <span className="view-label">Criado em</span>
                <span className="view-value view-muted">{formatDate(marca.dataCriacao)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Atualizado em</span>
                <span className="view-value view-muted">{formatDate(marca.dataAtualizacao)}</span>
              </div>
            </div>
          </div>

          <div className="form-page-footer">
            <button className="btn-primary" onClick={() => navigate(`/marcas/editar/${marca.id}`)}>
              <Pencil size={15} /> Editar
            </button>
            <button className="btn-secondary" onClick={() => navigate('/marcas')}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}