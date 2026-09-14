import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { ProdutoService } from '../services/produtoService';
import type { ProdutoCreate } from '../types/entities';
import { formatEAN13 } from '../utils/formatting';
import CurrencyInput from '../components/CurrencyInput';
import CategoriaLookupModal from '../components/CategoriaLookupModal';
import MarcaLookupModal from '../components/MarcaLookupModal';
import UnidadeMedidaLookupModal from '../components/UnidadeMedidaLookupModal';
import './PaisesPage.css';

interface Props {
  onCreated: (id: number, nomeProduto: string, unidadeId?: number, nomeUnidade?: string, precoVenda?: number) => void;
  onClose: () => void;
  zBase?: number;
}

const EMPTY: ProdutoCreate = {
  nomeProduto: '',
  referencia: '',
  unidadeId: undefined,
  marcaId: undefined,
  categoriaId: undefined,
  descricao: '',
  codigoBarras: '',
  custoCompra: 0,
  lucroPercentual: 0,
  estoque: 0,
  estoqueMinimo: 0,
  ativo: true,
};

export default function ProdutoCreateModal({ onCreated, onClose, zBase = 1000 }: Props) {
  const [form, setForm] = useState<ProdutoCreate>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [nomeCategoria, setNomeCategoria] = useState('');
  const [nomeMarca, setNomeMarca] = useState('');
  const [nomeUnidade, setNomeUnidade] = useState('');
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showMarcaModal, setShowMarcaModal] = useState(false);
  const [showUnidadeModal, setShowUnidadeModal] = useState(false);
  const [nextId, setNextId] = useState('1');

  useEffect(() => {
    ProdutoService.getAll()
      .then(res => {
        const maxId = res.data.length > 0
          ? Math.max(...res.data.map(p => p.id))
          : 0;
        setNextId(String(maxId + 1));
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nomeProduto.trim()) {
      setError('Nome é obrigatório.');
      return;
    }

    if (!form.marcaId) {
      setError('Marca é obrigatória.');
      return;
    }

    if (!form.unidadeId) {
      setError('Unidade é obrigatória.');
      return;
    }

    if (!form.categoriaId) {
      setError('Categoria é obrigatória.');
      return;
    }

    if (!form.custoCompra || form.custoCompra <= 0) {
      setError('Custo de Compra é obrigatório e deve ser maior que zero.');
      return;
    }

    const precoVendaValidacao = form.custoCompra + (form.custoCompra * form.lucroPercentual / 100);
    if (precoVendaValidacao <= 0) {
      setError('Preço de Venda é obrigatório e deve ser maior que zero.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await ProdutoService.create(form);
      const precoVenda = form.custoCompra + (form.custoCompra * form.lucroPercentual / 100);
      onCreated(res.data.id, form.nomeProduto, form.unidadeId, nomeUnidade, precoVenda);
    } catch {
      setError('Erro ao salvar.');
      setSaving(false);
    }
  }

  const precoVenda =
    form.custoCompra +
    (form.custoCompra * form.lucroPercentual / 100);

  return (
    <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: '640px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Novo Produto</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ fontSize: '0.8rem' }}>
          <form onSubmit={handleSave} className="form-page">

            {/* Dados Básicos */}
            <div className="form-section">
              <h2 className="form-section-title">Dados Básicos</h2>

              <div className="form-group">
                <label htmlFor="id">Código *</label>
                <input
                  id="id"
                  type="text"
                  readOnly
                  value={nextId}
                  style={{
                    width: '120px',
                    padding: '6px',
                    fontSize: '0.8rem',
                    textAlign: 'center'
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="nomeProduto">Produto *</label>
                <input
                  id="nomeProduto"
                  type="text"
                  placeholder="Ex: WHEY PROTEIN 900G"
                  value={form.nomeProduto}
                  autoFocus
                  onChange={e =>
                    setForm({
                      ...form,
                      nomeProduto: e.target.value.toUpperCase()
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>
                <textarea
                  id="descricao"
                  rows={3}
                  placeholder="Descrição do produto..."
                  value={form.descricao}
                  onChange={e =>
                    setForm({
                      ...form,
                      descricao: e.target.value.toUpperCase()
                    })
                  }
                  style={{
                    resize: 'vertical',
                    width: '100%',
                    fontFamily: 'inherit',
                    fontSize: 'inherit'
                  }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="codigoBarras">Código de Barras (EAN-13)</label>
                  <input
                    id="codigoBarras"
                    type="text"
                    placeholder="Ex: 1234567890123"
                    maxLength={13}
                    value={form.codigoBarras}
                    onChange={e =>
                      setForm({
                        ...form,
                        codigoBarras: formatEAN13(e.target.value)
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="referencia">Referência</label>
                  <input
                    id="referencia"
                    type="text"
                    placeholder="Ex: REF001"
                    value={form.referencia}
                    onChange={e =>
                      setForm({
                        ...form,
                        referencia: e.target.value.toUpperCase()
                      })
                    }
                  />
                </div>
              </div>

            </div>

            {/* Classificação */}
            <div className="form-section">

              <h2 className="form-section-title">
                Classificação
              </h2>

              <div className="form-group">
                <label>Categoria *</label>

                <div className="lookup-field">

                  <input
                    readOnly
                    type="text"
                    value={nomeCategoria}
                    placeholder="Categoria"
                    className="lookup-input"
                    title="Pesquisar Categoria"
                  />

                  <button
                    type="button"
                    className="btn-lookup"
                    onClick={() => setShowCategoriaModal(true)}
                    title="Pesquisar Categoria"
                  >
                    <Search size={16}/>
                  </button>

                </div>
              </div>

              <div className="form-group">
                <label>Marca *</label>

                <div className="lookup-field">

                  <input
                    readOnly
                    type="text"
                    value={nomeMarca}
                    placeholder="Marca"
                    className="lookup-input"
                    title="Pesquisar Marca"
                  />

                  <button
                    type="button"
                    className="btn-lookup"
                    onClick={() => setShowMarcaModal(true)}
                    title="Pesquisar Marca"
                  >
                    <Search size={16}/>
                  </button>

                </div>
              </div>

              <div className="form-group">
                <label>Unidade *</label>

                <div className="lookup-field">

                  <input
                    readOnly
                    type="text"
                    value={nomeUnidade}
                    placeholder="Unidade de Medida"
                    className="lookup-input"
                    title="Pesquisar Unidade"
                  />

                  <button
                    type="button"
                    className="btn-lookup"
                    onClick={() => setShowUnidadeModal(true)}
                    title="Pesquisar Unidade"
                  >
                    <Search size={16}/>
                  </button>

                </div>
              </div>

            </div>

            {/* Valores */}
            <div className="form-section">
              <h2 className="form-section-title">Valores</h2>

              <div className="form-row">

                <div className="form-group">
                  <label htmlFor="custoCompra">Custo de Compra *</label>
                  <CurrencyInput
                    id="custoCompra"
                    value={form.custoCompra}
                    onChange={value =>
                      setForm({
                        ...form,
                        custoCompra: value
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lucroPercentual">Lucro (%) *</label>
                  <input
                    id="lucroPercentual"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.lucroPercentual}
                    onChange={e =>
                      setForm({
                        ...form,
                        lucroPercentual: Number(e.target.value)
                      })
                    }
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Preço de Venda *</label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Preço de Venda"
                    value={precoVenda.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                    style={{ fontSize: '0.9em' }}
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-group">
                  <label htmlFor="estoque">Quantidade em Estoque *</label>
                  <input
                    id="estoque"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.estoque}
                    onChange={e =>
                      setForm({
                        ...form,
                        estoque: Number(e.target.value)
                      })
                    }
                    style={{ fontSize: '0.9em' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="estoqueMinimo">Estoque Mínimo *</label>
                  <input
                    id="estoqueMinimo"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.estoqueMinimo}
                    onChange={e =>
                      setForm({
                        ...form,
                        estoqueMinimo: Number(e.target.value)
                      })
                    }
                    style={{ fontSize: '0.9em' }}
                  />
                </div>

              </div>

            </div>

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
              <p className="form-error">
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
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
                onClick={onClose}
              >
                Cancelar
              </button>
            </div>

          </form>
        </div>

        {showCategoriaModal && (
          <CategoriaLookupModal
            onSelect={(id, nome) => {
              setForm({ ...form, categoriaId: id });
              setNomeCategoria(nome);
              setShowCategoriaModal(false);
            }}
            onClose={() => setShowCategoriaModal(false)}
            zBase={zBase + 100}
          />
        )}

        {showMarcaModal && (
          <MarcaLookupModal
            onSelect={(id, nome) => {
              setForm({ ...form, marcaId: id });
              setNomeMarca(nome);
              setShowMarcaModal(false);
            }}
            onClose={() => setShowMarcaModal(false)}
            zBase={zBase + 100}
          />
        )}

        {showUnidadeModal && (
          <UnidadeMedidaLookupModal
            onSelect={(id, nome) => {
              setForm({ ...form, unidadeId: id });
              setNomeUnidade(nome);
              setShowUnidadeModal(false);
            }}
            onClose={() => setShowUnidadeModal(false)}
            zBase={zBase + 100}
          />
        )}
      </div>
    </div>
  );
}
