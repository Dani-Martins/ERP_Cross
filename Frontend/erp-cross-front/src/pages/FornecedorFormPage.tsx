import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Truck, Search, Plus, Trash2 } from 'lucide-react';
import { FornecedorService } from '../services/fornecedorService';
import { CidadeService } from '../services/cidadeService';
import type { FornecedorCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import CidadeLookupModal from '../components/CidadeLookupModal';
import CondicaoPagamentoLookupModal from '../components/CondicaoPagamentoLookupModal';
import TransportadoraLookupModal from '../components/TransportadoraLookupModal';
import ProdutoLookupModal from '../components/ProdutoLookupModal';
import { formatCPF, validateCPF, formatCNPJ, validateCNPJ, formatRG, validateRG, formatIE, validateIE, formatPhone, formatCEP } from '../utils/formatting';
import './PaisesPage.css';

type FornecedorFormState = FornecedorCreate & { pf: boolean };

interface ProdutoCarrinho {
  _key: number;
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  unidadeId?: number;
  nomeUnidade?: string;
  precoVenda?: number;
}

let _key = 1;
function nextKey() { return _key++; }

const EMPTY: FornecedorFormState = {
  nome: '', nomeFantasia: '', cpfCnpj: '', rgIe: '',
  contato2: '', celular: '', email: '',
  cep: '', endereco: '', numero: '', complemento: '', bairro: '',
  idCidade: 0, idCondicaoPagamento: 0, idTransportadora: undefined, ativo: true, pf: false,
};

export default function FornecedorFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FornecedorFormState>(EMPTY);
  const [nomeCidade, setNomeCidade] = useState('');
  const [nomeCondicao, setNomeCondicao] = useState('');
  const [nomeTransportadora, setNomeTransportadora] = useState('');
  const [produtos, setProdutos] = useState<ProdutoCarrinho[]>([]);
  const [nextId, setNextId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [showCondicaoModal, setShowCondicaoModal] = useState(false);
  const [showTransportadoraModal, setShowTransportadoraModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);

  const pessoaFisica = form.pf;

  useEffect(() => {
    if (isEdit) {
      FornecedorService.getById(Number(id))
        .then(res => {
          const f = res.data;
          setForm({
            nome: f.nome, nomeFantasia: f.nomeFantasia ?? '',
            cpfCnpj: f.cpfCnpj, rgIe: f.rgIe ?? '',
            contato2: f.contato2 ?? '', celular: f.celular ?? '', email: f.email ?? '',
            cep: f.cep ?? '', endereco: f.endereco ?? '', numero: f.numero ?? '',
            complemento: f.complemento ?? '', bairro: f.bairro ?? '',
            idCidade: f.idCidade, idCondicaoPagamento: f.idCondicaoPagamento ?? 0, idTransportadora: f.idTransportadora, ativo: f.ativo,
            pf: f.cpfCnpj.replace(/\D/g, '').length <= 11,
          });
          setNomeCidade(f.nomeCidade ?? '');
          setNomeCondicao(f.nomeCondicaoPagamento ?? '');
          setNomeTransportadora(f.nomeTransportadora ?? '');
          setNextId(String(f.id));
        })
        .catch(() => navigate('/fornecedores'))
        .finally(() => setLoading(false));
    } else {
      FornecedorService.getAll()
        .then((res) => {
          const maxId = res.data.length > 0 ? Math.max(...res.data.map(f => f.id)) : 0;
          setNextId(String(maxId + 1));
        })
        .catch(() => setNextId(''))
        .finally(() => setLoading(false));
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
      // Ignora erros silenciosamente — recurso opcional
    } finally {
      setBuscandoCEP(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return; }
    if (!form.cpfCnpj.trim()) { setError('CPF/CNPJ é obrigatório.'); return; }
    
    const isValidDoc = pessoaFisica ? validateCPF(form.cpfCnpj) : validateCNPJ(form.cpfCnpj);
    if (!isValidDoc) { setError(pessoaFisica ? 'CPF inválido.' : 'CNPJ inválido.'); return; }
    
    if (form.rgIe?.trim()) {
      const isValidRG = pessoaFisica ? validateRG(form.rgIe) : validateIE(form.rgIe);
      if (!isValidRG) { setError(pessoaFisica ? 'RG inválido.' : 'Inscrição Estadual inválida.'); return; }
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
      const payload: FornecedorCreate = {
        nome: form.nome,
        nomeFantasia: form.nomeFantasia || undefined,
        cpfCnpj: form.cpfCnpj,
        rgIe: form.rgIe || undefined,
        contato2: form.contato2 || undefined,
        celular: form.celular || undefined,
        email: form.email || undefined,
        cep: form.cep || undefined,
        endereco: form.endereco || undefined,
        numero: form.numero || undefined,
        complemento: form.complemento || undefined,
        bairro: form.bairro || undefined,
        idCidade: form.idCidade,
        idCondicaoPagamento: form.idCondicaoPagamento as any,
        idTransportadora: form.idTransportadora,
        ativo: form.ativo,
      };
      if (isEdit) {
        await FornecedorService.update(Number(id), payload);
      } else {
        await FornecedorService.create(payload);
      }
      navigate('/fornecedores');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Conflito de dados.');
      } else {
        setError('Erro ao salvar fornecedor.');
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
          <Truck size={24} className="page-title-icon" />
          <h1 className="page-title">{isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h1>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSave} className="form-page">

          {/* Dados Principais */}
          <div className="form-section">
            <h2 className="form-section-title">Dados Principais</h2>

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
                    checked={pessoaFisica}
                    onChange={() => setForm({ ...form, pf: true, cpfCnpj: '', rgIe: '' })}
                    style={{ accentColor: '#D4A017' }}
                  />
                  Pessoa Física
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500 }}>
                  <input
                    type="radio"
                    name="tipoPessoa"
                    checked={!pessoaFisica}
                    onChange={() => setForm({ ...form, pf: false, cpfCnpj: '', rgIe: '' })}
                    style={{ accentColor: '#D4A017' }}
                  />
                  Pessoa Jurídica
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="nome">Fornecedor *</label>
                <input
                  id="nome"
                  type="text"
                  placeholder={pessoaFisica ? 'Ex: JOÃO DA SILVA' : 'Ex: EMPRESA LTDA'}
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value.toUpperCase() })}
                  autoFocus
                />
              </div>
            </div>

            {!pessoaFisica && (
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
                <label htmlFor="cpfCnpj">{pessoaFisica ? 'CPF *' : 'CNPJ *'}</label>
                <input
                  id="cpfCnpj"
                  type="text"
                  placeholder={pessoaFisica ? 'Ex: 000.000.000-00' : 'Ex: 00.000.000/0000-00'}
                  maxLength={pessoaFisica ? 14 : 18}
                  value={form.cpfCnpj}
                  onChange={e => {
                    const val = pessoaFisica ? formatCPF(e.target.value) : formatCNPJ(e.target.value);
                    setForm({ ...form, cpfCnpj: val });
                  }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="rgIe">{pessoaFisica ? 'RG' : 'Inscrição Estadual'}</label>
                <input
                  id="rgIe"
                  type="text"
                  placeholder={pessoaFisica ? 'Ex: 00.000.000-0' : 'Ex: 90.233.073-99'}
                  maxLength={12}
                  value={form.rgIe}
                  onChange={e => {
                    const val = pessoaFisica ? formatRG(e.target.value) : formatIE(e.target.value);
                    setForm({ ...form, rgIe: val });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="form-section">
            <h2 className="form-section-title">Contato</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="celular">Celular *</label>
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
                <label htmlFor="contato2">Contato 2</label>
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
              <label htmlFor="email">E-mail *</label>
              <input
                id="email"
                type="email"
                placeholder="Ex: contato@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          {/* Endereço */}
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
                    const cep = formatCEP(e.target.value);
                    setForm({ ...form, cep });
                    if (cep.replace(/\D/g, '').length === 8) buscarEnderecoPorCEP(cep);
                  }}
                />
                {buscandoCEP && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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

            <div className="form-group">
              <label htmlFor="endereco">Logradouro *</label>
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
                <label htmlFor="numero">Número *</label>
                <input
                  id="numero"
                  type="text"
                  placeholder="Ex: 123"
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
              <label htmlFor="cidade">Cidade *</label>
              <div className="lookup-field">
                <input
                  id="cidade"
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

          {/* Dados Comerciais */}
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
            </div>

            <div className="form-group">
              <label>Transportadora</label>
              <div className="lookup-field">
                <input
                  type="text"
                  readOnly
                  placeholder="Selecione uma transportadora..."
                  value={nomeTransportadora}
                  className="lookup-input"
                />
                <button
                  type="button"
                  className="btn-lookup"
                  onClick={() => setShowTransportadoraModal(true)}
                  title="Pesquisar transportadora"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Produtos Vinculados</label>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                  {produtos.length} produto{produtos.length !== 1 ? 's' : ''} vinculado{produtos.length !== 1 ? 's' : ''}
                </span>
              </div>
              {produtos.length > 0 && (
                <div style={{ marginBottom: 12, overflowX: 'auto' }}>
                  <table className="data-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Produto</th>
                        <th style={{ width: 100, textAlign: 'center' }}>Qtd</th>
                        <th style={{ width: 80, textAlign: 'center' }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtos.map((p) => (
                        <tr key={p._key}>
                          <td>{p.nomeProduto}</td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="number"
                              min="1"
                              style={{ width: 60, padding: '4px', textAlign: 'center' }}
                              value={p.quantidade}
                              onChange={(e) => {
                                const newQtd = Math.max(1, parseInt(e.target.value) || 1);
                                setProdutos(prev => prev.map(item => item._key === p._key ? { ...item, quantidade: newQtd } : item));
                              }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn-small"
                              onClick={() => setProdutos(prev => prev.filter(item => item._key !== p._key))}
                              title="Remover produto"
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
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowProdutoModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Plus size={16} /> Adicionar Produto
              </button>
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

          {error && (
            <p className="form-error">{error}</p>
          )}

          <div className="form-page-footer">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/fornecedores')}>
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>

    {showCidadeModal && (
      <CidadeLookupModal
        onSelect={(idCidade, nomeCidadeSelecionada) => {
          setForm(prev => ({ ...prev, idCidade }));
          setNomeCidade(nomeCidadeSelecionada);
          setShowCidadeModal(false);
        }}
        onClose={() => setShowCidadeModal(false)}
      />
    )}

    {showCondicaoModal && (
      <CondicaoPagamentoLookupModal
        onSelect={(idCondicaoPagamento, nomeCondicaoSelecionada) => {
          setForm(prev => ({ ...prev, idCondicaoPagamento }));
          setNomeCondicao(nomeCondicaoSelecionada);
          setShowCondicaoModal(false);
        }}
        onClose={() => setShowCondicaoModal(false)}
      />
    )}

    {showTransportadoraModal && (
      <TransportadoraLookupModal
        onSelect={(idTransportadora, nomeTransportadoraSelecionada) => {
          setForm(prev => ({ ...prev, idTransportadora }));
          setNomeTransportadora(nomeTransportadoraSelecionada);
          setShowTransportadoraModal(false);
        }}
        onClose={() => setShowTransportadoraModal(false)}
      />
    )}

    {showProdutoModal && (
      <ProdutoLookupModal
        onSelect={(id, nomeProduto, unidadeId, nomeUnidade, precoVenda) => {
          setProdutos(prev => {
            const exists = prev.find(p => p.produtoId === id);
            if (exists) {
              return prev.map(p => p.produtoId === id ? { ...p, quantidade: p.quantidade + 1 } : p);
            } else {
              return [...prev, { _key: nextKey(), produtoId: id, nomeProduto, quantidade: 1, unidadeId, nomeUnidade, precoVenda }];
            }
          });
          setShowProdutoModal(false);
        }}
        onClose={() => setShowProdutoModal(false)}
        zBase={1001}
      />
    )}

    </>
  );
}