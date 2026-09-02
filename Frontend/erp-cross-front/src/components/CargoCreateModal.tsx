import { useState } from 'react';
import { X } from 'lucide-react';
import { CargoService } from '../services/cargoService';
import type { CargoCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import CurrencyInput from './CurrencyInput';
import '../pages/PaisesPage.css';

interface Props {
  onCreated: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function CargoCreateModal({ onCreated, onClose, zBase = 1100 }: Props) {
  const [form, setForm] = useState<CargoCreate>({ nomeCargo: '', descricao: '', salarioBase: 0, exigeCnh: false, ativo: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomeCargo.trim()) { setError('Nome do cargo é obrigatório.'); return; }
    if (form.salarioBase < 0) { setError('Salário inválido.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await CargoService.create(form);
      onCreated(res.data.id, res.data.nomeCargo);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Já existe um cargo com esse nome.');
      } else {
        setError('Erro ao salvar cargo.');
      }
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Novo Cargo</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-form">
            <div className="form-group">
              <label htmlFor="nomeCargo">Cargo *</label>
              <input
                id="nomeCargo"
                type="text"
                placeholder="Ex: GERENTE DE VENDAS"
                value={form.nomeCargo}
                onChange={e => setForm({ ...form, nomeCargo: e.target.value.toUpperCase() })}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                placeholder="Descrição das responsabilidades do cargo..."
                rows={4}
                value={form.descricao ?? ''}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 'inherit', width: '100%' }}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salarioBase">Salário Base *</label>
                <CurrencyInput
                  value={form.salarioBase}
                  onChange={value => setForm({ ...form, salarioBase: value })}
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
                      onChange={e => setForm({ ...form, exigeCnh: e.target.checked })}
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
