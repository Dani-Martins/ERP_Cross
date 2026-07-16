import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Ruler } from 'lucide-react';
import type { AxiosError } from 'axios';

import { UnidadeMedidaService } from '../services/unidadeMedidaService';
import type { UnidadeMedidaCreate } from '../types/entities';

import './PaisesPage.css';

const EMPTY: UnidadeMedidaCreate = {
  nomeUnidade: '',
  sigla: '',
  ativo: true,
};

export default function UnidadeMedidaFormPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = !!id;

  const [form, setForm] =
    useState<UnidadeMedidaCreate>(EMPTY);

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

    UnidadeMedidaService.getById(Number(id))
      .then(res => {

        const unidade = res.data;

        setForm({
          nomeUnidade: unidade.nomeUnidade,
          sigla: unidade.sigla ?? '',
          ativo: unidade.ativo,
        });

      })
      .catch(() => navigate('/unidades'))
      .finally(() => setLoading(false));

  }, [id, isEdit, navigate]);
  async function handleSave(e: React.FormEvent) {
  e.preventDefault();

  if (!form.nomeUnidade.trim()) {
    setError('Nome da unidade é obrigatório.');
    return;
  }

  setSaving(true);
  setError('');

  try {

    if (isEdit) {

      await UnidadeMedidaService.update(
        Number(id),
        form
      );

    } else {

      await UnidadeMedidaService.create(form);

    }

    navigate('/unidades');

  } catch (err) {

    const axiosErr =
      err as AxiosError<{ message: string }>;

    if (axiosErr.response?.status === 409) {

      setError(
        axiosErr.response.data?.message ??
        'Já existe uma unidade de medida com esse nome.'
      );

    } else {

      setError(
        'Erro ao salvar a unidade de medida.'
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
        <Ruler
          size={24}
          className="page-title-icon"
        />

        <h1 className="page-title">
          {isEdit
            ? 'Editar Unidade de Medida'
            : 'Nova Unidade de Medida'}
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
            Dados da Unidade
          </h2>

          <div className="form-group">

            <label>
              Nome da Unidade *
            </label>

            <input
              type="text"
              value={form.nomeUnidade}
              onChange={e =>
                setForm({
                  ...form,
                  nomeUnidade: e.target.value
                })
              }
            />

          </div>

          <div className="form-group">

            <label>
              Sigla
            </label>

            <input
              type="text"
              value={form.sigla ?? ''}
              maxLength={10}
              onChange={e =>
                setForm({
                  ...form,
                  sigla: e.target.value.toUpperCase()
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
            onClick={() => navigate('/unidades')}
          >
            Cancelar
          </button>

        </div>

      </form>

    </div>

  </div>
);
}