import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shapes } from 'lucide-react';
import type { AxiosError } from 'axios';

import { CategoriaService } from '../services/categoriaService';
import type { CategoriaCreate } from '../types/entities';

import './PaisesPage.css';

const EMPTY: CategoriaCreate = {
  nomeCategoria: '',
  descricao: '',
  ativo: true,
};

export default function CategoriaFormPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = !!id;

  const [form, setForm] =
    useState<CategoriaCreate>(EMPTY);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {

    if (!isEdit) {
      setLoading(false);
      return;
    }

    CategoriaService.getById(Number(id))
      .then(res => {

        const categoria = res.data;

        setForm({
          nomeCategoria: categoria.nomeCategoria,
          descricao: categoria.descricao ?? '',
          ativo: categoria.ativo,
        });

      })
      .catch(() => navigate('/categorias'))
      .finally(() => setLoading(false));

  }, [id, isEdit, navigate]);
  async function handleSave(e: React.FormEvent) {
  e.preventDefault();

  if (!form.nomeCategoria.trim()) {
    setError('Nome da categoria é obrigatório.');
    return;
  }

  setSaving(true);
  setError('');

  try {

    if (isEdit) {

      await CategoriaService.update(
        Number(id),
        form
      );

    } else {

      await CategoriaService.create(form);

    }

    navigate('/categorias');

  } catch (err) {

    const axiosErr =
      err as AxiosError<{ message: string }>;

    if (axiosErr.response?.status === 409) {

      setError(
        axiosErr.response.data?.message ??
        'Já existe uma categoria com esse nome.'
      );

    } else {

      setError(
        'Erro ao salvar a categoria.'
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
  <div className="page-container">

    <div className="page-header">

      <div className="page-title-area">

        <Shapes
          size={24}
          className="page-title-icon"
        />

        <h1 className="page-title">
          {isEdit
            ? 'Editar Categoria'
            : 'Nova Categoria'}
        </h1>

      </div>

    </div>

    <div className="form-card">

      <form
        onSubmit={handleSave}
        className="form-page"
      >

        <div className="form-section">

          <h2 className="form-section-title">
            Dados da Categoria
          </h2>

          <div className="form-group">

            <label>
              Nome da Categoria *
            </label>

            <input
              type="text"
              value={form.nomeCategoria}
              onChange={e =>
                setForm({
                  ...form,
                  nomeCategoria: e.target.value
                })
              }
            />

          </div>

          <div className="form-group">

            <label>
              Descrição
            </label>

            <textarea
              rows={4}
              value={form.descricao ?? ''}
              onChange={e =>
                setForm({
                  ...form,
                  descricao: e.target.value
                })
              }
            />

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
            <div className="form-error">
              {error}
            </div>
          )}

        </div>

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
            onClick={() => navigate('/categorias')}
          >
            Cancelar
          </button>

        </div>

      </form>

    </div>

  </div>
);
}