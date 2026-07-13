import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileDown, Pencil } from 'lucide-react';

import { NotaCompraService } from '../services/notaCompraService';
import type { NotaCompraView } from '../types/entities';

import './PaisesPage.css';

function formatDate(value: string | null | undefined) {
  if (!value) return '—';

  const d = new Date(value);

  if (isNaN(d.getTime()))
    return '—';

  return d.toLocaleDateString('pt-BR');
}

export default function NotaCompraViewPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [nota, setNota] =
    useState<NotaCompraView | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    NotaCompraService.getById(Number(id))
      .then(r => setNota(r.data))
      .catch(() => navigate('/nota-compras'))
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

  if (!nota)
    return null;
  return (
    <div className="page-container">

      <div className="page-header">
        <div className="page-title-area">
          <FileDown size={24} className="page-title-icon" />

          <h1 className="page-title">
            Visualizar Nota de Compra
          </h1>
        </div>
      </div>

      <div className="form-card">

        <div className="form-page">

          {/* Dados da Nota */}
          <div className="form-section">

            <h2 className="form-section-title">
              Dados da Nota
            </h2>

            <div className="form-row">

              <div className="view-group">
                <span className="view-label">
                  Número da Nota
                </span>

                <span className="view-value">
                  {nota.numeroNota}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">
                  Modelo
                </span>

                <span className="view-value">
                  {nota.modelo}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">
                  Série
                </span>

                <span className="view-value">
                  {nota.serie}
                </span>
              </div>

            </div>

            <div className="form-row">

              <div className="view-group">
                <span className="view-label">
                  Data de Emissão
                </span>

                <span className="view-value">
                  {formatDate(nota.dataEmissao)}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">
                  Chave de Acesso
                </span>

                <span className="view-value">
                  {nota.chaveAcesso || '—'}
                </span>
              </div>

            </div>

          </div>

          {/* Fornecedor e Pagamento */}
          <div className="form-section">

            <h2 className="form-section-title">
              Fornecedor e Pagamento
            </h2>

            <div className="view-group">
              <span className="view-label">
                Fornecedor
              </span>

              <span className="view-value">
                {nota.nomeFornecedor ?? '—'}
              </span>
            </div>

            <div className="view-group">
              <span className="view-label">
                Condição de Pagamento
              </span>

              <span className="view-value">
                {nota.nomeCondicaoPagamento ?? '—'}
              </span>
            </div>

          </div>
                    {/* Transporte */}
          <div className="form-section">

            <h2 className="form-section-title">
              Transporte
            </h2>

            <div className="form-row">

              <div className="view-group">
                <span className="view-label">
                  Tipo de Frete
                </span>

                <span className="view-value">
                  {nota.tipoFrete || '—'}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">
                  Transportadora
                </span>

                <span className="view-value">
                  {nota.nomeTransportadora || '—'}
                </span>
              </div>

            </div>

            <div className="view-group">
              <span className="view-label">
                Placa do Veículo
              </span>

              <span className="view-value">
                {nota.placaVeiculo || '—'}
              </span>
            </div>

          </div>

          {/* Valores */}
          <div className="form-section">

            <h2 className="form-section-title">
              Valores
            </h2>

            <div className="form-row">

              <div className="view-group">
                <span className="view-label">
                  Total dos Produtos
                </span>

                <span className="view-value">
                  {nota.totalProdutos.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">
                  Valor do Frete
                </span>

                <span className="view-value">
                  {nota.valorFrete.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>

            </div>

            <div className="form-row">

              <div className="view-group">
                <span className="view-label">
                  Valor do Seguro
                </span>

                <span className="view-value">
                  {nota.valorSeguro.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">
                  Outras Despesas
                </span>

                <span className="view-value">
                  {nota.outrasDespesas.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>

            </div>

            <div className="view-group">
              <span className="view-label">
                Total a Pagar
              </span>

              <span className="view-value">
                {nota.totalPagar.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </span>
            </div>

          </div>
                    {/* Informações Adicionais */}
          <div className="form-section">

            <h2 className="form-section-title">
              Informações Adicionais
            </h2>

            <div className="view-group">
              <span className="view-label">
                Observação
              </span>

              <span
                className="view-value"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {nota.observacao || '—'}
              </span>
            </div>

            <div className="form-row">

              <div className="view-group">
                <span className="view-label">
                  Status
                </span>

                <span className="view-value">
                  {nota.status || '—'}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">
                  Situação
                </span>

                <span
                  className={`status-badge ${
                    nota.ativo
                      ? 'status-active'
                      : 'status-inactive'
                  }`}
                >
                  {nota.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>

            </div>

          </div>

          {/* Informações do Sistema */}
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
                  {formatDate(nota.criadoEm)}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">
                  Atualizado em
                </span>

                <span className="view-value view-muted">
                  {formatDate(nota.atualizadoEm)}
                </span>
              </div>

            </div>

          </div>

          <div className="form-page-footer">

            <button
              className="btn-primary"
              onClick={() =>
                navigate(`/nota-compras/editar/${nota.id}`)
              }
            >
              <Pencil size={15} />
              Editar
            </button>

            <button
              className="btn-secondary"
              onClick={() => navigate('/nota-compras')}
            >
              Voltar
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}