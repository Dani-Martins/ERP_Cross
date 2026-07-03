import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserCircle, Pencil } from 'lucide-react';

import { FuncionarioService } from '../services/funcionarioService';
import type { FuncionarioView } from '../types/entities';

import './PaisesPage.css';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';

  const parts = value.split('/');

  if (parts.length === 3) {
    const [day, month, year] = parts;
    const d = new Date(Number(year), Number(month) - 1, Number(day));

    if (!isNaN(d.getTime()))
      return d.toLocaleDateString('pt-BR');
  }

  const d = new Date(value.replace(' ', 'T'));

  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('pt-BR');
}

const SEXO: Record<string, string> = {
  M: 'Masculino',
  F: 'Feminino',
  O: 'Outro',
};

function formatMoney(value?: number | null) {
  if (value == null) return '—';

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function FuncionarioViewPage() {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const [funcionario, setFuncionario] =
    useState<FuncionarioView | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    FuncionarioService.getById(Number(id))

      .then(res => setFuncionario(res.data))

      .catch(() => navigate('/funcionarios'))

      .finally(() => setLoading(false));

  }, [id, navigate]);

  if (loading)

    return (
      <div className="page-container">
        <div className="table-loading">
          Carregando...
        </div>
      </div>
    );

  if (!funcionario)
    return null;

  return (

    <div className="page-container">

      <div className="page-header">

        <div className="page-title-area">

          <UserCircle
            size={24}
            className="page-title-icon"
          />

          <h1 className="page-title">

            Visualizar Funcionário

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

                Nome Completo

              </span>

              <span className="view-value">

                {funcionario.nome}

              </span>

            </div>

            <div className="form-row">

              <div className="view-group">

                <span className="view-label">

                  CPF

                </span>

                <span className="view-value">

                  {funcionario.cpfCnpj || '—'}

                </span>

              </div>

              <div className="view-group">

                <span className="view-label">

                  RG

                </span>

                <span className="view-value">

                  {funcionario.rgIe || '—'}

                </span>

              </div>

            </div>

            <div className="form-row">

              <div className="view-group">

                <span className="view-label">

                  Sexo

                </span>

                <span className="view-value">

                  {SEXO[funcionario.sexo ?? ''] ?? '—'}

                </span>

              </div>

              <div className="view-group">

                <span className="view-label">

                  Cargo

                </span>

                <span className="view-value">

                  {funcionario.nomeCargo || '—'}

                </span>

              </div>

            </div>

            <div className="form-row">

              <div className="view-group">

                <span className="view-label">

                  PIS

                </span>

                <span className="view-value">

                  {funcionario.pis || '—'}

                </span>

              </div>

              <div className="view-group">

                <span className="view-label">

                  CTPS

                </span>

                <span className="view-value">

                  {funcionario.ctps || '—'}

                </span>

              </div>

            </div>

            <div className="form-row">

              <div className="view-group">

                <span className="view-label">

                  Salário

                </span>

                <span className="view-value">

                  {formatMoney(funcionario.salario)}

                </span>

              </div>

              <div className="view-group">

                <span className="view-label">

                  Status

                </span>

                <span
                  className={`status-badge ${
                    funcionario.ativo
                      ? 'status-active'
                      : 'status-inactive'
                  }`}
                >
                  {funcionario.ativo
                    ? 'Ativo'
                    : 'Inativo'}
                </span>

              </div>

            </div>

          </div>
                    {/* Contato */}
          <div className="form-section">
            <h2 className="form-section-title">Contato</h2>

            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Celular</span>
                <span className="view-value">{funcionario.celular || '—'}</span>
              </div>

              <div className="view-group">
                <span className="view-label">Telefone / Contato 2</span>
                <span className="view-value">{funcionario.contato2 || '—'}</span>
              </div>
            </div>

            <div className="view-group">
              <span className="view-label">E-mail</span>
              <span className="view-value">{funcionario.email || '—'}</span>
            </div>
          </div>

          {/* Endereço */}
          <div className="form-section">
            <h2 className="form-section-title">Endereço</h2>

            <div className="form-row">
              <div className="view-group">
                <span className="view-label">CEP</span>
                <span className="view-value">{funcionario.cep || '—'}</span>
              </div>

              <div className="view-group">
                <span className="view-label">Bairro</span>
                <span className="view-value">{funcionario.bairro || '—'}</span>
              </div>
            </div>

            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Logradouro</span>
                <span className="view-value">{funcionario.endereco || '—'}</span>
              </div>

              <div className="view-group">
                <span className="view-label">Número</span>
                <span className="view-value">{funcionario.numero || '—'}</span>
              </div>
            </div>

            {funcionario.complemento && (
              <div className="view-group">
                <span className="view-label">Complemento</span>
                <span className="view-value">{funcionario.complemento}</span>
              </div>
            )}

            <div className="view-group">
              <span className="view-label">Cidade</span>
              <span className="view-value">{funcionario.nomeCidade || '—'}</span>
            </div>
          </div>

          {/* Dados Trabalhistas */}
          <div className="form-section">
            <h2 className="form-section-title">Dados Trabalhistas</h2>

            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Data de Admissão</span>
                <span className="view-value">
                  {formatDate(funcionario.dataAdmissao)}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">Data de Demissão</span>
                <span className="view-value">
                  {formatDate(funcionario.dataDemissao)}
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
                <span className="view-label">Criado em</span>
                <span className="view-value view-muted">
                  {formatDate(funcionario.dataCriacao)}
                </span>
              </div>

              <div className="view-group">
                <span className="view-label">Atualizado em</span>
                <span className="view-value view-muted">
                  {formatDate(funcionario.dataAtualizacao)}
                </span>
              </div>

            </div>

          </div>

          <div className="form-page-footer">

            <button
              className="btn-primary"
              onClick={() =>
                navigate(`/funcionarios/editar/${funcionario.id}`)
              }
            >
              <Pencil size={15} />
              Editar
            </button>

            <button
              className="btn-secondary"
              onClick={() => navigate('/funcionarios')}
            >
              Voltar
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}