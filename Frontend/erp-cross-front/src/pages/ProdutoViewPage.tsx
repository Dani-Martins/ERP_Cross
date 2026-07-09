import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, Pencil } from 'lucide-react';

import { ProdutoService } from '../services/produtoService';
import type { ProdutoView } from '../types/entities';

import './PaisesPage.css';

export default function ProdutoViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [produto, setProduto] = useState<ProdutoView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProdutoService.getById(Number(id))
      .then(res => setProduto(res.data))
      .catch(() => navigate('/produtos'))
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

  if (!produto) return null;

  return (
    <div className="page-container">

      <div className="page-header">
        <div className="page-title-area">
          <Package size={24} className="page-title-icon" />
          <h1 className="page-title">
            Visualizar Produto
          </h1>
        </div>
      </div>

      <div className="form-card">
        <div className="form-page">

          <div className="form-section">
            <h2 className="form-section-title">
              Dados do Produto
            </h2>

            <div className="view-group">
              <span className="view-label">Nome</span>
              <span className="view-value">{produto.nomeProduto}</span>
            </div>

            <div className="view-group">
              <span className="view-label">Descrição</span>
              <span
                className="view-value"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {produto.descricao || '—'}
              </span>
            </div>

          </div>
                    <div className="form-section">
            <h2 className="form-section-title">
              Valores
            </h2>

            <div className="form-row">

              <div className="view-group">
                <span className="view-label">
                  Custo de Compra
                </span>
                <span className="view-value">
                  {produto.custoCompra.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">
                  Lucro (%)
                </span>
                <span className="view-value">
                  {produto.lucroPercentual.toFixed(2)}%
                </span>
              </div>

            </div>

            <div className="view-group">
              <span className="view-label">
                Preço de Venda
              </span>
              <span className="view-value">
                {produto.precoVenda.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </span>
            </div>

          </div>

          <div className="form-section">
            <h2 className="form-section-title">
              Estoque
            </h2>

            <div className="view-group">
              <span className="view-label">
                Quantidade em Estoque
              </span>
              <span className="view-value">
                {produto.estoque}
              </span>
            </div>

          </div>

          <div className="form-page-footer">

            <button
              className="btn-primary"
              onClick={() => navigate(`/produtos/editar/${produto.id}`)}
            >
              <Pencil size={15} />
              Editar
            </button>

            <button
              className="btn-secondary"
              onClick={() => navigate('/produtos')}
            >
              Cancelar
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}