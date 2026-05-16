import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { PaisService } from '../services/paisService';
import type { PaisCreate } from '../types/entities';
import './PaisesPage.css';

const EMPTY_FORM: PaisCreate = { nomePais: '', sigla: '', ddi: '', ativo: true };

export default function PaisFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<PaisCreate>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    PaisService.getById(Number(id))
      .then((res) => {
        const p = res.data;
        setForm({ nomePais: p.nomePais, sigla: p.sigla, ddi: p.ddi, ativo: p.ativo });
      })
      .catch(() => navigate('/paises'))
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomePais.trim()) { setError('Nome do país é obrigatório.'); return; }
    if (!form.sigla.trim()) { setError('Sigla é obrigatória.'); return; }
    if (!form.ddi.trim()) { setError('DDI é obrigatório.'); return; }

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await PaisService.update(Number(id), form);
      } else {
        await PaisService.create(form);
      }
      navigate('/paises');
    } catch {
      setError('Erro ao salvar. Verifique os dados e tente novamente.');
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
    <div className="page-container">
      {/* Cabeçalho */}
      <div className="page-header">
        <div className="page-title-area">
          <Globe size={24} className="page-title-icon" />
          <h1 className="page-title">{isEdit ? 'Editar País' : 'Novo País'}</h1>
        </div>
      </div>

      {/* Formulário */}
      <div className="form-card">
        <form onSubmit={handleSave} className="form-page">
          <div className="form-section">
            <h2 className="form-section-title">Dados do País</h2>

            <div className="form-group">
              <label htmlFor="nomePais">Nome do País *</label>
              <input
                id="nomePais"
                type="text"
                placeholder="Ex: BRASIL"
                value={form.nomePais}
                onChange={(e) => setForm({ ...form, nomePais: e.target.value.toUpperCase() })}
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sigla">Sigla *</label>
                <input
                  id="sigla"
                  type="text"
                  placeholder="Ex: BR"
                  maxLength={2}
                  value={form.sigla}
                  onChange={(e) => setForm({ ...form, sigla: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ddi">DDI *</label>
                <input
                  id="ddi"
                  type="text"
                  placeholder="Ex: 55"
                  maxLength={3}
                  value={form.ddi}
                  onChange={(e) => setForm({ ...form, ddi: e.target.value.replace(/\D/g, '') })}
                />
              </div>
            </div>

            <div className="form-group form-check">
              <label>
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                />
                Ativo
              </label>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-page-footer">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/paises')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
