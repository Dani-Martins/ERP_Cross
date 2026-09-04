import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { ClienteService } from '../services/clienteService';
import { CidadeService } from '../services/cidadeService';
import type { ClienteCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import CidadeLookupModal from './CidadeLookupModal';
import { formatCPF, validateCPF, formatCNPJ, validateCNPJ, formatRG, formatIE, formatPhone, formatCEP } from '../utils/formatting';
import '../pages/PaisesPage.css';

interface Props {
  onCreated: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function ClienteCreateModal({ onCreated, onClose, zBase = 1100 }: Props) {
  const [form, setForm] = useState<ClienteCreate>({
    nome: '', cpfCnpj: '', pf: true, idCidade: 0, limiteCredito: 0, funcionalKids: false,
    nomeFantasia: '', rgIe: '', contato2: '', celular: '', email: '', cep: '', endereco: '', numero: '', complemento: '', bairro: '',
    dataNascimento: '', sexo: '', nomeResponsavel: '', cpfResponsavel: '', parentescoResponsavel: '', observacao: '', ativo: true,
  });
  const [nomeCidade, setNomeCidade] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);

  function calcularIdade(dataNascimento: string): number {
    const hoje = new Date();
    const nasc = new Date(dataNascimento + 'T00:00:00');
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  }

  async function buscarEnderecoPorCEP(cep: string) {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setBuscandoCEP(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.erro) return;

      setForm(prev => ({
        ...prev,
        endereco: prev.endereco?.trim() ? prev.endereco : (data.logradouro?.toUpperCase() ?? ''),
        bairro: prev.bairro?.trim() ? prev.bairro : (data.bairro?.toUpperCase() ?? ''),
      }));

      if (data.localidade && data.ddd) {
        const cidades = await CidadeService.getAll(data.localidade);
        const match = cidades.data.find(c => c.nomeCidade.toUpperCase() === data.localidade.toUpperCase() && c.ddd === data.ddd);
        if (match) {
          setForm(prev => prev.idCidade ? prev : { ...prev, idCidade: match.id });
          setNomeCidade(prev => prev || match.nomeCidade);
        }
      }
    } catch {
      // Ignora erros
    } finally {
      setBuscandoCEP(false);
    }
  }

  const idadeAtual = form.pf && form.dataNascimento ? calcularIdade(form.dataNascimento) : null;
  const ehMenor = idadeAtual !== null && idadeAtual < 18;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return; }
    if (!form.cpfCnpj.trim()) { setError('CPF/CNPJ é obrigatório.'); return; }
    
    const isValidDoc = form.pf ? validateCPF(form.cpfCnpj) : validateCNPJ(form.cpfCnpj);
    if (!isValidDoc) { setError(form.pf ? 'CPF inválido.' : 'CNPJ inválido.'); return; }
    
    if (!form.idCidade) { setError('Cidade é obrigatória.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await ClienteService.create(form);
      onCreated(res.data.id, res.data.nome);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Cliente já cadastrado.');
      } else {
        setError('Erro ao salvar. Verifique os dados e tente novamente.');
      }
      setSaving(false);
    }
  }

  return (
    <>
      <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
        <div className="modal" style={{ maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Novo Cliente</h2>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="modal-scrollable" style={{ flex: 1, padding: '16px 24px' }}>
              {/* Seção 1: Dados Principais */}
              <div className="form-section" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px', paddingBottom: '10px', borderBottom: '1px solid var(--border-card)' }}>Dados Principais</h3>
                
                <div className="form-group">
                  <label style={{ marginBottom: '6px', display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Tipo de Pessoa *</label>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingTop: 4 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
                      <input type="radio" name="tipoPessoa" checked={form.pf} onChange={() => setForm({ ...form, pf: true, sexo: '', dataNascimento: '' })} style={{ accentColor: '#D4A017' }} />
                      Pessoa Física
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
                      <input type="radio" name="tipoPessoa" checked={!form.pf} onChange={() => setForm({ ...form, pf: false, sexo: '', dataNascimento: '' })} style={{ accentColor: '#D4A017' }} />
                      Pessoa Jurídica
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="nome" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{form.pf ? 'Cliente *' : 'Razão Social *'}</label>
                  <input
                    id="nome"
                    type="text"
                    placeholder={form.pf ? 'Ex: JOÃO DA SILVA' : 'Ex: EMPRESA LTDA'}
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value.toUpperCase() })}
                    autoFocus
                  />
                </div>

                {!form.pf && (
                  <div className="form-group">
                    <label htmlFor="nomeFantasia" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nome Fantasia</label>
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
                    <label htmlFor="cpfCnpj" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{form.pf ? 'CPF *' : 'CNPJ *'}</label>
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
                    <label htmlFor="rgIe" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{form.pf ? 'RG' : 'Inscrição Estadual'}</label>
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

                {/* Data Nascimento e Sexo - apenas Pessoa Física */}
                {form.pf && (() => {
                  const hoje = new Date().toISOString().split('T')[0];
                  return (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="dataNascimento" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Data de Nascimento</label>
                          <input
                            id="dataNascimento"
                            type="date"
                            max={hoje}
                            value={form.dataNascimento}
                            onChange={e => {
                              const novaData = e.target.value;
                              setForm({ ...form, dataNascimento: novaData });
                            }}
                          />
                          {idadeAtual !== null && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                              Idade: {idadeAtual} anos
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="sexo" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Sexo</label>
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

                      {/* Funcional Kids - só aparece para idades entre 6 e 14 anos */}
                      {idadeAtual !== null && idadeAtual >= 6 && idadeAtual <= 14 && (
                        <div className="form-group form-check" style={{ marginTop: 4 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                            <input
                              type="checkbox"
                              checked={form.funcionalKids}
                              onChange={e => setForm({ ...form, funcionalKids: e.target.checked })}
                              style={{ accentColor: '#D4A017', width: 16, height: 16 }}
                            />
                            Aluno de Funcional Kids (obrigatório para menores de 14 anos)
                          </label>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Seção 2: Dados do Responsável - para menores de 18 anos */}
              {ehMenor && (
                <div className="form-section" style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px', paddingBottom: '10px', borderBottom: '1px solid var(--border-card)' }}>Dados do Responsável</h3>
                  <div className="form-group">
                    <label htmlFor="nomeResponsavel" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nome do Responsável *</label>
                    <input
                      id="nomeResponsavel"
                      type="text"
                      placeholder="Ex: JOÃO DA SILVA"
                      value={form.nomeResponsavel ?? ''}
                      onChange={e => setForm({ ...form, nomeResponsavel: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="parentescoResponsavel" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Parentesco *</label>
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
                      <label htmlFor="cpfResponsavel" style={{ fontSize: '0.8rem', fontWeight: 600 }}>CPF do Responsável *</label>
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
              <div className="form-section" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px', paddingBottom: '10px', borderBottom: '1px solid var(--border-card)' }}>{ehMenor ? 'Contato do Responsável' : 'Contato'}</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="celular" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{ehMenor ? 'Celular do Responsável *' : 'Celular *'}</label>
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
                    <label htmlFor="contato2" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Telefone / Contato 2</label>
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
                  <label htmlFor="email" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{ehMenor ? 'E-mail do Responsável *' : 'E-mail *'}</label>
                  <input
                    id="email"
                    type="text"
                    placeholder="Ex: contato@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Seção 4: Endereço */}
              <div className="form-section" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px', paddingBottom: '10px', borderBottom: '1px solid var(--border-card)' }}>Endereço</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cep" style={{ fontSize: '0.8rem', fontWeight: 600 }}>CEP *</label>
                    <input
                      id="cep"
                      type="text"
                      placeholder="Ex: 00000-000"
                      maxLength={9}
                      value={form.cep}
                      onChange={e => {
                        const formatted = formatCEP(e.target.value);
                        setForm({ ...form, cep: formatted });
                        if (formatted.replace(/\D/g, '').length === 8 && !buscandoCEP) {
                          buscarEnderecoPorCEP(formatted);
                        }
                      }}
                    />
                    {buscandoCEP && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                        Buscando endereço...
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="bairro" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Bairro *</label>
                    <input
                      id="bairro"
                      type="text"
                      placeholder="Ex: CENTRO"
                      value={form.bairro}
                      onChange={e => setForm({ ...form, bairro: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="endereco" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Logradouro *</label>
                  <input
                    id="endereco"
                    type="text"
                    placeholder="Ex: RUA DAS FLORES"
                    value={form.endereco}
                    onChange={e => setForm({ ...form, endereco: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="numero" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Número *</label>
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
                    <label htmlFor="complemento" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Complemento</label>
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
                  <label htmlFor="idCidade" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cidade *</label>
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

              {/* Seção 5: Dados Comerciais */}
              <div className="form-section" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px', paddingBottom: '10px', borderBottom: '1px solid var(--border-card)' }}>Dados Comerciais</h3>
                <div className="form-group">
                  <label htmlFor="observacao" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Observação</label>
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

              {error && <p className="form-error" style={{ marginTop: '12px' }}>{error}</p>}
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
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
          zBase={zBase + 100}
        />
      )}
    </>
  );
}
