import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Pencil } from 'lucide-react';

import { NotaVendaService } from '../services/notaVendaService';
import type { NotaVendaView } from '../types/entities';

import './PaisesPage.css';

function formatDate(value: string | null |undefined) {
  if (!value) return '—';

  const d = new Date(value);

  if (isNaN(d.getTime()))
    return '—';

  return d.toLocaleDateString('pt-BR');
}

export default function NotaVendaViewPage() {

  const {
    numeroNota,
    modelo,
    serie,
    clienteId
  } = useParams();

  const navigate = useNavigate();

  const [nota, setNota] = useState<NotaVendaView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    NotaVendaService.getByKey(
      numeroNota!,
      modelo!,
      serie!,
      Number(clienteId)
    )
      .then(r => setNota(r.data))
      .catch(() => navigate('/notas-venda'))
      .finally(() => setLoading(false));

  }, [numeroNota, modelo, serie, clienteId, navigate]);

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
          <FileText size={24} className="page-title-icon" />
          <h1 className="page-title">
            Visualizar Nota de Venda
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
                  Número
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
                  Status
                </span>

                <span
                  className={`status-badge ${
                    nota.ativo
                      ? 'status-active'
                      : 'status-inactive'
                  }`}
                >
                  {nota.status}
                </span>
              </div>

            </div>

          </div>
                    {/* Cliente e Pagamento */}
          <div className="form-section">
            <h2 className="form-section-title">
              Cliente e Pagamento
            </h2>

            <div className="view-group">
              <span className="view-label">
                Cliente
              </span>

              <span className="view-value">
                {nota.nomeCliente ?? '—'}
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

            <div className="form-row">

              <div className="view-group">
                <span className="view-label">
                  Transportadora
                </span>

                <span className="view-value">
                  {nota.nomeTransportadora ?? '—'}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">
                  Tipo de Frete
                </span>

                <span className="view-value">
                  {nota.tipoFrete ?? '—'}
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

              <div className="view-group">
                <span className="view-label">
                  Desconto
                </span>

                <span className="view-value">
                  {nota.desconto.toLocaleString('pt-BR', {
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

            <div className="view-group">
              <span className="view-label">
                Status
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
                  {formatDate(nota.dataCriacao)}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">
                  Atualizado em
                </span>

                <span className="view-value view-muted">
                  {formatDate(nota.dataAtualizacao)}
                </span>
              </div>

            </div>
          </div>

          <div className="form-page-footer">

            <button
              className="btn-primary"
              onClick={() =>
                navigate(
                  `/notas-venda/editar/${nota.numeroNota}/${nota.modelo}/${nota.serie}/${nota.clienteId}`
                )
              }
            >
              <Pencil size={15} />
              Editar
            </button>

            <button
              className="btn-secondary"
              onClick={() => navigate('/notas-venda')}
            >
              Cancelar
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}