import { useState } from 'react';
import { X } from 'lucide-react';
import { UnidadeMedidaService } from '../services/unidadeMedidaService';
import type { UnidadeMedidaCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import '../pages/PaisesPage.css';

interface Props {
  onCreated: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function UnidadeMedidaCreateModal({ onCreated, onClose, zBase = 1100 }: Props) {
  const [form, setForm] = useState<UnidadeMedidaCreate>({ nomeUnidade: '', sigla: '', ativo: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomeUnidade.trim()) { setError('Nome da unidade é obrigatório.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await UnidadeMedidaService.create(form);
      onCreated(res.data.id, res.data.nomeUnidade);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Unidade de medida já cadastrada.');
      } else {
        setError('Erro ao salvar. Verifique os dados e tente novamente.');
      }
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nova Unidade de Medida</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-form">
            <div className="form-group">
              <label htmlFor="nomeUnidade">Unidade *</label>
              <input
                id="nomeUnidade"
                type="text"
                placeholder="Ex: Quilograma"
                value={form.nomeUnidade}
                onChange={e => setForm({ ...form, nomeUnidade: e.target.value })}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="sigla">Sigla</label>
              <input
                id="sigla"
                type="text"
                placeholder="Ex: kg"
                value={form.sigla ?? ''}
                onChange={e => setForm({ ...form, sigla: e.target.value })}
              />
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
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
