import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Truck, Pencil } from 'lucide-react';

import { FornecedorService } from '../services/fornecedorService';

import type { FornecedorView } from '../types/entities';

import './PaisesPage.css';

function formatDate(value: string | null |undefined) {

  if (!value)
    return '—';

  const d = new Date(value.replace(' ', 'T'));

  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('pt-BR');

}

export default function FornecedorViewPage() {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const [fornecedor, setFornecedor] =
    useState<FornecedorView | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    FornecedorService.getById(Number(id))

      .then(res => setFornecedor(res.data))

      .catch(() => navigate('/fornecedores'))

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

  if (!fornecedor)
    return null;

  const pessoaFisica =
    fornecedor.cpfCnpj.replace(/\D/g, '').length <= 11;
      return (

    <div className="page-container">

      <div className="page-header">

        <div className="page-title-area">

          <Truck
            size={24}
            className="page-title-icon"
          />

          <h1 className="page-title">
            Visualizar Fornecedor
          </h1>

        </div>

      </div>

      <div className="form-card">

        <div className="form-page">

          {/* Dados Principais */}

          <div className="form-section">

            <h2 className="form-section-title">
              Dados Principais
            </h2>

            <div className="view-group">
              <span className="view-label">
                Tipo de Pessoa
              </span>

              <span className="view-value">
                {pessoaFisica
                  ? 'Pessoa Física'
                  : 'Pessoa Jurídica'}
              </span>
            </div>

            <div className="view-group">

              <span className="view-label">

                {pessoaFisica
                  ? 'Nome Completo'
                  : 'Razão Social'}

              </span>

              <span className="view-value">
                {fornecedor.nome}
              </span>

            </div>

            {!pessoaFisica &&
              fornecedor.nomeFantasia && (

              <div className="view-group">

                <span className="view-label">
                  Nome Fantasia
                </span>

                <span className="view-value">
                  {fornecedor.nomeFantasia}
                </span>

              </div>

            )}

            <div className="form-row">

              <div className="view-group">

                <span className="view-label">

                  {pessoaFisica
                    ? 'CPF'
                    : 'CNPJ'}

                </span>

                <span className="view-value">
                  {fornecedor.cpfCnpj || '—'}
                </span>

              </div>

              <div className="view-group">

                <span className="view-label">

                  {pessoaFisica
                    ? 'RG'
                    : 'Inscrição Estadual'}

                </span>

                <span className="view-value">
                  {fornecedor.rgIe || '—'}
                </span>

              </div>

            </div>

          </div>

          {/* Contato */}

          <div className="form-section">

            <h2 className="form-section-title">
              Contato
            </h2>

            <div className="form-row">

              <div className="view-group">

                <span className="view-label">
                  Celular
                </span>

                <span className="view-value">
                  {fornecedor.celular || '—'}
                </span>

              </div>

              <div className="view-group">

                <span className="view-label">
                  Contato 2
                </span>

                <span className="view-value">
                  {fornecedor.contato2 || '—'}
                </span>

              </div>

            </div>

            <div className="view-group">

              <span className="view-label">
                E-mail
              </span>

              <span className="view-value">
                {fornecedor.email || '—'}
              </span>

            </div>

          </div>
                    {/* Endereço */}

          <div className="form-section">

            <h2 className="form-section-title">
              Endereço
            </h2>

            <div className="form-row">

              <div className="view-group">

                <span className="view-label">
                  CEP
                </span>

                <span className="view-value">
                  {fornecedor.cep || '—'}
                </span>

              </div>

              <div className="view-group">

                <span className="view-label">
                  Bairro
                </span>

                <span className="view-value">
                  {fornecedor.bairro || '—'}
                </span>

              </div>

            </div>

            <div className="form-row">

              <div className="view-group">

                <span className="view-label">
                  Logradouro
                </span>

                <span className="view-value">
                  {fornecedor.endereco || '—'}
                </span>

              </div>

              <div className="view-group">

                <span className="view-label">
                  Número
                </span>

                <span className="view-value">
                  {fornecedor.numero || '—'}
                </span>

              </div>

            </div>

            {fornecedor.complemento && (

              <div className="view-group">

                <span className="view-label">
                  Complemento
                </span>

                <span className="view-value">
                  {fornecedor.complemento}
                </span>

              </div>

            )}

            <div className="view-group">

              <span className="view-label">
                Cidade
              </span>

              <span className="view-value">
                {fornecedor.nomeCidade || '—'}
              </span>

            </div>

          </div>

          {/* Dados Comerciais */}

          <div className="form-section">

            <h2 className="form-section-title">
              Dados Comerciais
            </h2>

            <div className="view-group">

              <span className="view-label">
                Condição de Pagamento
              </span>

              <span className="view-value">
                {fornecedor.nomeCondicaoPagamento || '—'}
              </span>

            </div>

            <div className="view-group">

              <span className="view-label">
                Status
              </span>

              <span
                className={`status-badge ${
                  fornecedor.ativo
                    ? 'status-active'
                    : 'status-inactive'
                }`}
              >
                {fornecedor.ativo
                  ? 'Ativo'
                  : 'Inativo'}
              </span>

            </div>

          </div>

          {/* Sistema */}

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
                  {formatDate(
                    fornecedor.dataCriacao
                  )}
                </span>

              </div>

              <div className="view-group">

                <span className="view-label">
                  Atualizado em
                </span>

                <span className="view-value view-muted">
                  {formatDate(
                    fornecedor.dataAtualizacao
                  )}
                </span>

              </div>

            </div>

          </div>

          <div className="form-page-footer">

            <button
              className="btn-primary"
              onClick={() =>
                navigate(
                  `/fornecedores/editar/${fornecedor.id}`
                )
              }
            >
              <Pencil size={15} />
              Editar
            </button>

            <button
              className="btn-secondary"
              onClick={() =>
                navigate('/fornecedores')
              }
            >
              Cancelar
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}