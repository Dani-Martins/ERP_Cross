import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { EstadoService } from '../services/estadoService';
import type { EstadoCreate } from '../types/entities';
import PaisLookupModal from './PaisLookupModal';
import '../pages/PaisesPage.css';

interface Props {
  onCreated: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function EstadoCreateModal({ onCreated, onClose, zBase = 1100 }: Props) {
  const [form, setForm] = useState<EstadoCreate>({ nomeEstado: '', uf: '', idPais: 0, ativo: true });
  const [nomePais, setNomePais] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPaisModal, setShowPaisModal] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomeEstado.trim()) { setError('Nome do estado é obrigatório.'); return; }
    if (!form.uf.trim()) { setError('UF é obrigatória.'); return; }
    if (!form.idPais) { setError('País é obrigatório.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await EstadoService.create(form);
      onCreated(res.data.id, res.data.nomeEstado);
    } catch {
      setError('Erro ao salvar. Verifique os dados e tente novamente.');
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="modal-overlay"
        style={{ zIndex: zBase }}
        onClick={onClose}
      >
        <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Novo Estado</h2>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <form onSubmit={handleSave}>
            <div className="modal-form">
              <div className="form-group">
                <label>Nome do Estado *</label>
                <input
                  type="text"
                  placeholder="Ex: SÃO PAULO"
                  value={form.nomeEstado}
                  onChange={e => setForm({ ...form, nomeEstado: e.target.value.toUpperCase() })}
                  autoFocus
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>UF *</label>
                  <input
                    type="text"
                    placeholder="Ex: SP"
                    maxLength={2}
                    value={form.uf}
                    onChange={e => setForm({ ...form, uf: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label>País *</label>
                  <div className="lookup-field">
                    <input
                      type="text"
                      readOnly
                      placeholder="Selecione um país..."
                      value={nomePais}
                      className="lookup-input"
                    />
                    <button
                      type="button"
                      className="btn-lookup"
                      onClick={() => setShowPaisModal(true)}
                      title="Pesquisar país"
                    >
                      <Search size={16} />
                    </button>
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
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
      {showPaisModal && (
        <PaisLookupModal
          zBase={zBase + 100}
          onSelect={(paisId, paisNome) => {
            setForm(prev => ({ ...prev, idPais: paisId }));
            setNomePais(paisNome);
            setShowPaisModal(false);
          }}
          onClose={() => setShowPaisModal(false)}
        />
      )}
    </>
  );
}
