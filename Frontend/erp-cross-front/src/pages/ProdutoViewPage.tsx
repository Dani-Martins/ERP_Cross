import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, Pencil } from 'lucide-react';

import { ProdutoService } from '../services/produtoService';
import type { ProdutoView } from '../types/entities';

import './PaisesPage.css';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value.replace(' ', 'T'));
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR');
}

export default function ProdutoViewPage({ produtoId, onClose, onEdit }: { produtoId?: number; onClose?: () => void; onEdit?: (id: number) => void } = {}) {
  const routeParams = useParams<{ id: string }>();
  const id = produtoId?.toString() ?? routeParams.id;
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

            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Código</span>
                <span className="view-value">{produto.id}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Referência</span>
                <span className="view-value">{produto.referencia || '—'}</span>
              </div>
            </div>

            <div className="view-group">
              <span className="view-label">Produto</span>
              <span className="view-value">{produto.nomeProduto}</span>
            </div>

            <div className="view-group">
              <span className="view-label">Código de Barras (EAN-13)</span>
              <span className="view-value">{produto.codigoBarras || '—'}</span>
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
              Classificação
            </h2>

            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Categoria</span>
                <span className="view-value">{produto.nomeCategoria || '—'}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Marca</span>
                <span className="view-value">{produto.nomeMarca || '—'}</span>
              </div>
            </div>

            <div className="view-group">
              <span className="view-label">Unidade de Medida</span>
              <span className="view-value">{produto.nomeUnidade || '—'}</span>
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

            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Quantidade em Estoque</span>
                <span className="view-value">{produto.estoque.toLocaleString('pt-BR')}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Estoque Mínimo</span>
                <span className="view-value">{produto.estoqueMinimo.toLocaleString('pt-BR')}</span>
              </div>
            </div>

          </div>

          <div className="form-section">
            <h2 className="form-section-title">
              Status
            </h2>

            <div className="view-group">
              <span className="view-label">Situação</span>
              <span className={`status-badge ${produto.ativo ? 'status-active' : 'status-inactive'}`}>
                {produto.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

          </div>

          <div className="form-section view-dates">
            <h2 className="form-section-title">
              Informações do Sistema
            </h2>

            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Criado em</span>
                <span className="view-value view-muted">{formatDate(produto.dataCriacao)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Atualizado em</span>
                <span className="view-value view-muted">{formatDate(produto.dataAtualizacao)}</span>
              </div>
            </div>

          </div>

          <div className="form-page-footer">

            <button
              className="btn-primary"
              onClick={() => onEdit ? onEdit(produto.id) : navigate(`/produtos/editar/${produto.id}`)}
            >
              <Pencil size={15} />
              Editar
            </button>

            <button
              className="btn-secondary"
              onClick={() => onClose ? onClose() : navigate('/produtos')}
            >
              {onClose ? 'Fechar' : 'Cancelar'}
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}