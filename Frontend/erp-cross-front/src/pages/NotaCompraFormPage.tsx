import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileDown, Search } from 'lucide-react';
import type { AxiosError } from 'axios';

import { NotaCompraService } from '../services/notaCompraService';
import { FornecedorService } from '../services/fornecedorService';
import type {
  NotaCompraCreate,
  FornecedorView
} from '../types/entities';

import CondicaoPagamentoLookupModal from '../components/CondicaoPagamentoLookupModal';

import './PaisesPage.css';

function toInputDate(value: string | null |undefined): string {
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(value))
    return value;

  if (value.includes('T'))
    return value.split('T')[0];

  const d = new Date(value);

  if (isNaN(d.getTime()))
    return '';

  return d.toISOString().split('T')[0];
}
const EMPTY: NotaCompraCreate = {
  fornecedorId: 0,

  numeroNota: '',
  modelo: '',
  serie: '',

  dataEmissao: new Date().toISOString().split('T')[0],

  chaveAcesso: '',

  tipoFrete: 'CIF',

  valorFrete: 0,
  valorSeguro: 0,
  outrasDespesas: 0,

  totalProdutos: 0,

  condicaoPagamentoId: undefined,

  transportadoraId: undefined,

  placaVeiculo: '',

  observacao: '',

  status: 'ABERTA',

  ativo: true,
};
export default function NotaCompraFormPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = !!id;

  const [form, setForm] =
    useState<NotaCompraCreate>(EMPTY);

  const [fornecedores, setFornecedores] =
    useState<FornecedorView[]>([]);

  const [nomeCondicao, setNomeCondicao] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [showCondicaoModal, setShowCondicaoModal] =
    useState(false);
      useEffect(() => {

    FornecedorService.getAll().then(r =>
      setFornecedores(
        r.data.filter(f => f.ativo)
      )
    );

    if (!isEdit) {
      setLoading(false);
      return;
    }

    NotaCompraService.getById(Number(id))
      .then(res => {

        const n = res.data;

        setForm({
          fornecedorId: n.fornecedorId,

          numeroNota: n.numeroNota,
          modelo: n.modelo,
          serie: n.serie,

          dataEmissao: toInputDate(n.dataEmissao),

          chaveAcesso: n.chaveAcesso ?? '',

          tipoFrete: n.tipoFrete,

          valorFrete: n.valorFrete,
          valorSeguro: n.valorSeguro,
          outrasDespesas: n.outrasDespesas,

          totalProdutos: n.totalProdutos,

          condicaoPagamentoId: n.condicaoPagamentoId,

          transportadoraId: n.transportadoraId,

          placaVeiculo: n.placaVeiculo ?? '',

          observacao: n.observacao ?? '',

          status: n.status ?? 'ABERTA',

          ativo: n.ativo,
        });

        setNomeCondicao(
          n.nomeCondicaoPagamento ?? ''
        );

      })
      .catch(() => navigate('/nota-compras'))
      .finally(() => setLoading(false));

  }, [id, isEdit, navigate]);
    async function handleSave(
    e: React.FormEvent
  ) {

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

    if (!form.fornecedorId) {
      setError('Fornecedor é obrigatório.');
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

        await NotaCompraService.update(
          Number(id),
          form
        );

      } else {

        await NotaCompraService.create(form);

      }

      navigate('/nota-compras');

    } catch (err) {

      const axiosErr =
        err as AxiosError<{ message: string }>;

      if (axiosErr.response?.status === 409) {

        setError(
          axiosErr.response.data?.message ??
          'Já existe uma nota com esses dados.'
        );

      } else {

        setError(
          'Erro ao salvar a nota de compra.'
        );

      }

      setSaving(false);

    }

  }

  const totalPagar =
    Number(form.totalProdutos) +
    Number(form.valorFrete) +
    Number(form.valorSeguro) +
    Number(form.outrasDespesas);

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
            <FileDown size={24} className="page-title-icon" />

            <h1 className="page-title">
              {isEdit
                ? 'Editar Nota de Compra'
                : 'Nova Nota de Compra'}
            </h1>
          </div>
        </div>

        <div className="form-card">

          <form
            onSubmit={handleSave}
            className="form-page"
          >

            {/* Dados da Nota */}
            <div className="form-section">

              <h2 className="form-section-title">
                Dados da Nota
              </h2>

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
                  <label>Chave de Acesso</label>

                  <input
                    type="text"
                    value={form.chaveAcesso ?? ''}
                    onChange={e =>
                      setForm({
                        ...form,
                        chaveAcesso: e.target.value
                      })
                    }
                  />
                </div>

              </div>

            </div>
                        {/* Fornecedor e Pagamento */}
            <div className="form-section">

              <h2 className="form-section-title">
                Fornecedor e Pagamento
              </h2>

              <div className="form-group">

                <label>Fornecedor *</label>

                <select
                  value={form.fornecedorId}
                  onChange={e =>
                    setForm({
                      ...form,
                      fornecedorId: Number(e.target.value)
                    })
                  }
                >
                  <option value={0}>
                    Selecione...
                  </option>

                  {fornecedores.map(fornecedor => (
                    <option
                      key={fornecedor.id}
                      value={fornecedor.id}
                    >
                      {fornecedor.nome}
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
                    onClick={() =>
                      setShowCondicaoModal(true)
                    }
                  >
                    <Search size={16} />
                  </button>

                </div>

              </div>

            </div>

            {/* Transporte */}
            <div className="form-section">

              <h2 className="form-section-title">
                Transporte
              </h2>

              <div className="form-row">

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
                    <option value="SEM FRETE">
                      Sem Frete
                    </option>
                  </select>

                </div>

                <div className="form-group">

                  <label>Placa do Veículo</label>

                  <input
                    type="text"
                    value={form.placaVeiculo ?? ''}
                    onChange={e =>
                      setForm({
                        ...form,
                        placaVeiculo: e.target.value.toUpperCase()
                      })
                    }
                  />

                </div>

              </div>

            </div>
                        {/* Valores */}
            <div className="form-section">

              <h2 className="form-section-title">
                Valores
              </h2>

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

              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Valor do Seguro</label>

                  <input
                    type="number"
                    step="0.01"
                    value={form.valorSeguro}
                    onChange={e =>
                      setForm({
                        ...form,
                        valorSeguro: Number(e.target.value)
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Outras Despesas</label>

                  <input
                    type="number"
                    step="0.01"
                    value={form.outrasDespesas}
                    onChange={e =>
                      setForm({
                        ...form,
                        outrasDespesas: Number(e.target.value)
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
                        {/* Informações Adicionais */}
            <div className="form-section">

              <h2 className="form-section-title">
                Informações Adicionais
              </h2>

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
                    <option value="ABERTA">
                      Aberta
                    </option>

                    <option value="FINALIZADA">
                      Finalizada
                    </option>

                    <option value="CANCELADA">
                      Cancelada
                    </option>
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
                {saving
                  ? 'Salvando...'
                  : 'Salvar'}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  navigate('/nota-compras')
                }
              >
                Cancelar
              </button>

            </div>

          </form>

        </div>

      </div>

      {showCondicaoModal && (
        <CondicaoPagamentoLookupModal
          onClose={() =>
            setShowCondicaoModal(false)
          }
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