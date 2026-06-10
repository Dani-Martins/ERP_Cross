import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { CidadeService } from '../services/cidadeService';
import type { CidadeCreate } from '../types/entities';
import EstadoLookupModal from './EstadoLookupModal';
import '../pages/PaisesPage.css';

interface Props {
  onCreated: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function CidadeCreateModal({ onCreated, onClose, zBase = 1100 }: Props) {
  const [form, setForm] = useState<CidadeCreate>({ nomeCidade: '', ddd: '', idEstado: 0, ativo: true });
  const [nomeEstado, setNomeEstado] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showEstadoModal, setShowEstadoModal] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomeCidade.trim()) { setError('Nome da cidade é obrigatório.'); return; }
    if (!form.ddd.trim()) { setError('DDD é obrigatório.'); return; }
    if (!form.idEstado) { setError('Estado é obrigatório.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await CidadeService.create(form);
      onCreated(res.data.id, res.data.nomeCidade);
    } catch {
      setError('Erro ao salvar. Verifique os dados e tente novamente.');
      setSaving(false);
    }
  }

  return (
    <>
      <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
        <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Nova Cidade</h2>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <form onSubmit={handleSave}>
            <div className="modal-form">
              <div className="form-group">
                <label>Nome da Cidade *</label>
                <input
                  type="text"
                  placeholder="Ex: SÃO PAULO"
                  value={form.nomeCidade}
                  onChange={e => setForm({ ...form, nomeCidade: e.target.value.toUpperCase() })}
                  autoFocus
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>DDD *</label>
                  <input
                    type="text"
                    placeholder="Ex: 11"
                    maxLength={3}
                    value={form.ddd}
                    onChange={e => setForm({ ...form, ddd: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                <div className="form-group">
                  <label>Estado *</label>
                  <div className="lookup-field">
                    <input
                      type="text"
                      readOnly
                      placeholder="Selecione um estado..."
                      value={nomeEstado}
                      className="lookup-input"
                    />
                    <button
                      type="button"
                      className="btn-lookup"
                      onClick={() => setShowEstadoModal(true)}
                      title="Pesquisar estado"
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
      {showEstadoModal && (
        <EstadoLookupModal
          zBase={zBase + 100}
          onSelect={(estadoId, estadoNome) => {
            setForm(prev => ({ ...prev, idEstado: estadoId }));
            setNomeEstado(estadoNome);
            setShowEstadoModal(false);
          }}
          onClose={() => setShowEstadoModal(false)}
        />
      )}
    </>
  );
}
