import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Truck, Search } from 'lucide-react';
import type { AxiosError } from 'axios';
import CidadeLookupModal from '../components/CidadeLookupModal';

import { TransportadoraService } from '../services/transportadoraService';
import type {
  TransportadoraCreate,
  CidadeView
} from '../types/entities';

import { CidadeService } from '../services/cidadeService';

import CondicaoPagamentoLookupModal from '../components/CondicaoPagamentoLookupModal';

import {
  formatCPF,
  validateCPF,
  formatCNPJ,
  validateCNPJ,
  formatRG,
  validateRG,
  formatIE,
  validateIE,
  formatPhone,
  formatCEP,
} from '../utils/formatting';

import './PaisesPage.css';

function toInput(value: string | null | undefined) {
  return value ?? '';
}

const EMPTY: TransportadoraCreate = {
  nome: '',
  nomeFantasia: '',
  cpfCnpj: '',
  rgIe: '',
  contato2: '',
  celular: '',
  email: '',
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  idCidade: 0,
  tipoPessoa: 'PJ',
  idCondicaoPagamento: 0,
  ativo: true,
};

export default function TransportadoraFormPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = !!id;

  const [form, setForm] =
    useState<TransportadoraCreate>(EMPTY);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [nomeCidade, setNomeCidade] =
    useState('');

  const [nomeCondicao, setNomeCondicao] =
    useState('');

  const [showCondicaoModal, setShowCondicaoModal] =
    useState(false);

  const [showCidadeModal, setShowCidadeModal] =
    useState(false);

  const [cidades, setCidades] =
    useState<CidadeView[]>([]);
    useEffect(() => {

  CidadeService.getAll()
    .then(r => setCidades(r.data));

  if (!isEdit) {
    setLoading(false);
    return;
  }

  TransportadoraService.getById(Number(id))
    .then(res => {

      const t = res.data;

      setForm({

        nome: t.nome,
        nomeFantasia: toInput(t.nomeFantasia),
        cpfCnpj: t.cpfCnpj,
        rgIe: toInput(t.rgIe),
        contato2: toInput(t.contato2),
        celular: toInput(t.celular),
        email: toInput(t.email),
        cep: toInput(t.cep),
        endereco: toInput(t.endereco),
        numero: toInput(t.numero),
        complemento: toInput(t.complemento),
        bairro: toInput(t.bairro),
        idCidade: t.idCidade,
        tipoPessoa: t.tipoPessoa ?? 'PJ',
        idCondicaoPagamento: t.idCondicaoPagamento ?? 0,
        ativo: t.ativo,

      });

      setNomeCidade(t.nomeCidade ?? '');
      setNomeCondicao(t.nomeCondicaoPagamento ?? '');

    })
    .catch(() => navigate('/transportadoras'))
    .finally(() => setLoading(false));

}, [id, isEdit, navigate]);
async function handleSave(e: React.FormEvent) {
  e.preventDefault();

  if (!form.nome.trim()) {
    setError('Nome é obrigatório.');
    return;
  }

  if (!form.cpfCnpj.trim()) {
    setError('CPF/CNPJ é obrigatório.');
    return;
  }

  if (form.tipoPessoa === 'PF') {
    if (!validateCPF(form.cpfCnpj)) {
      setError('CPF inválido.');
      return;
    }
  } else {
    if (!validateCNPJ(form.cpfCnpj)) {
      setError('CNPJ inválido.');
      return;
    }
  }

  if (form.rgIe) {
    if (form.tipoPessoa === 'PF') {
      if (!validateRG(form.rgIe)) {
        setError('RG inválido.');
        return;
      }
    } else {
      if (!validateIE(form.rgIe)) {
        setError('Inscrição Estadual inválida.');
        return;
      }
    }
  }

  if (!form.idCidade) {
    setError('Cidade é obrigatória.');
    return;
  }

  if (!form.idCondicaoPagamento) {
    setError('Condição de pagamento é obrigatória.');
    return;
  }

  setSaving(true);
  setError('');

  try {

    if (isEdit) {

      await TransportadoraService.update(
        Number(id),
        form
      );

    } else {

      await TransportadoraService.create(form);

    }

    navigate('/transportadoras');

  } catch (err) {

    const axiosErr =
      err as AxiosError<{ message: string }>;

    if (axiosErr.response?.status === 409) {

      setError(
        axiosErr.response.data?.message ??
        'Já existe uma transportadora com esse CPF/CNPJ.'
      );

    } else {

      setError(
        'Erro ao salvar a transportadora.'
      );

    }

    setSaving(false);
  }
}

if (loading) {
  return (
    <div className="page-container">
      <div className="table-loading">
        Carregando...
      </div>
    </div>
  );
}
return (
  <>
    <div className="page-container">

      <div className="page-header">

        <div className="page-title-area">

          <Truck
            size={24}
            className="page-title-icon"
          />

          <h1 className="page-title">
            {isEdit
              ? 'Editar Transportadora'
              : 'Nova Transportadora'}
          </h1>

        </div>

      </div>

      <div className="form-card">

        <form
          onSubmit={handleSave}
          className="form-page"
        >

          {/* Dados Gerais */}

          <div className="form-section">

            <h2 className="form-section-title">
              Dados Gerais
            </h2>

            <div className="form-row">

              <div className="form-group">

                <label>Nome *</label>

                <input
                  type="text"
                  value={form.nome}
                  onChange={e =>
                    setForm({
                      ...form,
                      nome: e.target.value
                    })
                  }
                />

              </div>

              <div className="form-group">

                <label>Nome Fantasia</label>

                <input
                  type="text"
                  value={form.nomeFantasia ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      nomeFantasia: e.target.value
                    })
                  }
                />

              </div>

            </div>

            <div className="form-row">

              <div className="form-group">

                <label>Tipo Pessoa</label>

                <select
                  value={form.tipoPessoa}
                  onChange={e =>
                    setForm({
                      ...form,
                      tipoPessoa: e.target.value,
                      cpfCnpj: '',
                      rgIe: ''
                    })
                  }
                >
                  <option value="PJ">
                    Pessoa Jurídica
                  </option>

                  <option value="PF">
                    Pessoa Física
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label>

                  {form.tipoPessoa === 'PF'
                    ? 'CPF *'
                    : 'CNPJ *'}

                </label>

                <input
                  type="text"
                  value={form.cpfCnpj}
                  onChange={e => {

                    const valor =
                      form.tipoPessoa === 'PF'
                        ? formatCPF(e.target.value)
                        : formatCNPJ(e.target.value);

                    setForm({
                      ...form,
                      cpfCnpj: valor
                    });

                  }}
                />

              </div>

              <div className="form-group">

                <label>

                  {form.tipoPessoa === 'PF'
                    ? 'RG'
                    : 'Inscrição Estadual'}

                </label>

                <input
                  type="text"
                  value={form.rgIe ?? ''}
                  onChange={e => {

                    const valor =
                      form.tipoPessoa === 'PF'
                        ? formatRG(e.target.value)
                        : formatIE(e.target.value);

                    setForm({
                      ...form,
                      rgIe: valor
                    });

                  }}
                />

              </div>

            </div>

          </div>
                    {/* Contato */}

          <div className="form-section">

            <h2 className="form-section-title">
              Contato
            </h2>

            <div className="form-row">

              <div className="form-group">

                <label>Celular</label>

                <input
                  type="text"
                  value={form.celular ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      celular: formatPhone(e.target.value)
                    })
                  }
                />

              </div>

              <div className="form-group">

                <label>Contato 2</label>

                <input
                  type="text"
                  value={form.contato2 ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      contato2: e.target.value
                    })
                  }
                />

              </div>

              <div className="form-group">

                <label>E-mail</label>

                <input
                  type="email"
                  value={form.email ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      email: e.target.value
                    })
                  }
                />

              </div>

            </div>

          </div>
                    {/* Endereço */}

          <div className="form-section">

            <h2 className="form-section-title">
              Endereço
            </h2>

            <div className="form-row">

              <div className="form-group">

                <label>CEP</label>

                <input
                  type="text"
                  value={form.cep ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      cep: formatCEP(e.target.value)
                    })
                  }
                />

              </div>

              <div className="form-group">

                <label>Endereço</label>

                <input
                  type="text"
                  value={form.endereco ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      endereco: e.target.value
                    })
                  }
                />

              </div>

            </div>

            <div className="form-row">

              <div className="form-group">

                <label>Número</label>

                <input
                  type="text"
                  value={form.numero ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      numero: e.target.value
                    })
                  }
                />

              </div>

              <div className="form-group">

                <label>Complemento</label>

                <input
                  type="text"
                  value={form.complemento ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      complemento: e.target.value
                    })
                  }
                />

              </div>

            </div>

            <div className="form-row">

              <div className="form-group">

                <label>Bairro</label>

                <input
                  type="text"
                  value={form.bairro ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      bairro: e.target.value
                    })
                  }
                />

              </div>

              <div className="form-group">

                <label>Cidade *</label>

                <div className="lookup-field">

                  <input
                    type="text"
                    value={nomeCidade}
                    placeholder="Selecione uma cidade..."
                    readOnly
                  />

                  <button
                    type="button"
                    className="btn-search"
                  >
                    <Search size={16} />
                  </button>

                </div>

              </div>

            </div>

          </div>
                    {/* Financeiro */}

          <div className="form-section">

            <h2 className="form-section-title">
              Informações Financeiras
            </h2>

            <div className="form-row">

              <div className="form-group">

                <label>Cidade *</label>

                <div className="lookup-field">

                  <input
                    type="text"
                    value={nomeCidade}
                    placeholder="Selecione uma cidade..."
                    readOnly
                  />

                  <button
                    type="button"
                    className="btn-search"
                    onClick={() => setShowCidadeModal(true)}
                  >
                    <Search size={16} />
                  </button>

                </div>

              </div>

              <div className="form-group">

                <label>Condição de Pagamento *</label>

                <div className="lookup-field">

                  <input
                    type="text"
                    value={nomeCondicao}
                    placeholder="Selecione uma condição..."
                    readOnly
                  />

                  <button
                    type="button"
                    className="btn-search"
                    onClick={() =>
                      setShowCondicaoModal(true)
                    }
                  >
                    <Search size={16} />
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* Situação */}

            <h2 className="form-section-title">
              Situação
            </h2>

            <div className="form-group checkbox-group">

              <label>

                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={e =>
                    setForm({
                      ...form,
                      ativo: e.target.checked
                    })
                  }
                />

                Ativo

              </label>

            </div>
                      {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-page-footer">

            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving
                ? 'Salvando...'
                : 'Salvar'}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/transportadoras')}
            >
              Cancelar
            </button>

          </div>

        </form>

      </div>

    </div>

    {showCidadeModal && (
      <CidadeLookupModal
        onClose={() => setShowCidadeModal(false)}
        onSelect={(id, nome) => {

          setForm({
            ...form,
            idCidade: id
          });

          setNomeCidade(nome);

          setShowCidadeModal(false);

        }}
      />
    )}

    {showCondicaoModal && (
      <CondicaoPagamentoLookupModal
        onClose={() => setShowCondicaoModal(false)}
        onSelect={(id, nome) => {

          setForm({
            ...form,
            idCondicaoPagamento: id
          });

          setNomeCondicao(nome);

          setShowCondicaoModal(false);

        }}
      />
    )}

  </>
);
}
