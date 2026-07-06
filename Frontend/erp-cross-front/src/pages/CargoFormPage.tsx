import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

import { CargoService } from '../services/cargoService';
import type { CargoCreate } from '../types/entities';
import type { AxiosError } from 'axios';

import './PaisesPage.css';

const EMPTY: CargoCreate = {
  nomeCargo: '',
  descricao: '',
  salarioBase: 0,
  exigeCnh: false,
  ativo: true,
};

export default function CargoFormPage() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] = useState<CargoCreate>(EMPTY);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    CargoService.getById(Number(id))
      .then(res => {
        setForm({
          nomeCargo: res.data.nomeCargo,
          descricao: res.data.descricao ?? '',
          salarioBase: res.data.salarioBase,
          exigeCnh: res.data.exigeCnh,
          ativo: res.data.ativo,
        });
      })
      .catch(() => navigate('/cargos'))
      .finally(() => setLoading(false));

  }, [id, isEdit, navigate]);

  async function handleSave(e: React.FormEvent) {

    e.preventDefault();

    if (!form.nomeCargo.trim()) {
      setError('Nome do cargo é obrigatório.');
      return;
    }

    if (form.salarioBase < 0) {
      setError('Salário inválido.');
      return;
    }

    setSaving(true);
    setError('');

    try {

      if (isEdit) {
        await CargoService.update(Number(id), form);
      } else {
        await CargoService.create(form);
      }

      navigate('/cargos');

    } catch (err) {

      const axiosErr = err as AxiosError<{ message: string }>;

      if (axiosErr.response?.status === 409) {
        setError(
          axiosErr.response.data?.message ??
          'Já existe um cargo com esse nome.'
        );
      } else {
        setError('Erro ao salvar cargo.');
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
          <Briefcase size={24} className="page-title-icon" />
          <h1 className="page-title">
            {isEdit ? 'Editar Cargo' : 'Novo Cargo'}
          </h1>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSave} className="form-page">

          <div className="form-section">
            <h2 className="form-section-title">
              Dados do Cargo
            </h2>

            <div className="form-group">
              <label>Nome do Cargo *</label>
              <input
                type="text"
                placeholder="Ex: PROFESSOR"
                value={form.nomeCargo}
                onChange={e =>
                  setForm({
                    ...form,
                    nomeCargo: e.target.value.toUpperCase()
                  })
                }
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                rows={4}
                placeholder="Descrição do cargo..."
                value={form.descricao ?? ''}
                onChange={e =>
                  setForm({
                    ...form,
                    descricao: e.target.value
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
                <label>Salário Base *</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.salarioBase}
                  onChange={e =>
                    setForm({
                      ...form,
                      salarioBase: Number(e.target.value)
                    })
                  }
                />
              </div>
                            <div className="form-group form-check">
                <label>
                  <input
                    type="checkbox"
                    checked={form.exigeCnh}
                    onChange={e =>
                      setForm({
                        ...form,
                        exigeCnh: e.target.checked
                      })
                    }
                  />
                  Exige CNH
                </label>
              </div>
            </div>

            <div className="form-group form-check">
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
              onClick={() => navigate('/cargos')}
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}