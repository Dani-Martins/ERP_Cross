import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from 'lucide-react';
import type { AxiosError } from 'axios';

import { MarcaService } from '../services/marcaService';
import type { MarcaCreate } from '../types/entities';

import './PaisesPage.css';

const EMPTY: MarcaCreate = {
  nomeMarca: '',
  descricao: '',
  ativo: true,
};

export default function MarcaFormPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = !!id;

  const [form, setForm] =
    useState<MarcaCreate>(EMPTY);

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

    MarcaService.getById(Number(id))
      .then(res => {

        const marca = res.data;

        setForm({
          nomeMarca: marca.nomeMarca,
          descricao: marca.descricao ?? '',
          ativo: marca.ativo,
        });

      })
      .catch(() => navigate('/marcas'))
      .finally(() => setLoading(false));

  }, [id, isEdit, navigate]);
  async function handleSave(e: React.FormEvent) {
  e.preventDefault();

  if (!form.nomeMarca.trim()) {
    setError('Nome da marca é obrigatório.');
    return;
  }

  setSaving(true);
  setError('');

  try {

    if (isEdit) {

      await MarcaService.update(
        Number(id),
        form
      );

    } else {

      await MarcaService.create(form);

    }

    navigate('/marcas');

  } catch (err) {

    const axiosErr =
      err as AxiosError<{ message: string }>;

    if (axiosErr.response?.status === 409) {

      setError(
        axiosErr.response.data?.message ??
        'Já existe uma marca com esse nome.'
      );

    } else {

      setError(
        'Erro ao salvar a marca.'
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
        <Badge
          size={24}
          className="page-title-icon"
        />

        <h1 className="page-title">
          {isEdit
            ? 'Editar Marca'
            : 'Nova Marca'}
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
            Dados da Marca
          </h2>

          <div className="form-group">

            <label>
              Nome da Marca *
            </label>

            <input
              type="text"
              value={form.nomeMarca}
              onChange={e =>
                setForm({
                  ...form,
                  nomeMarca: e.target.value
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
            onClick={() => navigate('/marcas')}
          >
            Cancelar
          </button>

        </div>

      </form>

    </div>

  </div>
);
}