import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserCircle, Search } from 'lucide-react';
import { ClienteService } from '../services/clienteService';
import type { ClienteCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import CidadeLookupModal from '../components/CidadeLookupModal';
import CondicaoPagamentoLookupModal from '../components/CondicaoPagamentoLookupModal';
import './PaisesPage.css';

const EMPTY: ClienteCreate = {
  nome: '', nomeFantasia: '', cpfCnpj: '', rgIe: '',
  contato2: '', celular: '', email: '',
  cep: '', endereco: '', numero: '', complemento: '', bairro: '',
  idCidade: 0, pf: true, dataNascimento: '', sexo: '',
  idCondicaoPagamento: undefined, limiteCredito: 0, ativo: true,
};

export default function ClienteFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<ClienteCreate>(EMPTY);
  const [nomeCidade, setNomeCidade] = useState('');
  const [nomeCondicao, setNomeCondicao] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [showCondicaoModal, setShowCondicaoModal] = useState(false);

  useEffect(() => {
    if (isEdit) {
      ClienteService.getById(Number(id))
        .then(res => {
          const c = res.data;
          setForm({
            nome: c.nome, nomeFantasia: c.nomeFantasia ?? '',
            cpfCnpj: c.cpfCnpj, rgIe: c.rgIe ?? '',
            contato2: c.contato2 ?? '', celular: c.celular ?? '', email: c.email ?? '',
            cep: c.cep ?? '', endereco: c.endereco ?? '', numero: c.numero ?? '',
            complemento: c.complemento ?? '', bairro: c.bairro ?? '',
            idCidade: c.idCidade, pf: c.pf,
            dataNascimento: c.dataNascimento ?? '', sexo: c.sexo ?? '',
            idCondicaoPagamento: c.idCondicaoPagamento ?? undefined,
            limiteCredito: c.limiteCredito, ativo: c.ativo,
          });
          setNomeCidade(c.nomeCidade ?? '');
          setNomeCondicao(c.nomeCondicaoPagamento ?? '');
        })
        .catch(() => navigate('/clientes'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, isEdit, navigate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return; }
    if (!form.cpfCnpj.trim()) { setError('CPF/CNPJ é obrigatório.'); return; }
    if (!form.idCidade) { setError('Cidade é obrigatória.'); return; }

    setSaving(true);
    setError('');
    try {
      const payload: ClienteCreate = {
        ...form,
        nomeFantasia: form.nomeFantasia || undefined,
        rgIe: form.rgIe || undefined,
        contato2: form.contato2 || undefined,
        celular: form.celular || undefined,
        email: form.email || undefined,
        cep: form.cep || undefined,
        endereco: form.endereco || undefined,
        numero: form.numero || undefined,
        complemento: form.complemento || undefined,
        bairro: form.bairro || undefined,
        dataNascimento: form.dataNascimento || undefined,
        sexo: form.sexo || undefined,
        idCondicaoPagamento: form.idCondicaoPagamento || undefined,
      };
      if (isEdit) {
        await ClienteService.update(Number(id), payload);
      } else {
        await ClienteService.create(payload);
      }
      navigate('/clientes');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Conflito nos dados informados.');
      } else {
        setError('Erro ao salvar. Verifique os dados e tente novamente.');
      }
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="table-loading">Carregando...</div>
      </div>
    );
  }

  return (
    <>
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <UserCircle size={24} className="page-title-icon" />
          <h1 className="page-title">{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h1>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSave} className="form-page">

          {/* Seção 1: Dados Principais */}
          <div className="form-section">
            <h2 className="form-section-title">Dados Principais</h2>

            <div className="form-group">
              <label>Tipo de Pessoa *</label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500 }}>
                  <input
                    type="radio"
                    name="tipoPessoa"
                    checked={form.pf}
                    onChange={() => setForm({ ...form, pf: true, sexo: '', dataNascimento: '' })}
                    style={{ accentColor: '#D4A017' }}
                  />
                  Pessoa Física
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500 }}>
                  <input
                    type="radio"
                    name="tipoPessoa"
                    checked={!form.pf}
                    onChange={() => setForm({ ...form, pf: false, sexo: '', dataNascimento: '' })}
                    style={{ accentColor: '#D4A017' }}
                  />
                  Pessoa Jurídica
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="nome">{form.pf ? 'Nome Completo *' : 'Razão Social *'}</label>
                <input
                  id="nome"
                  type="text"
                  placeholder={form.pf ? 'Ex: JOÃO DA SILVA' : 'Ex: EMPRESA LTDA'}
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value.toUpperCase() })}
                  autoFocus
                />
              </div>
            </div>

            {!form.pf && (
              <div className="form-group">
                <label htmlFor="nomeFantasia">Nome Fantasia</label>
                <input
                  id="nomeFantasia"
                  type="text"
                  placeholder="Ex: EMPRESA COMERCIAL"
                  value={form.nomeFantasia}
                  onChange={e => setForm({ ...form, nomeFantasia: e.target.value.toUpperCase() })}
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cpfCnpj">{form.pf ? 'CPF *' : 'CNPJ *'}</label>
                <input
                  id="cpfCnpj"
                  type="text"
                  placeholder={form.pf ? 'Ex: 000.000.000-00' : 'Ex: 00.000.000/0000-00'}
                  maxLength={form.pf ? 14 : 18}
                  value={form.cpfCnpj}
                  onChange={e => setForm({ ...form, cpfCnpj: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="rgIe">{form.pf ? 'RG' : 'Inscrição Estadual'}</label>
                <input
                  id="rgIe"
                  type="text"
                  placeholder={form.pf ? 'Ex: 00.000.000-0' : 'Ex: 000.000.000.000'}
                  value={form.rgIe}
                  onChange={e => setForm({ ...form, rgIe: e.target.value })}
                />
              </div>
            </div>

            {form.pf && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dataNascimento">Data de Nascimento</label>
                  <input
                    id="dataNascimento"
                    type="date"
                    value={form.dataNascimento}
                    onChange={e => setForm({ ...form, dataNascimento: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sexo">Sexo</label>
                  <select
                    id="sexo"
                    value={form.sexo}
                    onChange={e => setForm({ ...form, sexo: e.target.value })}
                  >
                    <option value="">Não informado</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Seção 2: Contato */}
          <div className="form-section">
            <h2 className="form-section-title">Contato</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="celular">Celular</label>
                <input
                  id="celular"
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  maxLength={15}
                  value={form.celular}
                  onChange={e => setForm({ ...form, celular: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contato2">Telefone / Contato 2</label>
                <input
                  id="contato2"
                  type="text"
                  placeholder="Ex: (11) 3333-3333"
                  maxLength={15}
                  value={form.contato2}
                  onChange={e => setForm({ ...form, contato2: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="text"
                placeholder="Ex: contato@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {/* Seção 3: Endereço */}
          <div className="form-section">
            <h2 className="form-section-title">Endereço</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cep">CEP</label>
                <input
                  id="cep"
                  type="text"
                  placeholder="Ex: 00000-000"
                  maxLength={9}
                  value={form.cep}
                  onChange={e => setForm({ ...form, cep: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="bairro">Bairro</label>
                <input
                  id="bairro"
                  type="text"
                  placeholder="Ex: CENTRO"
                  value={form.bairro}
                  onChange={e => setForm({ ...form, bairro: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="endereco">Logradouro</label>
                <input
                  id="endereco"
                  type="text"
                  placeholder="Ex: RUA DAS FLORES"
                  value={form.endereco}
                  onChange={e => setForm({ ...form, endereco: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="numero">Número</label>
                <input
                  id="numero"
                  type="text"
                  placeholder="Ex: 123"
                  maxLength={10}
                  value={form.numero}
                  onChange={e => setForm({ ...form, numero: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="complemento">Complemento</label>
                <input
                  id="complemento"
                  type="text"
                  placeholder="Ex: APTO 42"
                  value={form.complemento}
                  onChange={e => setForm({ ...form, complemento: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="idCidade">Cidade *</label>
              <div className="lookup-field">
                <input
                  id="idCidade"
                  type="text"
                  readOnly
                  placeholder="Selecione uma cidade..."
                  value={nomeCidade}
                  className="lookup-input"
                />
                <button
                  type="button"
                  className="btn-lookup"
                  onClick={() => setShowCidadeModal(true)}
                  title="Pesquisar cidade"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Seção 4: Dados Comerciais */}
          <div className="form-section">
            <h2 className="form-section-title">Dados Comerciais</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Condição de Pagamento</label>
                <div className="lookup-field">
                  <input
                    type="text"
                    readOnly
                    placeholder="Selecione uma condição..."
                    value={nomeCondicao}
                    className="lookup-input"
                  />
                  <button
                    type="button"
                    className="btn-lookup"
                    onClick={() => setShowCondicaoModal(true)}
                    title="Pesquisar condição de pagamento"
                  >
                    <Search size={16} />
                  </button>
                </div>
                {nomeCondicao && (
                  <button
                    type="button"
                    onClick={() => { setNomeCondicao(''); setForm(prev => ({ ...prev, idCondicaoPagamento: undefined })); }}
                    style={{ alignSelf: 'flex-start', marginTop: 4, fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    ✕ Remover condição
                  </button>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="limiteCredito">Limite de Crédito (R$)</label>
                <input
                  id="limiteCredito"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0,00"
                  value={form.limiteCredito}
                  onChange={e => setForm({ ...form, limiteCredito: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="form-group form-check">
              <label>
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={e => setForm({ ...form, ativo: e.target.checked })}
                />
                Ativo
              </label>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-page-footer">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/clientes')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    {showCidadeModal && (
      <CidadeLookupModal
        onSelect={(cidadeId, cidadeNome) => {
          setForm(prev => ({ ...prev, idCidade: cidadeId }));
          setNomeCidade(cidadeNome);
          setShowCidadeModal(false);
        }}
        onClose={() => setShowCidadeModal(false)}
      />
    )}
    {showCondicaoModal && (
      <CondicaoPagamentoLookupModal
        onSelect={(condicaoId, condicaoNome) => {
          setForm(prev => ({ ...prev, idCondicaoPagamento: condicaoId }));
          setNomeCondicao(condicaoNome);
          setShowCondicaoModal(false);
        }}
        onClose={() => setShowCondicaoModal(false)}
      />
    )}
    </>
  );
}
