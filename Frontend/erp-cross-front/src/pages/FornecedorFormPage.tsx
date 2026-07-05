import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Truck, Search } from 'lucide-react';

import { FornecedorService } from '../services/fornecedorService';
import { CidadeService } from '../services/cidadeService';

import CidadeLookupModal from '../components/CidadeLookupModal';
import CondicaoPagamentoLookupModal from '../components/CondicaoPagamentoLookupModal';

import type { FornecedorCreate } from '../types/entities';
import type { AxiosError } from 'axios';

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
  formatCEP
} from '../utils/formatting';

import './PaisesPage.css';

function toInput(value: string | null | undefined) {
  return value ?? '';
}

const EMPTY: FornecedorCreate = {
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
  idCondicaoPagamento: 0,

  ativo: true
};

export default function FornecedorFormPage() {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] =
    useState<FornecedorCreate>(EMPTY);

  const [pf, setPf] =
    useState(true);

  const [nomeCidade, setNomeCidade] =
    useState('');

  const [nomeCondicao, setNomeCondicao] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [buscandoCEP, setBuscandoCEP] =
    useState(false);

  const [showCidadeModal, setShowCidadeModal] =
    useState(false);

  const [showCondicaoModal, setShowCondicaoModal] =
    useState(false);

  useEffect(() => {

    if (!isEdit) {
      setLoading(false);
      return;
    }

    FornecedorService.getById(Number(id))
      .then(res => {

        const f = res.data;

        setForm({

          nome: f.nome,
          nomeFantasia: toInput(f.nomeFantasia),

          cpfCnpj: f.cpfCnpj,
          rgIe: toInput(f.rgIe),

          contato2: toInput(f.contato2),
          celular: toInput(f.celular),
          email: toInput(f.email),

          cep: toInput(f.cep),
          endereco: toInput(f.endereco),
          numero: toInput(f.numero),
          complemento: toInput(f.complemento),
          bairro: toInput(f.bairro),

          idCidade: f.idCidade,

          idCondicaoPagamento:
            f.idCondicaoPagamento,

          ativo: f.ativo

        });

        setNomeCidade(f.nomeCidade ?? '');

        setNomeCondicao(
          f.nomeCondicaoPagamento ?? ''
        );

        setPf(
          f.cpfCnpj.replace(/\D/g, '').length <= 11
        );

      })
      .catch(() => navigate('/fornecedores'))
      .finally(() => setLoading(false));

  }, [id, isEdit, navigate]);
    async function buscarEnderecoPorCEP(cep: string) {

    const clean = cep.replace(/\D/g, '');

    if (clean.length !== 8)
      return;

    setBuscandoCEP(true);

    try {

      const res = await fetch(
        `https://viacep.com.br/ws/${clean}/json/`
      );

      if (!res.ok) return;

      const data = await res.json();

      if (data.erro) return;

      setForm(prev => ({
        ...prev,
        endereco: prev.endereco?.trim()
          ? prev.endereco
          : (data.logradouro?.toUpperCase() ?? ''),
        bairro: prev.bairro?.trim()
          ? prev.bairro
          : (data.bairro?.toUpperCase() ?? '')
      }));

      if (data.localidade && data.ddd) {

        const cidades =
          await CidadeService.getAll(data.localidade);

        const cidade = cidades.data.find(c =>
          c.nomeCidade.toUpperCase() ===
            data.localidade.toUpperCase() &&
          c.ddd === data.ddd
        );

        if (cidade) {

          setForm(prev => ({
            ...prev,
            idCidade: cidade.id
          }));

          setNomeCidade(cidade.nomeCidade);

        }

      }

    }
    finally {
      setBuscandoCEP(false);
    }

  }

  async function handleSave(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setError('');

    if (!form.nome.trim()) {
      setError('Nome é obrigatório.');
      return;
    }

    if (!form.cpfCnpj.trim()) {
      setError('CPF/CNPJ é obrigatório.');
      return;
    }

    const documentoValido = pf
      ? validateCPF(form.cpfCnpj)
      : validateCNPJ(form.cpfCnpj);

    if (!documentoValido) {
      setError(
        pf
          ? 'CPF inválido.'
          : 'CNPJ inválido.'
      );
      return;
    }

    if (form.rgIe?.trim()) {

      const valido = pf
        ? validateRG(form.rgIe)
        : validateIE(form.rgIe);

      if (!valido) {
        setError(
          pf
            ? 'RG inválido.'
            : 'Inscrição Estadual inválida.'
        );
        return;
      }

    }

    if (!form.celular?.trim()) {
      setError('Celular é obrigatório.');
      return;
    }

    if (!form.email?.trim()) {
      setError('E-mail é obrigatório.');
      return;
    }

    if (!form.cep?.trim()) {
      setError('CEP é obrigatório.');
      return;
    }

    if (!form.endereco?.trim()) {
      setError('Logradouro é obrigatório.');
      return;
    }

    if (!form.numero?.trim()) {
      setError('Número é obrigatório.');
      return;
    }

    if (!form.bairro?.trim()) {
      setError('Bairro é obrigatório.');
      return;
    }

    if (!form.idCidade) {
      setError('Cidade é obrigatória.');
      return;
    }

    if (!form.idCondicaoPagamento) {
      setError(
        'Condição de Pagamento é obrigatória.'
      );
      return;
    }

    setSaving(true);

    try {

      if (isEdit) {

        await FornecedorService.update(
          Number(id),
          form
        );

      } else {

        await FornecedorService.create(form);

      }

      navigate('/fornecedores');

    }
    catch (err) {

      const axiosErr =
        err as AxiosError<{ message: string }>;

      if (axiosErr.response?.status === 409) {

        setError(
          axiosErr.response.data?.message ??
          'Conflito de dados.'
        );

      }
      else {

        setError(
          'Erro ao salvar fornecedor.'
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
            <Truck size={24} className="page-title-icon" />
            <h1 className="page-title">
              {isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </h1>
          </div>
        </div>

        <div className="form-card">
          <form
            onSubmit={handleSave}
            className="form-page"
          >

            {/* Dados Principais */}

            <div className="form-section">

              <h2 className="form-section-title">
                Dados Principais
              </h2>

              <div className="form-group">

                <label>Tipo de Pessoa *</label>

                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center',
                    paddingTop: 4
                  }}
                >

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >

                    <input
                      type="radio"
                      checked={pf}
                      onChange={() => setPf(true)}
                    />

                    Pessoa Física

                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >

                    <input
                      type="radio"
                      checked={!pf}
                      onChange={() => setPf(false)}
                    />

                    Pessoa Jurídica

                  </label>

                </div>

              </div>

              <div className="form-row">

                <div
                  className="form-group"
                  style={{ gridColumn: 'span 2' }}
                >

                  <label>
                    {pf
                      ? 'Nome Completo *'
                      : 'Razão Social *'}
                  </label>

                  <input
                    value={form.nome}
                    onChange={e =>
                      setForm({
                        ...form,
                        nome: e.target.value.toUpperCase()
                      })
                    }
                  />

                </div>

              </div>

              {!pf && (

                <div className="form-group">

                  <label>Nome Fantasia</label>

                  <input
                    value={form.nomeFantasia ?? ''}
                    onChange={e =>
                      setForm({
                        ...form,
                        nomeFantasia:
                          e.target.value.toUpperCase()
                      })
                    }
                  />

                </div>

              )}

              <div className="form-row">

                <div className="form-group">

                  <label>

                    {pf ? 'CPF *' : 'CNPJ *'}

                  </label>

                  <input
                    value={form.cpfCnpj}
                    maxLength={pf ? 14 : 18}
                    onChange={e =>
                      setForm({
                        ...form,
                        cpfCnpj: pf
                          ? formatCPF(e.target.value)
                          : formatCNPJ(e.target.value)
                      })
                    }
                  />

                </div>

                <div className="form-group">

                  <label>

                    {pf ? 'RG' : 'Inscrição Estadual'}

                  </label>

                  <input
                    value={form.rgIe ?? ''}
                    maxLength={pf ? 12 : 14}
                    onChange={e =>
                      setForm({
                        ...form,
                        rgIe: pf
                          ? formatRG(e.target.value)
                          : formatIE(e.target.value)
                      })
                    }
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

                  <label>Celular *</label>

                  <input
                    value={form.celular ?? ''}
                    maxLength={15}
                    onChange={e =>
                      setForm({
                        ...form,
                        celular: formatPhone(
                          e.target.value
                        )
                      })
                    }
                  />

                </div>

                <div className="form-group">

                  <label>Contato 2</label>

                  <input
                    value={form.contato2 ?? ''}
                    maxLength={15}
                    onChange={e =>
                      setForm({
                        ...form,
                        contato2: formatPhone(
                          e.target.value
                        )
                      })
                    }
                  />

                </div>

              </div>

              <div className="form-group">

                <label>E-mail *</label>

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
                        {/* Endereço */}

            <div className="form-section">

              <h2 className="form-section-title">
                Endereço
              </h2>

              <div className="form-row">

                <div className="form-group">

                  <label>CEP *</label>

                  <input
                    value={form.cep ?? ''}
                    maxLength={9}
                    onChange={e => {

                      const cep = formatCEP(e.target.value);

                      setForm({
                        ...form,
                        cep
                      });

                      if (cep.replace(/\D/g, '').length === 8)
                        buscarEnderecoPorCEP(cep);

                    }}
                  />

                  {buscandoCEP && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      Buscando endereço...
                    </span>
                  )}

                </div>

                <div className="form-group">

                  <label>Bairro *</label>

                  <input
                    value={form.bairro ?? ''}
                    onChange={e =>
                      setForm({
                        ...form,
                        bairro: e.target.value.toUpperCase()
                      })
                    }
                  />

                </div>

              </div>

              <div className="form-group">

                <label>Logradouro *</label>

                <input
                  value={form.endereco ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      endereco: e.target.value.toUpperCase()
                    })
                  }
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>Número *</label>

                  <input
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
                    value={form.complemento ?? ''}
                    onChange={e =>
                      setForm({
                        ...form,
                        complemento: e.target.value.toUpperCase()
                      })
                    }
                  />

                </div>

              </div>

              <div className="form-group">

                <label>Cidade *</label>

                <div className="lookup-field">

                  <input
                    readOnly
                    value={nomeCidade}
                    placeholder="Selecione uma cidade..."
                    className="lookup-input"
                  />

                  <button
                    type="button"
                    className="btn-lookup"
                    onClick={() => setShowCidadeModal(true)}
                  >
                    <Search size={16} />
                  </button>

                </div>

              </div>

            </div>

            {/* Dados Comerciais */}

            <div className="form-section">

              <h2 className="form-section-title">
                Dados Comerciais
              </h2>

              <div className="form-group">

                <label>Condição de Pagamento *</label>

                <div className="lookup-field">

                  <input
                    readOnly
                    value={nomeCondicao}
                    placeholder="Selecione..."
                    className="lookup-input"
                  />

                  <button
                    type="button"
                    className="btn-lookup"
                    onClick={() => setShowCondicaoModal(true)}
                  >
                    <Search size={16} />
                  </button>

                </div>

              </div>
              
              <div className="form-group form-check">

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

            </div>
                        {error && (
              <p className="form-error">
                {error}
              </p>
            )}

            <div className="form-page-footer">

              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/fornecedores')}
              >
                Cancelar
              </button>

            </div>

          </form>
        </div>
      </div>

      {showCidadeModal && (
        <CidadeLookupModal
          onSelect={(idCidade, nomeCidadeSelecionada) => {

            setForm(prev => ({
              ...prev,
              idCidade
            }));

            setNomeCidade(nomeCidadeSelecionada);

            setShowCidadeModal(false);

          }}
          onClose={() => setShowCidadeModal(false)}
        />
      )}

      {showCondicaoModal && (
        <CondicaoPagamentoLookupModal
          onSelect={(idCondicaoPagamento, nomeCondicaoSelecionada) => {

            setForm(prev => ({
              ...prev,
              idCondicaoPagamento
            }));

            setNomeCondicao(nomeCondicaoSelecionada);

            setShowCondicaoModal(false);

          }}
          onClose={() => setShowCondicaoModal(false)}
        />
      )}

    </>
  );

}