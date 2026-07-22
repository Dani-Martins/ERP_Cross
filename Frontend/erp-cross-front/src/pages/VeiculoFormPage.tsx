import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Car } from 'lucide-react';

import { VeiculoService } from '../services/veiculoService';
import type {
  VeiculoCreate,
} from '../types/entities';

import './PaisesPage.css';

const EMPTY: VeiculoCreate = {
  placa: '',
  modelo: '',
  marca: '',
  ano: new Date().getFullYear(),
  descricao: '',
  ativo: true,
};

export default function VeiculoFormPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = !!id;

  const [form, setForm] =
    useState<VeiculoCreate>(EMPTY);

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

  VeiculoService.getById(Number(id))

    .then(res => {

      const v = res.data;

      setForm({

        placa: v.placa,
        modelo: v.modelo,
        marca: v.marca,
        ano: v.ano,
        descricao: v.descricao ?? '',
        ativo: v.ativo,

      });

    })

    .catch(() => navigate('/veiculos'))

    .finally(() => setLoading(false));

}, [id, isEdit, navigate]);
async function handleSave(
  e: React.FormEvent
) {

  e.preventDefault();

  if (!form.placa.trim()) {

    setError('A placa é obrigatória.');

    return;

  }

  if (!form.modelo.trim()) {

    setError('O modelo é obrigatório.');

    return;

  }

  if (!form.marca.trim()) {

    setError('A marca é obrigatória.');

    return;

  }

  setSaving(true);

  setError('');

  try {

    if (isEdit) {

      await VeiculoService.update(
        Number(id),
        form
      );

    } else {

      await VeiculoService.create(form);

    }

    navigate('/veiculos');

  } catch (err) {

    const axiosErr =
      err as AxiosError<{ message: string }>;

    setError(

      axiosErr.response?.data?.message ??

      'Erro ao salvar o veículo.'

    );

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

        <Car
          size={24}
          className="page-title-icon"
        />

        <h1 className="page-title">

          {isEdit
            ? 'Editar Veículo'
            : 'Novo Veículo'}

        </h1>

      </div>

    </div>

    <div className="form-card">

      <form
        onSubmit={handleSave}
        className="form-page"
      >

        {/* Dados do Veículo */}

        <div className="form-section">

          <h2 className="form-section-title">
            Dados do Veículo
          </h2>

          <div className="form-row">

            <div className="form-group">

              <label>Placa *</label>

              <input
                type="text"
                value={form.placa}
                maxLength={8}
                onChange={e =>
                  setForm({
                    ...form,
                    placa: e.target.value.toUpperCase()
                  })
                }
              />

            </div>

            <div className="form-group">

              <label>Ano</label>

              <input
                type="number"
                value={form.ano}
                onChange={e =>
                  setForm({
                    ...form,
                    ano: Number(e.target.value)
                  })
                }
              />

            </div>

          </div>

          <div className="form-row">

            <div className="form-group">

              <label>Modelo *</label>

              <input
                type="text"
                value={form.modelo}
                onChange={e =>
                  setForm({
                    ...form,
                    modelo: e.target.value
                  })
                }
              />

            </div>

            <div className="form-group">

              <label>Marca *</label>

              <input
                type="text"
                value={form.marca}
                onChange={e =>
                  setForm({
                    ...form,
                    marca: e.target.value
                  })
                }
              />

            </div>

          </div>

          <div className="form-group">

            <label>Descrição</label>

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

        </div>
                {/* Situação */}

        <div className="form-section">

          <h2 className="form-section-title">
            Situação
          </h2>

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

        </div>

        {error && (

          <div className="form-error">

            {error}

          </div>

        )}

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
            onClick={() => navigate('/veiculos')}
          >
            Cancelar
          </button>

        </div>

      </form>

    </div>

  </div>

);
}