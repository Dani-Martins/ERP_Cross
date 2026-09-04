import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { FornecedorService } from '../services/fornecedorService';
import { CidadeService } from '../services/cidadeService';
import type { FornecedorCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import CidadeLookupModal from './CidadeLookupModal';
import { formatCPF, validateCPF, formatCNPJ, validateCNPJ, formatRG, formatIE, formatPhone, formatCEP } from '../utils/formatting';
import '../pages/PaisesPage.css';

interface Props {
  onCreated: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function FornecedorCreateModal({ onCreated, onClose, zBase = 1100 }: Props) {
  const [form, setForm] = useState<FornecedorCreate & { pf: boolean }>({
    nome: '', nomeFantasia: '', cpfCnpj: '', rgIe: '',
    contato2: '', celular: '', email: '',
    cep: '', endereco: '', numero: '', complemento: '', bairro: '',
    idCidade: 0, idCondicaoPagamento: 0, ativo: true, pf: false,
  });
  const [nomeCidade, setNomeCidade] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);

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
    
    const isValidDoc = form.pf ? validateCPF(form.cpfCnpj) : validateCNPJ(form.cpfCnpj);
    if (!isValidDoc) { setError(form.pf ? 'CPF inválido.' : 'CNPJ inválido.'); return; }
    
    if (!form.idCidade) { setError('Cidade é obrigatória.'); return; }

    setSaving(true);
    setError('');
    try {
      const { pf, ...createData } = form;
      const res = await FornecedorService.create(createData);
      onCreated(res.data.id, res.data.nome);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Fornecedor já cadastrado.');
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
            <h2>Novo Fornecedor</h2>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="modal-scrollable" style={{ flex: 1, padding: '16px 24px' }}>
              {/* Seção 1: Dados Principais */}
              <div className="form-section" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: '#9CA3AF' }}>DADOS PRINCIPAIS</h3>
                
                <div className="form-group">
                  <label style={{ marginBottom: '6px', display: 'block' }}>Tipo de Pessoa *</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input type="radio" checked={form.pf} onChange={() => setForm({ ...form, pf: true })} />
                      Pessoa Física
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input type="radio" checked={!form.pf} onChange={() => setForm({ ...form, pf: false })} />
                      Pessoa Jurídica
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="nome">{form.pf ? 'Fornecedor' : 'Razão Social'} *</label>
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
                    <label htmlFor="cpfCnpj">{form.pf ? 'CPF' : 'CNPJ'} *</label>
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
              </div>

              {/* Seção 2: Contatos */}
              <div className="form-section" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: '#9CA3AF' }}>CONTATOS</h3>
                
                <div className="form-group">
                  <label htmlFor="celular">Celular</label>
                  <input
                    id="celular"
                    type="text"
                    placeholder="Ex: (11) 99999-9999"
                    value={form.celular}
                    onChange={e => setForm({ ...form, celular: formatPhone(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contato2">Contato 2</label>
                  <input
                    id="contato2"
                    type="text"
                    placeholder="Ex: (11) 3333-3333"
                    value={form.contato2}
                    onChange={e => setForm({ ...form, contato2: formatPhone(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Ex: fornecedor@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Seção 3: Endereço */}
              <div className="form-section" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: '#9CA3AF' }}>ENDEREÇO</h3>
                
                <div className="form-group">
                  <label htmlFor="cep">CEP</label>
                  <input
                    id="cep"
                    type="text"
                    placeholder="Ex: 12345-678"
                    maxLength={9}
                    value={form.cep}
                    onChange={e => {
                      const val = formatCEP(e.target.value);
                      setForm({ ...form, cep: val });
                      if (val.replace(/\D/g, '').length === 8 && !buscandoCEP) {
                        buscarEnderecoPorCEP(val);
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endereco">Endereço</label>
                  <input
                    id="endereco"
                    type="text"
                    placeholder="Ex: RUA PRINCIPAIS"
                    value={form.endereco}
                    onChange={e => setForm({ ...form, endereco: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ gridColumn: 'span 1' }}>
                    <label htmlFor="numero">Número</label>
                    <input
                      id="numero"
                      type="text"
                      placeholder="Ex: 123"
                      value={form.numero}
                      onChange={e => setForm({ ...form, numero: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 1' }}>
                    <label htmlFor="complemento">Complemento</label>
                    <input
                      id="complemento"
                      type="text"
                      placeholder="Ex: SALA 101"
                      value={form.complemento}
                      onChange={e => setForm({ ...form, complemento: e.target.value.toUpperCase() })}
                    />
                  </div>
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

                <div className="form-group">
                  <label>Cidade *</label>
                  <div className="lookup-field">
                    <input type="text" readOnly className="lookup-input" value={nomeCidade} placeholder="Selecione uma cidade..." />
                    <button type="button" className="btn-lookup" onClick={() => setShowCidadeModal(true)}>
                      <Search size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status */}
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
          onClose={() => setShowCidadeModal(false)}
          onSelect={(id, nome) => {
            setForm(prev => ({ ...prev, idCidade: id }));
            setNomeCidade(nome);
            setShowCidadeModal(false);
          }}
          zBase={zBase + 100}
        />
      )}
    </>
  );
}
