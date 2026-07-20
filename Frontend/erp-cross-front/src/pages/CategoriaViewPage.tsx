import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shapes, Pencil } from 'lucide-react';

import { CategoriaService } from '../services/categoriaService';
import type { CategoriaView } from '../types/entities';

import './PaisesPage.css';

function formatDate(value: string | null | undefined) {

  if (!value)
    return '—';

  const d = new Date(value);

  if (isNaN(d.getTime()))
    return '—';

  return d.toLocaleDateString('pt-BR');
}

export default function CategoriaViewPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [categoria, setCategoria] =
    useState<CategoriaView | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    CategoriaService.getById(Number(id))
      .then(r => setCategoria(r.data))
      .catch(() => navigate('/categorias'))
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

  if (!categoria)
    return null;
return (
  <div className="page-container">

    <div className="page-header">

      <div className="page-title-area">

        <Shapes
          size={24}
          className="page-title-icon"
        />

        <h1 className="page-title">
          Visualizar Categoria
        </h1>

      </div>

    </div>

    <div className="form-card">

      <div className="form-page">

        <div className="form-section">

          <h2 className="form-section-title">
            Dados da Categoria
          </h2>

          <div className="view-group">

            <span className="view-label">
              Nome da Categoria
            </span>

            <span className="view-value">
              {categoria.nomeCategoria}
            </span>

          </div>

          <div className="view-group">

            <span className="view-label">
              Descrição
            </span>

            <span className="view-value">
              {categoria.descricao || '—'}
            </span>

          </div>

          <div className="view-group">

            <span className="view-label">
              Status
            </span>

            <span
              className={`status-badge ${
                categoria.ativo
                  ? 'status-active'
                  : 'status-inactive'
              }`}
            >
              {categoria.ativo
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
                {formatDate(categoria.dataCriacao)}
              </span>

            </div>

            <div className="view-group">

              <span className="view-label">
                Atualizado em
              </span>

              <span className="view-value view-muted">
                {formatDate(categoria.dataAtualizacao)}
              </span>

            </div>

          </div>

        </div>

        <div className="form-page-footer">

          <button
            className="btn-primary"
            onClick={() =>
              navigate(`/categorias/editar/${categoria.id}`)
            }
          >
            <Pencil size={15} />
            Editar
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigate('/categorias')}
          >
            Voltar
          </button>

        </div>

      </div>

    </div>

  </div>
);
}
