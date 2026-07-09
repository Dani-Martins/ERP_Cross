import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, Search } from 'lucide-react';

import { ProdutoService } from '../services/produtoService';
import type { ProdutoCreate } from '../types/entities';

import type { AxiosError } from 'axios';

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

  // futuramente
  const [nomeCategoria] = useState('');
  const [nomeMarca] = useState('');
  const [nomeUnidade] = useState('');

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
              <label htmlFor="nomeProduto">Nome *</label>
              <input
                id="nomeProduto"
                type="text"
                value={form.nomeProduto}
                autoFocus
                placeholder="Ex: WHEY PROTEIN 900G"
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
                    descricao: e.target.value
                  })
                }
                style={{
                  resize: 'vertical',
                  width: '100%',
                  fontFamily: 'inherit'
                }}
              />
            </div>

          </div>

          {/* Classificação */}
          <div className="form-section">

            <h2 className="form-section-title">
              Classificação
            </h2>

            <div className="form-group">
              <label>Categoria</label>

              <div className="lookup-field">

                <input
                  readOnly
                  value={nomeCategoria}
                  placeholder="Será implementado futuramente..."
                  className="lookup-input"
                />

                <button
                  type="button"
                  className="btn-lookup"
                  disabled
                >
                  <Search size={16}/>
                </button>

              </div>
            </div>

            <div className="form-group">
              <label>Marca</label>

              <div className="lookup-field">

                <input
                  readOnly
                  value={nomeMarca}
                  placeholder="Será implementado futuramente..."
                  className="lookup-input"
                />

                <button
                  type="button"
                  className="btn-lookup"
                  disabled
                >
                  <Search size={16}/>
                </button>

              </div>
            </div>

            <div className="form-group">
              <label>Unidade</label>

              <div className="lookup-field">

                <input
                  readOnly
                  value={nomeUnidade}
                  placeholder="Será implementado futuramente..."
                  className="lookup-input"
                />

                <button
                  type="button"
                  className="btn-lookup"
                  disabled
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
                <input
                  id="custoCompra"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.custoCompra}
                  onChange={e =>
                    setForm({
                      ...form,
                      custoCompra: Number(e.target.value)
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

            <div className="form-group">
              <label>Preço de Venda</label>

              <input
                type="text"
                readOnly
                value={precoVenda.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              />
            </div>

          </div>

          {/* Estoque */}
          <div className="form-section">
            <h2 className="form-section-title">Estoque</h2>

            <div className="form-group">
              <label htmlFor="estoque">Quantidade em Estoque *</label>

              <input
                id="estoque"
                type="number"
                min="0"
                value={form.estoque}
                onChange={e =>
                  setForm({
                    ...form,
                    estoque: Number(e.target.value)
                  })
                }
              />
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
              onClick={() => navigate('/produtos')}
            >
              Cancelar
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}