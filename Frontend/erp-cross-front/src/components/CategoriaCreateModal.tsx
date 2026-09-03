import { useState } from 'react';
import { X } from 'lucide-react';
import { CategoriaService } from '../services/categoriaService';
import type { CategoriaCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import '../pages/PaisesPage.css';

interface Props {
  onCreated: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function CategoriaCreateModal({ onCreated, onClose, zBase = 1100 }: Props) {
  const [form, setForm] = useState<CategoriaCreate>({ nomeCategoria: '', descricao: '', ativo: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomeCategoria.trim()) { setError('Nome da categoria é obrigatório.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await CategoriaService.create(form);
      onCreated(res.data.id, res.data.nomeCategoria);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Categoria já cadastrada.');
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
          <h2>Nova Categoria</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-form">
            <div className="form-group">
              <label htmlFor="nomeCategoria">Categoria *</label>
              <input
                id="nomeCategoria"
                type="text"
                placeholder="Ex: Eletrônicos"
                value={form.nomeCategoria}
                onChange={e => setForm({ ...form, nomeCategoria: e.target.value.toUpperCase() })}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                placeholder="Descreva a categoria..."
                rows={3}
                value={form.descricao ?? ''}
                onChange={e => setForm({ ...form, descricao: e.target.value.toUpperCase() })}
                style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 'inherit', width: '100%' }}
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
