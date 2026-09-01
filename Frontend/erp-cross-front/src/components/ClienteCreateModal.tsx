import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { ClienteService } from '../services/clienteService';
import type { ClienteCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import CidadeLookupModal from './CidadeLookupModal';
import '../pages/PaisesPage.css';

interface Props {
  onCreated: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

export default function ClienteCreateModal({ onCreated, onClose, zBase = 1100 }: Props) {
  const [form, setForm] = useState<ClienteCreate>({
    nome: '', cpfCnpj: '', pf: true, idCidade: 0, limiteCredito: 0, funcionalKids: false,
    nomeFantasia: '', rgIe: '', contato2: '', celular: '', email: '', cep: '', endereco: '', numero: '', complemento: '', bairro: '',
    dataNascimento: '', sexo: '', nomeResponsavel: '', cpfResponsavel: '', parentescoResponsavel: '', observacao: '', ativo: true,
  });
  const [nomeCidade, setNomeCidade] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCidadeModal, setShowCidadeModal] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return; }
    if (!form.cpfCnpj.trim()) { setError('CPF/CNPJ é obrigatório.'); return; }
    if (!form.idCidade) { setError('Cidade é obrigatória.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await ClienteService.create(form);
      onCreated(res.data.id, res.data.nome);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Cliente já cadastrado.');
      } else {
        setError('Erro ao salvar. Verifique os dados e tente novamente.');
      }
      setSaving(false);
    }
  }

  return (
    <>
      <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
        <div className="modal modal-md" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Novo Cliente</h2>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <form onSubmit={handleSave}>
            <div className="modal-form">
              <div className="form-group">
                <label>
                  <input type="radio" checked={form.pf} onChange={() => setForm({ ...form, pf: true })} />
                  Pessoa Física
                </label>
                <label>
                  <input type="radio" checked={!form.pf} onChange={() => setForm({ ...form, pf: false })} />
                  Pessoa Jurídica
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="nome">Nome/Razão Social *</label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Ex: João Silva"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="cpfCnpj">{form.pf ? 'CPF' : 'CNPJ'} *</label>
                <input
                  id="cpfCnpj"
                  type="text"
                  placeholder={form.pf ? 'Ex: 123.456.789-00' : 'Ex: 12.345.678/0001-99'}
                  value={form.cpfCnpj}
                  onChange={e => setForm({ ...form, cpfCnpj: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Cidade *</label>
                <div className="lookup-field">
                  <input
                    type="text"
                    readOnly
                    placeholder="Selecione uma cidade..."
                    value={nomeCidade}
                    className="lookup-input"
                  />
                  <button
                    type="button"
                    className="btn-lookup"
                    onClick={() => setShowCidadeModal(true)}
                    title="Pesquisar cidade"
                  >
                    <Search size={16} />
                  </button>
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
      {showCidadeModal && (
        <CidadeLookupModal
          onSelect={(cidadeId, cidadeNome) => {
            setForm(prev => ({ ...prev, idCidade: cidadeId }));
            setNomeCidade(cidadeNome);
            setShowCidadeModal(false);
          }}
          onClose={() => setShowCidadeModal(false)}
          zBase={zBase + 100}
        />
      )}
    </>
  );
}
