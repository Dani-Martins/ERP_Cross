import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Package, Search } from 'lucide-react';
import { ProdutoService } from '../services/produtoService';
import type { ProdutoCreate } from '../types/entities';
import { formatEAN13 } from '../utils/formatting';
import CurrencyInput from '../components/CurrencyInput';
import CategoriaLookupModal from '../components/CategoriaLookupModal';
import MarcaLookupModal from '../components/MarcaLookupModal';
import UnidadeMedidaLookupModal from '../components/UnidadeMedidaLookupModal';
import './PaisesPage.css';

const EMPTY: ProdutoCreate = {
  nomeProduto: '',
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

export default function ProdutoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] = useState<ProdutoCreate>(EMPTY);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [nomeCategoria, setNomeCategoria] = useState('');
  const [nomeMarca, setNomeMarca] = useState('');
  const [nomeUnidade, setNomeUnidade] = useState('');
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showMarcaModal, setShowMarcaModal] = useState(false);
  const [showUnidadeModal, setShowUnidadeModal] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    ProdutoService.getById(Number(id))
      .then(res => {
        const p = res.data;

        setForm({
          nomeProduto: p.nomeProduto,
          unidadeId: p.unidadeId,
          marcaId: p.marcaId,
          categoriaId: p.categoriaId,
          descricao: p.descricao ?? '',
          codigoBarras: p.codigoBarras ?? '',
          custoCompra: p.custoCompra,
          lucroPercentual: p.lucroPercentual,
          estoque: p.estoque,
          estoqueMinimo: p.estoqueMinimo,
          ativo: p.ativo
        });
        setNomeCategoria(p.nomeCategoria ?? '');
        setNomeMarca(p.nomeMarca ?? '');
        setNomeUnidade(p.nomeUnidade ?? '');
      })
      .catch(() => navigate('/produtos'))
      .finally(() => setLoading(false));

  }, [id, isEdit, navigate]);

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

      if (isEdit)
        await ProdutoService.update(Number(id), form);
      else
        await ProdutoService.create(form);

      navigate('/produtos');

    } catch (err) {

      const axiosErr = err as AxiosError<{ message: string }>;

      if (axiosErr.response?.status === 409)
        setError(axiosErr.response.data?.message ?? 'Conflito.');

      else
        setError('Erro ao salvar.');

      setSaving(false);
    }
  }

  const precoVenda =
    form.custoCompra +
    (form.custoCompra * form.lucroPercentual / 100);

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
    <div className="page-container">

      <div className="page-header">
        <div className="page-title-area">
          <Package size={24} className="page-title-icon" />
          <h1 className="page-title">
            {isEdit ? 'Editar Produto' : 'Novo Produto'}
          </h1>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSave} className="form-page">

          {/* Dados Básicos */}
          <div className="form-section">
            <h2 className="form-section-title">Dados Básicos</h2>

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
                rows={4}
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
              onClick={() => navigate('/produtos')}
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
        />
      )}
    </div>
  );
}
