import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { VeiculoService } from '../services/veiculoService';
import type { VeiculoCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import '../pages/PaisesPage.css';

interface Props {
  onCreated: (id: number, placa: string, modelo: string, marca: string, ano: number | null) => void;
  onClose: () => void;
  defaultTransportadoraId?: number;
  zBase?: number;
}

export default function VeiculoCreateModal({ onCreated, onClose, defaultTransportadoraId = 0, zBase = 1100 }: Props) {
  const [form, setForm] = useState<VeiculoCreate>({
    placa: '',
    modelo: '',
    marca: '',
    ano: new Date().getFullYear(),
    descricao: '',
    transportadoraId: defaultTransportadoraId,
    ativo: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [nextId, setNextId] = useState('1');

  useEffect(() => {
    VeiculoService.getAll()
      .then(res => {
        const maxId = res.data.length > 0
          ? Math.max(...res.data.map((v: any) => v.id))
          : 0;
        setNextId(String(maxId + 1));
      })
      .catch(() => setNextId('1'));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.placa.trim()) { setError('Placa é obrigatória.'); return; }
    if (!form.modelo.trim()) { setError('Modelo é obrigatório.'); return; }
    if (!form.marca.trim()) { setError('Marca é obrigatória.'); return; }
    if (!form.ano || form.ano < 1900 || form.ano > new Date().getFullYear() + 1) { 
      setError('Ano deve estar entre 1900 e ' + (new Date().getFullYear() + 1) + '.'); 
      return; 
    }
    if (!form.transportadoraId) {
      setError('Transportadora é obrigatória.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await VeiculoService.create(form);
      onCreated(res.data.id, res.data.placa, res.data.modelo, res.data.marca, res.data.ano);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Veículo já cadastrado.');
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
          <h2>Novo Veículo</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-form">
            <div className="form-group">
              <label htmlFor="id">Código *</label>
              <input
                id="id"
                type="text"
                readOnly
                value={nextId}
                style={{
                  width: '120px',
                  padding: '6px',
                  fontSize: '0.8rem',
                  textAlign: 'center'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="placa">Placa *</label>
              <input
                id="placa"
                type="text"
                placeholder="Ex: ABC-1234"
                maxLength={8}
                value={form.placa}
                onChange={e => setForm({ ...form, placa: e.target.value.toUpperCase() })}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="modelo">Modelo *</label>
              <input
                id="modelo"
                type="text"
                placeholder="Ex: Volvo FH"
                value={form.modelo}
                onChange={e => setForm({ ...form, modelo: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="marca">Marca *</label>
              <input
                id="marca"
                type="text"
                placeholder="Ex: Volvo"
                value={form.marca}
                onChange={e => setForm({ ...form, marca: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ano">Ano *</label>
              <input
                id="ano"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={form.ano}
                onChange={e => setForm({ ...form, ano: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                placeholder="Descreva o veículo..."
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
