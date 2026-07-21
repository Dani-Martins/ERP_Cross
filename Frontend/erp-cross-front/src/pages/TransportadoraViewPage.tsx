import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Truck, Pencil } from 'lucide-react';

import { TransportadoraService } from '../services/transportadoraService';
import type { TransportadoraView } from '../types/entities';

import './PaisesPage.css';

function formatDate(value: string | null |undefined) {

  if (!value)
    return '—';

  const d = new Date(value);

  if (isNaN(d.getTime()))
    return '—';

  return d.toLocaleDateString('pt-BR');

}

export default function TransportadoraViewPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [transportadora, setTransportadora] =
    useState<TransportadoraView | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    TransportadoraService.getById(Number(id))
      .then(r => setTransportadora(r.data))
      .catch(() => navigate('/transportadoras'))
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

  if (!transportadora)
    return null;
return (
  <div className="page-container">

    <div className="page-header">

      <div className="page-title-area">

        <Truck
          size={24}
          className="page-title-icon"
        />

        <h1 className="page-title">
          Visualizar Transportadora
        </h1>

      </div>

    </div>

    <div className="form-card">

      <div className="form-page">

        <div className="form-section">

          <h2 className="form-section-title">
            Dados Gerais
          </h2>

          <div className="view-group">
            <span className="view-label">
              Nome
            </span>

            <span className="view-value">
              {transportadora.nome}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              Nome Fantasia
            </span>

            <span className="view-value">
              {transportadora.nomeFantasia || '—'}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              Tipo Pessoa
            </span>

            <span className="view-value">
              {transportadora.tipoPessoa}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              CPF/CNPJ
            </span>

            <span className="view-value">
              {transportadora.cpfCnpj}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              RG / Inscrição Estadual
            </span>

            <span className="view-value">
              {transportadora.rgIe || '—'}
            </span>
          </div>

        </div>
                <div className="form-section">

          <h2 className="form-section-title">
            Contato
          </h2>

          <div className="view-group">
            <span className="view-label">
              Celular
            </span>

            <span className="view-value">
              {transportadora.celular || '—'}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              Contato 2
            </span>

            <span className="view-value">
              {transportadora.contato2 || '—'}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              E-mail
            </span>

            <span className="view-value">
              {transportadora.email || '—'}
            </span>
          </div>

        </div>

        <div className="form-section">

          <h2 className="form-section-title">
            Endereço
          </h2>

          <div className="view-group">
            <span className="view-label">
              CEP
            </span>

            <span className="view-value">
              {transportadora.cep || '—'}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              Endereço
            </span>

            <span className="view-value">
              {transportadora.endereco || '—'}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              Número
            </span>

            <span className="view-value">
              {transportadora.numero || '—'}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              Complemento
            </span>

            <span className="view-value">
              {transportadora.complemento || '—'}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              Bairro
            </span>

            <span className="view-value">
              {transportadora.bairro || '—'}
            </span>
          </div>

          <div className="view-group">
            <span className="view-label">
              Cidade
            </span>

            <span className="view-value">
              {transportadora.nomeCidade || '—'}
            </span>
          </div>

        </div>

        <div className="form-section">

          <h2 className="form-section-title">
            Informações Financeiras
          </h2>

          <div className="view-group">

            <span className="view-label">
              Condição de Pagamento
            </span>

            <span className="view-value">
              {transportadora.nomeCondicaoPagamento || '—'}
            </span>

          </div>

        </div>

        <div className="form-section">

          <h2 className="form-section-title">
            Situação
          </h2>

          <div className="view-group">

            <span className="view-label">
              Status
            </span>

            <span
              className={`status-badge ${
                transportadora.ativo
                  ? 'status-active'
                  : 'status-inactive'
              }`}
            >
              {transportadora.ativo
                ? 'Ativa'
                : 'Inativa'}
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
                {formatDate(transportadora.dataCriacao)}
              </span>

            </div>

            <div className="view-group">

              <span className="view-label">
                Atualizado em
              </span>

              <span className="view-value view-muted">
                {formatDate(transportadora.dataAtualizacao)}
              </span>

            </div>

          </div>

        </div>

        <div className="form-page-footer">

          <button
            className="btn-primary"
            onClick={() =>
              navigate(`/transportadoras/editar/${transportadora.id}`)
            }
          >
            <Pencil size={15} />
            Editar
          </button>

          <button
            className="btn-secondary"
            onClick={() =>
              navigate('/transportadoras')
            }
          >
            Voltar
          </button>

        </div>

      </div>

    </div>

  </div>
);
}