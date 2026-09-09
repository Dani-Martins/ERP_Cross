import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Briefcase } from 'lucide-react';
import { CargoService } from '../services/cargoService';
import type { CargoCreate } from '../types/entities';
import CurrencyInput from '../components/CurrencyInput';
import './PaisesPage.css';

const EMPTY: CargoCreate = {
  nomeCargo: '',
  setor: '',
  salarioBase: 0,
  exigeCnh: false,
  ativo: true,
};

export default function CargoFormPage() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] = useState<CargoCreate>(EMPTY);

  const [nextId, setNextId] = useState<string>('');

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      CargoService.getById(Number(id))
        .then(res => {
          setForm({
            nomeCargo: res.data.nomeCargo,
            setor: res.data.setor ?? '',
            salarioBase: res.data.salarioBase,
            exigeCnh: res.data.exigeCnh,
            ativo: res.data.ativo,
          });
          setNextId(String(res.data.id));
        })
        .catch(() => navigate('/cargos'))
        .finally(() => setLoading(false));
    } else {
      CargoService.getAll()
        .then((res) => {
          const maxId = res.data.length > 0 ? Math.max(...res.data.map(c => c.id)) : 0;
          setNextId(String(maxId + 1));
        })
        .catch(() => setNextId(''))
        .finally(() => setLoading(false));
    }

  }, [id, isEdit, navigate]);

  async function handleSave(e: React.FormEvent) {

    e.preventDefault();

    if (!form.nomeCargo.trim()) {
      setError('Nome do cargo é obrigatório.');
      return;
    }

    if (!form.setor?.trim()) {
      setError('Setor é obrigatório.');
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

            <div className="form-group id-field">
              <label htmlFor="id">Código</label>
              <input id="id" type="text" readOnly value={nextId} />
            </div>

            <div className="form-group">
              <label htmlFor="nomeCargo">Cargo *</label>
              <input
                id="nomeCargo"
                type="text"
                placeholder="Ex: GERENTE DE VENDAS"
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
              <label htmlFor="setor">Setor *</label>
              <input
                id="setor"
                type="text"
                placeholder="Ex: VENDAS, FINANCEIRO, TI..."
                value={form.setor ?? ''}
                onChange={e =>
                  setForm({
                    ...form,
                    setor: e.target.value.toUpperCase()
                  })
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salarioBase">Salário Base *</label>
                <CurrencyInput
                  id="salarioBase"
                  value={form.salarioBase}
                  onChange={value =>
                    setForm({
                      ...form,
                      salarioBase: value
                    })
                  }
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="form-group">
                <label htmlFor="exigeCnh">&nbsp;</label>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, cursor: 'pointer' }}>
                    <input
                      id="exigeCnh"
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