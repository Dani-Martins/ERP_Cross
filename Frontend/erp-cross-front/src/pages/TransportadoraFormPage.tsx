import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Truck, Search, Plus, Trash2 } from 'lucide-react';
import { TransportadoraService } from '../services/transportadoraService';
import type { TransportadoraCreate } from '../types/entities';
import { formatCPF, validateCPF, formatCNPJ, validateCNPJ, formatRG, validateRG, formatIE, validateIE, formatPhone, formatCEP } from '../utils/formatting';
import CidadeLookupModal from '../components/CidadeLookupModal';
import CondicaoPagamentoLookupModal from '../components/CondicaoPagamentoLookupModal';
import VeiculoLookupModal from '../components/VeiculoLookupModal';
import './PaisesPage.css';

interface VeiculoCarrinho {
  _key: number;
  veiculoId: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: number | null;
}

let _key = 1;
function nextKey() { return _key++; }

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

  const [nextId, setNextId] =
    useState<string>('');

  const [showCondicaoModal, setShowCondicaoModal] = useState(false);
  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [showVeiculoModal, setShowVeiculoModal] = useState(false);
  const [veiculos, setVeiculos] = useState<VeiculoCarrinho[]>([]);

  useEffect(() => {
    if (!isEdit) {
      TransportadoraService.getAll()
        .then((res) => {
          const maxId = res.data.length > 0 ? Math.max(...res.data.map(t => t.id)) : 0;
          setNextId(String(maxId + 1));
        })
        .catch(() => setNextId(''))
        .finally(() => setLoading(false));
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
        setNextId(String(t.id));
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
    setError('Endereço é obrigatório.');
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

            <div className="form-group id-field">
              <label htmlFor="id">Código</label>
              <input id="id" type="text" readOnly value={nextId} />
            </div>

            <div className="form-group">
              <label>Tipo de Pessoa *</label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500 }}>
                  <input
                    type="radio"
                    name="tipoPessoa"
                    checked={form.tipoPessoa === 'PF'}
                    onChange={() => setForm({ ...form, tipoPessoa: 'PF', cpfCnpj: '', rgIe: '' })}
                    style={{ accentColor: '#D4A017' }}
                  />
                  Pessoa Física
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500 }}>
                  <input
                    type="radio"
                    name="tipoPessoa"
                    checked={form.tipoPessoa === 'PJ'}
                    onChange={() => setForm({ ...form, tipoPessoa: 'PJ', cpfCnpj: '', rgIe: '' })}
                    style={{ accentColor: '#D4A017' }}
                  />
                  Pessoa Jurídica
                </label>
              </div>
            </div>

            <div className="form-row">

              <div className="form-group" style={{ gridColumn: 'span 2' }}>

                <label>Transportadora *</label>

                <input
                  type="text"
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

            {form.tipoPessoa === 'PJ' && (
              <div className="form-group">

                <label>Nome Fantasia</label>

                <input
                  type="text"
                  value={form.nomeFantasia ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      nomeFantasia: e.target.value.toUpperCase()
                    })
                  }
                />

              </div>
            )}

            <div className="form-row">

              <div className="form-group">

                <label>

                  {form.tipoPessoa === 'PF'
                    ? 'CPF *'
                    : 'CNPJ *'}

                </label>

                <input
                  type="text"
                  maxLength={form.tipoPessoa === 'PF' ? 14 : 18}
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
                  maxLength={form.tipoPessoa === 'PF' ? 12 : 14}
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

                <label>Celular *</label>

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
                      contato2: e.target.value.toUpperCase()
                    })
                  }
                />

              </div>

              <div className="form-group">

                <label>E-mail *</label>

                <input
                  type="email"
                  value={form.email ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      email: e.target.value.toUpperCase()
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

                <label>CEP *</label>

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

                <label>Endereço *</label>

                <input
                  type="text"
                  value={form.endereco ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      endereco: e.target.value.toUpperCase()
                    })
                  }
                />

              </div>

            </div>

            <div className="form-row">

              <div className="form-group">

                <label>Número *</label>

                <input
                  type="text"
                  value={form.numero ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      numero: e.target.value.toUpperCase()
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
                      complemento: e.target.value.toUpperCase()
                    })
                  }
                />

              </div>

            </div>

            <div className="form-row">

              <div className="form-group">

                <label>Bairro *</label>

                <input
                  type="text"
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

            <div className="form-row">

              <div className="form-group lookup-code-group">
                <label>Cód.</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    value={form.idCidade > 0 ? form.idCidade : ''}
                    placeholder="ID"
                    readOnly
                    className="lookup-input"
                    style={{ width: '100%', textAlign: 'center' }}
                  />
                  <button
                    type="button"
                    className="btn-lookup"
                    onClick={() => setShowCidadeModal(true)}
                    title="Pesquisar cidade"
                    style={{ padding: '4px 8px' }}
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Cidade *</label>
                <input
                  type="text"
                  value={nomeCidade}
                  placeholder="Selecione uma cidade..."
                  readOnly
                  className="lookup-input"
                />
              </div>

            </div>

          </div>

          {/* Veículos */}
          <div className="form-section">
            <h2 className="form-section-title">Veículos</h2>
            {veiculos.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <small style={{ color: 'var(--text-muted)' }}>
                  {veiculos.length} veículo(s) vinculado(s)
                </small>
                <div style={{ marginTop: '0.8rem' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>PLACA</th>
                        <th>MODELO</th>
                        <th>MARCA</th>
                        <th>ANO</th>
                        <th style={{ width: 80, textAlign: 'center' }}>AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {veiculos.map((v) => (
                        <tr key={v._key}>
                          <td style={{ fontWeight: 'bold' }}>{v.placa}</td>
                          <td>{v.modelo}</td>
                          <td>{v.marca}</td>
                          <td style={{ textAlign: 'center' }}>{v.ano}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn-small"
                              onClick={() => setVeiculos(prev => prev.filter(item => item._key !== v._key))}
                              title="Remover veículo"
                              style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowVeiculoModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Plus size={16} /> Adicionar Veículo
            </button>
          </div>

          {/* Financeiro */}

          <div className="form-section">

            <h2 className="form-section-title">
              Informações Financeiras
            </h2>

            <div className="form-row">

              <div className="form-group lookup-code-group">

                <label>Cód.</label>

                <div style={{ display: 'flex', gap: '4px' }}>

                  <input
                    type="text"
                    value={form.idCondicaoPagamento > 0 ? form.idCondicaoPagamento : ''}
                    placeholder="ID"
                    readOnly
                    className="lookup-input"
                    style={{ width: '100%', textAlign: 'center' }}
                  />

                  <button
                    type="button"
                    className="btn-lookup"
                    onClick={() =>
                      setShowCondicaoModal(true)
                    }
                    title="Pesquisar condição de pagamento"
                    style={{ padding: '4px 8px' }}
                  >
                    <Search size={16} />
                  </button>

                </div>

              </div>

              <div className="form-group" style={{ flex: 1 }}>

                <label>Condição de Pagamento *</label>

                <input
                  type="text"
                  value={nomeCondicao}
                  placeholder="Selecione uma condição..."
                  readOnly
                  className="lookup-input"
                />

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

    {showVeiculoModal && (
      <VeiculoLookupModal
        onSelect={(veiculoId, placa, modelo, marca, ano) => {
          setVeiculos(prev => {
            const exists = prev.find(v => v.veiculoId === veiculoId);
            if (exists) {
              return prev;
            } else {
              return [...prev, { _key: nextKey(), veiculoId, placa, modelo, marca, ano }];
            }
          });
          setShowVeiculoModal(false);
        }}
        onClose={() => setShowVeiculoModal(false)}
        zBase={1001}
      />
    )}

  </>
);
}
