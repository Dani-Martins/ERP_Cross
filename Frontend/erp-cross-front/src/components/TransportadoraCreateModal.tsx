import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { TransportadoraService } from '../services/transportadoraService';
import { CidadeService } from '../services/cidadeService';
import type { TransportadoraCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import CidadeLookupModal from './CidadeLookupModal';
import CondicaoPagamentoLookupModal from './CondicaoPagamentoLookupModal';
import { formatCPF, validateCPF, formatCNPJ, validateCNPJ, formatRG, validateRG, formatIE, validateIE, formatPhone, formatCEP } from '../utils/formatting';
import '../pages/PaisesPage.css';

interface Props {
  onCreated: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function TransportadoraCreateModal({ onCreated, onClose, zBase = 1100 }: Props) {
  const [form, setForm] = useState<TransportadoraCreate>({
    nome: '', nomeFantasia: '', cpfCnpj: '', rgIe: '', contato2: '', celular: '', email: '',
    cep: '', endereco: '', numero: '', complemento: '', bairro: '',
    idCidade: 0, tipoPessoa: 'PJ', idCondicaoPagamento: 0, ativo: true,
  });
  const [nomeCidade, setNomeCidade] = useState('');
  const [nomeCondicao, setNomeCondicao] = useState('');
  const [nextId, setNextId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [showCondicaoModal, setShowCondicaoModal] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);

  useEffect(() => {
    TransportadoraService.getAll()
      .then((res) => {
        const maxId = res.data.length > 0 ? Math.max(...res.data.map(t => t.id)) : 0;
        setNextId(String(maxId + 1));
      })
      .catch(() => setNextId(''));
  }, []);

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return; }
    if (!form.cpfCnpj.trim()) { setError('CPF/CNPJ é obrigatório.'); return; }
    
    const isValidDoc = form.tipoPessoa === 'PF' ? validateCPF(form.cpfCnpj) : validateCNPJ(form.cpfCnpj);
    if (!isValidDoc) { setError(form.tipoPessoa === 'PF' ? 'CPF inválido.' : 'CNPJ inválido.'); return; }
    
    if (form.rgIe?.trim()) {
      const isValidRG = form.tipoPessoa === 'PF' ? validateRG(form.rgIe) : validateIE(form.rgIe);
      if (!isValidRG) { setError(form.tipoPessoa === 'PF' ? 'RG inválido.' : 'Inscrição Estadual inválida.'); return; }
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
      const res = await TransportadoraService.create(form);
      onCreated(res.data.id, res.data.nome);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Transportadora já cadastrada.');
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
            <h2>Nova Transportadora</h2>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="modal-scrollable" style={{ flex: 1, padding: '16px 24px' }}>
              {/* Seção 1: Dados Gerais */}
              <div className="form-section" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px', paddingBottom: '10px', borderBottom: '1px solid var(--border-card)' }}>Dados Gerais</h3>
                
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="id" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Código</label>
                  <input id="id" type="text" readOnly value={nextId} style={{ width: '120px', padding: '6px 8px', fontSize: '0.8rem', textAlign: 'center' }} />
                </div>

                <div className="form-group">
                  <label style={{ marginBottom: '6px', display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Tipo de Pessoa *</label>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingTop: 4 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
                      <input type="radio" name="tipoPessoa" checked={form.tipoPessoa === 'PF'} onChange={() => setForm({ ...form, tipoPessoa: 'PF', cpfCnpj: '', rgIe: '' })} style={{ accentColor: '#D4A017' }} />
                      Pessoa Física
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
                      <input type="radio" name="tipoPessoa" checked={form.tipoPessoa === 'PJ'} onChange={() => setForm({ ...form, tipoPessoa: 'PJ', cpfCnpj: '', rgIe: '' })} style={{ accentColor: '#D4A017' }} />
                      Pessoa Jurídica
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="nome" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Transportadora *</label>
                  <input
                    id="nome"
                    type="text"
                    placeholder={form.tipoPessoa === 'PF' ? 'Ex: JOÃO DA SILVA' : 'Ex: EMPRESA LTDA'}
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value.toUpperCase() })}
                    autoFocus
                  />
                </div>

                {form.tipoPessoa === 'PJ' && (
                  <div className="form-group">
                    <label htmlFor="nomeFantasia" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nome Fantasia</label>
                    <input
                      id="nomeFantasia"
                      type="text"
                      placeholder="Ex: TRANSPORTE XYZ"
                      value={form.nomeFantasia ?? ''}
                      onChange={e => setForm({ ...form, nomeFantasia: e.target.value.toUpperCase() })}
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cpfCnpj" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{form.tipoPessoa === 'PF' ? 'CPF *' : 'CNPJ *'}</label>
                    <input
                      id="cpfCnpj"
                      type="text"
                      placeholder={form.tipoPessoa === 'PF' ? 'Ex: 000.000.000-00' : 'Ex: 00.000.000/0000-00'}
                      maxLength={form.tipoPessoa === 'PF' ? 14 : 18}
                      value={form.cpfCnpj}
                      onChange={e => {
                        const val = form.tipoPessoa === 'PF' ? formatCPF(e.target.value) : formatCNPJ(e.target.value);
                        setForm({ ...form, cpfCnpj: val });
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="rgIe" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{form.tipoPessoa === 'PF' ? 'RG' : 'Inscrição Estadual'}</label>
                    <input
                      id="rgIe"
                      type="text"
                      placeholder={form.tipoPessoa === 'PF' ? 'Ex: 00.000.000-0' : 'Ex: 000.000.000.000'}
                      maxLength={form.tipoPessoa === 'PF' ? 12 : 14}
                      value={form.rgIe ?? ''}
                      onChange={e => {
                        const val = form.tipoPessoa === 'PF' ? formatRG(e.target.value) : formatIE(e.target.value);
                        setForm({ ...form, rgIe: val });
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Contato */}
              <div className="form-section" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px', paddingBottom: '10px', borderBottom: '1px solid var(--border-card)' }}>Contato</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="celular" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Celular *</label>
                    <input
                      id="celular"
                      type="text"
                      placeholder="Ex: (11) 99999-9999"
                      maxLength={15}
                      value={form.celular ?? ''}
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
                      value={form.contato2 ?? ''}
                      onChange={e => setForm({ ...form, contato2: formatPhone(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email" style={{ fontSize: '0.8rem', fontWeight: 600 }}>E-mail *</label>
                  <input
                    id="email"
                    type="text"
                    placeholder="Ex: contato@email.com"
                    value={form.email ?? ''}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Seção 3: Endereço */}
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
                      value={form.cep ?? ''}
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
                      value={form.bairro ?? ''}
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
                    value={form.endereco ?? ''}
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
                      value={form.numero ?? ''}
                      onChange={e => setForm({ ...form, numero: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="complemento" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Complemento</label>
                    <input
                      id="complemento"
                      type="text"
                      placeholder="Ex: SALA 12"
                      value={form.complemento ?? ''}
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

              {/* Seção 4: Dados Comerciais */}
              <div className="form-section" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px', paddingBottom: '10px', borderBottom: '1px solid var(--border-card)' }}>Dados Comerciais</h3>
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

      {showCondicaoModal && (
        <CondicaoPagamentoLookupModal
          onSelect={(idCondicao, nomeCondicaoSelecionada) => {
            setForm(prev => ({ ...prev, idCondicaoPagamento: idCondicao }));
            setNomeCondicao(nomeCondicaoSelecionada);
            setShowCondicaoModal(false);
          }}
          onClose={() => setShowCondicaoModal(false)}
          zBase={zBase + 100}
        />
      )}
    </>
  );
}
