import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserCircle, Search } from 'lucide-react';
import { ClienteService } from '../services/clienteService';
import type { ClienteCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import CidadeLookupModal from '../components/CidadeLookupModal';
import CondicaoPagamentoLookupModal from '../components/CondicaoPagamentoLookupModal';
import { formatCPF, validateCPF, formatCNPJ, validateCNPJ, formatRG, validateRG, formatIE, validateIE, formatPhone, formatCEP } from '../utils/formatting';
import { CidadeService } from '../services/cidadeService';
import './PaisesPage.css';

function calcularIdade(dataNascimento: string): number {
  const hoje = new Date();
  const nasc = new Date(dataNascimento + 'T00:00:00');
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

/** Converte qualquer formato de data do backend para YYYY-MM-DD (exigido pelo input[type=date]) */
function toInputDate(value: string | null | undefined): string {
  if (!value) return '';
  // Já está no formato correto
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  // ISO com hora: 2010-05-15T00:00:00
  if (value.includes('T')) return value.split('T')[0];
  // DD/MM/YYYY
  const parts = value.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return '';
}

const IDADE_MINIMA = 6;
const IDADE_KIDS_MAX = 14;
const IDADE_MENOR = 18;

const EMPTY: ClienteCreate = {
  nome: '', nomeFantasia: '', cpfCnpj: '', rgIe: '',
  contato2: '', celular: '', email: '',
  cep: '', endereco: '', numero: '', complemento: '', bairro: '',
  idCidade: 0, pf: true, dataNascimento: '', sexo: '',
  idCondicaoPagamento: undefined, funcionalKids: false,
  nomeResponsavel: '', cpfResponsavel: '', parentescoResponsavel: '', observacao: '', ativo: true,
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
  const [buscandoCEP, setBuscandoCEP] = useState(false);
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
            dataNascimento: toInputDate(c.dataNascimento), sexo: c.sexo ?? '',
            idCondicaoPagamento: c.idCondicaoPagamento ?? undefined,
            funcionalKids: c.funcionalKids, ativo: c.ativo,
            nomeResponsavel: c.nomeResponsavel ?? '', cpfResponsavel: c.cpfResponsavel ?? '',
            parentescoResponsavel: c.parentescoResponsavel ?? '', observacao: c.observacao ?? '',
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

  async function buscarEnderecoPorCEP(cep: string) {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setBuscandoCEP(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.erro) return;

      // Preencher logradouro e bairro apenas se estiverem vazios
      setForm(prev => ({
        ...prev,
        endereco: prev.endereco?.trim() ? prev.endereco : (data.logradouro?.toUpperCase() ?? ''),
        bairro: prev.bairro?.trim() ? prev.bairro : (data.bairro?.toUpperCase() ?? ''),
      }));

      // Buscar cidade pelo nome + DDD (somente se não tiver cidade selecionada)
      if (data.localidade && data.ddd) {
        const cidades = await CidadeService.getAll(data.localidade);
        const match = cidades.data.find(
          c => c.nomeCidade.toUpperCase() === data.localidade.toUpperCase() && c.ddd === data.ddd
        );
        if (match) {
          setForm(prev => prev.idCidade ? prev : { ...prev, idCidade: match.id });
          setNomeCidade(prev => prev || match.nomeCidade);
        }
      }
    } catch {
      // Ignora erros silenciosamente — recurso opcional
    } finally {
      setBuscandoCEP(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return; }
    
    // Validar CPF/CNPJ
    if (!form.cpfCnpj.trim()) { setError('CPF/CNPJ é obrigatório.'); return; }
    const isValidDoc = form.pf ? validateCPF(form.cpfCnpj) : validateCNPJ(form.cpfCnpj);
    if (!isValidDoc) { setError(form.pf ? 'CPF inválido.' : 'CNPJ inválido.'); return; }
    
    // Validar RG/IE se preenchido
    if (form.rgIe?.trim()) {
      const isValidRG = form.pf ? validateRG(form.rgIe) : validateIE(form.rgIe);
      if (!isValidRG) { setError(form.pf ? 'RG inválido.' : 'Inscrição Estadual inválida.'); return; }
    }
    
    // Validar idade se Pessoa Física
    if (form.pf && form.dataNascimento) {
      const idade = calcularIdade(form.dataNascimento);
      if (idade < IDADE_MINIMA) {
        setError(`Idade mínima para cadastro é ${IDADE_MINIMA} anos.`);
        return;
      }
      if (idade < IDADE_KIDS_MAX && !form.funcionalKids) {
        setError('Clientes menores de 14 anos só podem ser cadastrados para Funcional Kids. Marque a opção correspondente.');
        return;
      }
      // Validar dados do responsável se menor de 18 anos
      if (idade < IDADE_MENOR) {
        if (!form.nomeResponsavel?.trim()) { setError('Nome do responsável é obrigatório para menores de 18 anos.'); return; }
        if (!form.parentescoResponsavel?.trim()) { setError('Parentesco do responsável é obrigatório para menores de 18 anos.'); return; }
        if (!form.cpfResponsavel?.trim()) { setError('CPF do responsável é obrigatório para menores de 18 anos.'); return; }
        if (!validateCPF(form.cpfResponsavel ?? '')) { setError('CPF do responsável inválido.'); return; }
      }
    }

    if (!form.celular?.trim()) { setError('Celular é obrigatório.'); return; }
    if (!form.email?.trim()) { setError('E-mail é obrigatório.'); return; }
    if (!form.cep?.trim()) { setError('CEP é obrigatório.'); return; }
    if (!form.endereco?.trim()) { setError('Logradouro é obrigatório.'); return; }
    if (!form.numero?.trim()) { setError('Número é obrigatório.'); return; }
    if (!form.bairro?.trim()) { setError('Bairro é obrigatório.'); return; }
    if (!form.idCidade) { setError('Cidade é obrigatória.'); return; }
    if (!form.idCondicaoPagamento) { setError('Condição de Pagamento é obrigatória.'); return; }

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
        nomeResponsavel: form.nomeResponsavel || undefined,
        cpfResponsavel: form.cpfResponsavel || undefined,
        parentescoResponsavel: form.parentescoResponsavel || undefined,
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

  const idadeAtual = form.pf && form.dataNascimento ? calcularIdade(form.dataNascimento) : null;
  const ehMenorProibido = idadeAtual !== null && idadeAtual < IDADE_MINIMA;
  const ehKids = idadeAtual !== null && idadeAtual >= IDADE_MINIMA && idadeAtual < IDADE_KIDS_MAX;
  const ehMenor = idadeAtual !== null && idadeAtual < IDADE_MENOR;

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
                  onChange={e => {
                    const val = form.pf ? formatCPF(e.target.value) : formatCNPJ(e.target.value);
                    setForm({ ...form, cpfCnpj: val });
                  }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="rgIe">{form.pf ? 'RG' : 'Inscrição Estadual'}</label>
                <input
                  id="rgIe"
                  type="text"
                  placeholder={form.pf ? 'Ex: 00.000.000-0' : 'Ex: 000.000.000.000'}
                  maxLength={form.pf ? 12 : 14}
                  value={form.rgIe}
                  onChange={e => {
                    const val = form.pf ? formatRG(e.target.value) : formatIE(e.target.value);
                    setForm({ ...form, rgIe: val });
                  }}
                />
              </div>
            </div>

            {form.pf && (() => {
              const hoje = new Date().toISOString().split('T')[0];
              return (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dataNascimento">Data de Nascimento</label>
                      <input
                        id="dataNascimento"
                        type="date"
                        max={hoje}
                        value={form.dataNascimento}
                        onChange={e => {
                          const novaData = e.target.value;
                          const idadeCalc = novaData ? calcularIdade(novaData) : null;
                          const forcarKids = idadeCalc !== null && idadeCalc >= IDADE_MINIMA && idadeCalc < IDADE_KIDS_MAX;
                          setForm({ ...form, dataNascimento: novaData, funcionalKids: forcarKids ? true : (idadeCalc !== null && idadeCalc >= IDADE_KIDS_MAX ? form.funcionalKids : false) });
                        }}
                      />
                      {idadeAtual !== null && ehMenorProibido && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--danger, #dc3545)', marginTop: 4, display: 'block' }}>
                          ⚠ Idade mínima para cadastro é {IDADE_MINIMA} anos.
                        </span>
                      )}
                      {idadeAtual !== null && ehKids && (
                        <span style={{ fontSize: '0.78rem', color: '#D4A017', marginTop: 4, display: 'block', fontWeight: 600 }}>
                          ⭐ Criança ({idadeAtual} anos) — apenas Funcional Kids permitido.
                        </span>
                      )}
                      {idadeAtual !== null && !ehMenorProibido && !ehKids && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                          Idade: {idadeAtual} anos
                        </span>
                      )}
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

                  {/* Funcional Kids — só aparece para idades entre 6 e 14 anos */}
                  {idadeAtual !== null && idadeAtual >= IDADE_MINIMA && idadeAtual <= IDADE_KIDS_MAX && (
                  <div className="form-group form-check" style={{ marginTop: 4 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: ehKids ? 'default' : 'pointer', opacity: ehMenorProibido ? 0.5 : 1 }}>
                      <input
                        type="checkbox"
                        checked={form.funcionalKids}
                        disabled={ehKids}
                        onChange={e => setForm({ ...form, funcionalKids: e.target.checked })}
                        style={{ accentColor: '#D4A017', width: 16, height: 16 }}
                      />
                      <span>
                        Aluno de Funcional Kids
                        {ehKids && (
                          <span style={{ color: '#D4A017', fontSize: '0.78rem', marginLeft: 6 }}>
                            (obrigatório para menores de {IDADE_KIDS_MAX} anos)
                          </span>
                        )}
                      </span>
                    </label>
                  </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Seção 2: Dados do Responsável — para menores de 18 anos */}
          {ehMenor && (
            <div className="form-section">
              <h2 className="form-section-title">Dados do Responsável</h2>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="nomeResponsavel">Nome do Responsável *</label>
                  <input
                    id="nomeResponsavel"
                    type="text"
                    placeholder="Ex: JOÃO DA SILVA"
                    value={form.nomeResponsavel ?? ''}
                    onChange={e => setForm({ ...form, nomeResponsavel: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="parentescoResponsavel">Parentesco *</label>
                  <select
                    id="parentescoResponsavel"
                    value={form.parentescoResponsavel ?? ''}
                    onChange={e => setForm({ ...form, parentescoResponsavel: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    <option value="PAI">Pai</option>
                    <option value="MAE">Mãe</option>
                    <option value="AVO">Avô</option>
                    <option value="AVO_F">Avó</option>
                    <option value="TIO">Tio</option>
                    <option value="TIA">Tia</option>
                    <option value="IRMAO">Irmão</option>
                    <option value="IRMA">Irmã</option>
                    <option value="RESPONSAVEL_LEGAL">Responsável Legal</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="cpfResponsavel">CPF do Responsável *</label>
                  <input
                    id="cpfResponsavel"
                    type="text"
                    placeholder="Ex: 000.000.000-00"
                    maxLength={14}
                    value={form.cpfResponsavel ?? ''}
                    onChange={e => setForm({ ...form, cpfResponsavel: formatCPF(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Seção 3: Contato */}
          <div className="form-section">
            <h2 className="form-section-title">{ehMenor ? 'Contato do Responsável' : 'Contato'}</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="celular">{ehMenor ? 'Celular do Responsável *' : 'Celular *'}</label>
                <input
                  id="celular"
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  maxLength={15}
                  value={form.celular}
                  onChange={e => setForm({ ...form, celular: formatPhone(e.target.value) })}
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
                  onChange={e => setForm({ ...form, contato2: formatPhone(e.target.value) })}
                />
              </div>
            </div>
            <div className="form-group">
                <label htmlFor="email">{ehMenor ? 'E-mail do Responsável *' : 'E-mail *'}</label>
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
                <label htmlFor="cep">CEP *</label>
                <input
                  id="cep"
                  type="text"
                  placeholder="Ex: 00000-000"
                  maxLength={9}
                  value={form.cep}
                  onChange={e => {
                    const formatted = formatCEP(e.target.value);
                    setForm({ ...form, cep: formatted });
                    if (formatted.replace(/\D/g, '').length === 8) buscarEnderecoPorCEP(formatted);
                  }}
                />
                {buscandoCEP && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                    Buscando endereço...
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="bairro">Bairro *</label>
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
                <label htmlFor="endereco">Logradouro *</label>
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
                <label htmlFor="numero">Número *</label>
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
              <div className="form-group">
                <label>Condição de Pagamento *</label>
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
                <label htmlFor="observacao">Observação</label>
                <textarea
                  id="observacao"
                  placeholder="Ex: Prefere aulas pela manhã, possui lesão no joelho..."
                  rows={3}
                  value={form.observacao ?? ''}
                  onChange={e => setForm({ ...form, observacao: e.target.value })}
                  style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 'inherit', width: '100%' }}
                />
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
