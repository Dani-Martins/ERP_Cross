import { useState } from 'react';
import { X } from 'lucide-react';
import { PaisService } from '../services/paisService';
import type { PaisCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import '../pages/PaisesPage.css';

interface Props {
  onCreated: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function PaisCreateModal({ onCreated, onClose, zBase = 1100 }: Props) {
  const [form, setForm] = useState<PaisCreate>({ nomePais: '', sigla: '', ddi: '', ativo: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomePais.trim()) { setError('Nome do país é obrigatório.'); return; }
    if (!form.sigla.trim()) { setError('Sigla é obrigatória.'); return; }
    if (!form.ddi.trim()) { setError('DDI é obrigatório.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await PaisService.create(form);
      onCreated(res.data.id, res.data.nomePais);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Sigla já cadastrada para outro país.');
      } else {
        setError('Erro ao salvar. Verifique os dados e tente novamente.');
      }
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: zBase }}
      onClick={onClose}
    >
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Novo País</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-form">
            <div className="form-group">
              <label>Nome do País *</label>
              <input
                type="text"
                placeholder="Ex: BRASIL"
                value={form.nomePais}
                onChange={e => setForm({ ...form, nomePais: e.target.value.toUpperCase() })}
                autoFocus
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Sigla *</label>
                <input
                  type="text"
                  placeholder="Ex: BR"
                  maxLength={2}
                  value={form.sigla}
                  onChange={e => setForm({ ...form, sigla: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="form-group">
                <label>DDI *</label>
                <input
                  type="text"
                  placeholder="Ex: 55"
                  maxLength={3}
                  value={form.ddi}
                  onChange={e => setForm({ ...form, ddi: e.target.value.replace(/\D/g, '') })}
                />
              </div>
            </div>
            <div className="form-group form-check">
              <label>
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={e => setForm({ ...form, ativo: e.target.checked })}
                />
                Ativo
              </label>
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
