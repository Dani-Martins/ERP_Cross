import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Search } from 'lucide-react';
import type { AxiosError } from 'axios';

import { NotaVendaService } from '../services/notaVendaService';
import type { NotaVendaCreate } from '../types/entities';

import { ClienteService } from '../services/clienteService';
import type { ClienteView } from '../types/entities';

import CondicaoPagamentoLookupModal from '../components/CondicaoPagamentoLookupModal';

import './PaisesPage.css';

function toInputDate(value: string | null | undefined): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (value.includes('T')) return value.split('T')[0];

  const d = new Date(value);
  if (isNaN(d.getTime())) return '';

  return d.toISOString().split('T')[0];
}

const EMPTY: NotaVendaCreate = {
  numeroNota: '',
  modelo: '',
  serie: '',
  clienteId: 0,
  dataEmissao: new Date().toISOString().split('T')[0],
  transportadoraId: undefined,
  placaVeiculo: '',
  tipoFrete: 'CIF',
  valorFrete: 0,
  desconto: 0,
  totalProdutos: 0,
  condicaoPagamentoId: undefined,
  observacao: '',
  status: 'ABERTA',
  ativo: true,
};

export default function NotaVendaFormPage() {
  const { numeroNota, modelo, serie, clienteId } = useParams();

  const navigate = useNavigate();

  const isEdit =
    !!numeroNota &&
    !!modelo &&
    !!serie &&
    !!clienteId;

  const [form, setForm] = useState<NotaVendaCreate>(EMPTY);

  const [nomeCondicao, setNomeCondicao] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showCondicaoModal, setShowCondicaoModal] = useState(false);

  const [clientes, setClientes] = useState<ClienteView[]>([]);

  useEffect(() => {
    ClienteService.getAll().then(r => setClientes(r.data.filter(c => c.ativo))
    );

    if (!isEdit) {
      setLoading(false);
      return;
    }

    NotaVendaService.getByKey(
      numeroNota!,
      modelo!,
      serie!,
      Number(clienteId)
    )
      .then(res => {
        const n = res.data;

        setForm({
          numeroNota: n.numeroNota,
          modelo: n.modelo,
          serie: n.serie,
          clienteId: n.clienteId,
          dataEmissao: toInputDate(n.dataEmissao),
          transportadoraId: n.transportadoraId,
          placaVeiculo: n.placaVeiculo ?? '',
          tipoFrete: n.tipoFrete,
          valorFrete: n.valorFrete,
          desconto: n.desconto,
          totalProdutos: n.totalProdutos,
          condicaoPagamentoId: n.condicaoPagamentoId,
          observacao: n.observacao ?? '',
          status: n.status ?? '',
          ativo: n.ativo,
        });

        setNomeCondicao(n.nomeCondicaoPagamento ?? '');
      })
      .catch(() => navigate('/notas-venda'))
      .finally(() => setLoading(false));

  }, [numeroNota, modelo, serie, clienteId, isEdit, navigate]);
    async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!form.numeroNota.trim()) {
      setError('Número da nota é obrigatório.');
      return;
    }

    if (!form.modelo.trim()) {
      setError('Modelo é obrigatório.');
      return;
    }

    if (!form.serie.trim()) {
      setError('Série é obrigatória.');
      return;
    }

    if (!form.clienteId) {
      setError('Cliente é obrigatório.');
      return;
    }

    if (!form.dataEmissao) {
      setError('Data de emissão é obrigatória.');
      return;
    }

    if (!form.condicaoPagamentoId) {
      setError('Condição de pagamento é obrigatória.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEdit) {
        await NotaVendaService.update(
          numeroNota!,
          modelo!,
          serie!,
          Number(clienteId),
          form
        );
      } else {
        await NotaVendaService.create(form);
      }

      navigate('/notas-venda');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;

      if (axiosErr.response?.status === 409) {
        setError(
          axiosErr.response.data?.message ??
          'Já existe uma nota com esses dados.'
        );
      } else {
        setError('Erro ao salvar a nota de venda.');
      }

      setSaving(false);
    }
  }

  const totalPagar =
    Number(form.totalProdutos) +
    Number(form.valorFrete) -
    Number(form.desconto);

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
    <>
      <div className="page-container">

        <div className="page-header">
          <div className="page-title-area">
            <FileText size={24} className="page-title-icon" />
            <h1 className="page-title">
              {isEdit ? 'Editar Nota de Venda' : 'Nova Nota de Venda'}
            </h1>
          </div>
        </div>

        <div className="form-card">
          <form onSubmit={handleSave} className="form-page">

            {/* Dados da Nota */}
              <h2 className="form-section-title">Dados da Nota</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Número da Nota *</label>
                  <input
                    type="text"
                    value={form.numeroNota}
                    disabled={isEdit}
                    onChange={e =>
                      setForm({
                        ...form,
                        numeroNota: e.target.value.toUpperCase()
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Modelo *</label>
                  <input
                    type="text"
                    value={form.modelo}
                    disabled={isEdit}
                    onChange={e =>
                      setForm({
                        ...form,
                        modelo: e.target.value.toUpperCase()
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Série *</label>
                  <input
                    type="text"
                    value={form.serie}
                    disabled={isEdit}
                    onChange={e =>
                      setForm({
                        ...form,
                        serie: e.target.value.toUpperCase()
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Data de Emissão *</label>
                  <input
                    type="date"
                    value={form.dataEmissao}
                    onChange={e =>
                      setForm({
                        ...form,
                        dataEmissao: e.target.value
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Frete</label>
                  <select
                    value={form.tipoFrete}
                    onChange={e =>
                      setForm({
                        ...form,
                        tipoFrete: e.target.value
                      })
                    }
                  >
                    <option value="CIF">CIF</option>
                    <option value="FOB">FOB</option>
                    <option value="SEM FRETE">Sem Frete</option>
                  </select>
                </div>

              </div>
                          {/* Cliente e Pagamento */}
            <div className="form-section">
              <h2 className="form-section-title">Cliente e Pagamento</h2>

              <div className="form-group">
                <label>Cliente *</label>

                <select
                    value={form.clienteId}
                    onChange={e =>
                    setForm({
                        ...form,
                        clienteId: Number(e.target.value)
                    })
                    }
                >
                    <option value={0}>Selecione...</option>

                    {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                    </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Condição de Pagamento *</label>

                <div className="lookup-field">
                  <input
                    type="text"
                    value={nomeCondicao}
                    placeholder="Selecione uma condição..."
                    readOnly
                  />

                  <button
                    type="button"
                    className="btn-search"
                    onClick={() => setShowCondicaoModal(true)}
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Valores */}
            <div className="form-section">
              <h2 className="form-section-title">Valores</h2>

              <div className="form-row">

                <div className="form-group">
                  <label>Total dos Produtos</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.totalProdutos}
                    onChange={e =>
                      setForm({
                        ...form,
                        totalProdutos: Number(e.target.value)
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Valor do Frete</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valorFrete}
                    onChange={e =>
                      setForm({
                        ...form,
                        valorFrete: Number(e.target.value)
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Desconto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.desconto}
                    onChange={e =>
                      setForm({
                        ...form,
                        desconto: Number(e.target.value)
                      })
                    }
                  />
                </div>

              </div>

              <div className="form-group">
                <label>Total a Pagar</label>
                <input
                  type="text"
                  readOnly
                  value={totalPagar.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                />
              </div>
            </div>
                        {/* Observações */}
            <div className="form-section">
              <h2 className="form-section-title">Informações Adicionais</h2>

              <div className="form-group">
                <label>Observação</label>
                <textarea
                  rows={4}
                  value={form.observacao ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      observacao: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={form.status ?? ''}
                    onChange={e =>
                      setForm({
                        ...form,
                        status: e.target.value
                      })
                    }
                  >
                    <option value="ABERTA">Aberta</option>
                    <option value="FATURADA">Faturada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>

                <div className="form-group checkbox-group">
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
                <div className="form-error">
                  {error}
                </div>
              )}
            </div>

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
                onClick={() => navigate('/notas-venda')}
              >
                Cancelar
              </button>
            </div>

          </form>
        </div>
      </div>
      
      {showCondicaoModal && (
        <CondicaoPagamentoLookupModal
          onClose={() => setShowCondicaoModal(false)}
          onSelect={(id, nome) => {
            setForm({
              ...form,
              condicaoPagamentoId: id
            });
            setNomeCondicao(nome);
            setShowCondicaoModal(false);
          }}
        />
      )}
    </>
  );
}