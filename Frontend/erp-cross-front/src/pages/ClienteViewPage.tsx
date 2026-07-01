import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserCircle, Pencil } from 'lucide-react';
import { ClienteService } from '../services/clienteService';
import type { ClienteView } from '../types/entities';
import './PaisesPage.css';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const parts = value.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  }
  const d = new Date(value.replace(' ', 'T'));
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR');
}

const SEXO: Record<string, string> = { M: 'Masculino', F: 'Feminino', O: 'Outro' };
const PARENTESCO: Record<string, string> = {
  PAI: 'Pai', MAE: 'Mãe', AVO: 'Avô', AVO_F: 'Avó',
  TIO: 'Tio', TIA: 'Tia', IRMAO: 'Irmão', IRMA: 'Irmã',
  RESPONSAVEL_LEGAL: 'Responsável Legal', OUTRO: 'Outro',
};

export default function ClienteViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState<ClienteView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ClienteService.getById(Number(id))
      .then(res => setCliente(res.data))
      .catch(() => navigate('/clientes'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="page-container"><div className="table-loading">Carregando...</div></div>;
  if (!cliente) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <UserCircle size={24} className="page-title-icon" />
          <h1 className="page-title">Visualizar Cliente</h1>
        </div>
      </div>

      <div className="form-card">
        <div className="form-page">

          {/* Dados Principais */}
          <div className="form-section">
            <h2 className="form-section-title">Dados Principais</h2>
            <div className="view-group">
              <span className="view-label">Tipo de Pessoa</span>
              <span className="view-value">{cliente.pf ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>
            </div>
            <div className="view-group">
              <span className="view-label">{cliente.pf ? 'Nome Completo' : 'Razão Social'}</span>
              <span className="view-value">{cliente.nome}</span>
            </div>
            {!cliente.pf && cliente.nomeFantasia && (
              <div className="view-group">
                <span className="view-label">Nome Fantasia</span>
                <span className="view-value">{cliente.nomeFantasia}</span>
              </div>
            )}
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">{cliente.pf ? 'CPF' : 'CNPJ'}</span>
                <span className="view-value">{cliente.cpfCnpj || '—'}</span>
              </div>
              <div className="view-group">
                <span className="view-label">{cliente.pf ? 'RG' : 'Inscrição Estadual'}</span>
                <span className="view-value">{cliente.rgIe || '—'}</span>
              </div>
            </div>
            {cliente.pf && (
              <div className="form-row">
                <div className="view-group">
                  <span className="view-label">Data de Nascimento</span>
                  <span className="view-value">{formatDate(cliente.dataNascimento)}</span>
                </div>
                <div className="view-group">
                  <span className="view-label">Sexo</span>
                  <span className="view-value">{SEXO[cliente.sexo ?? ''] ?? '—'}</span>
                </div>
              </div>
            )}
            {cliente.pf && cliente.funcionalKids && (
              <div className="form-group" style={{ marginTop: 4 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#FFF8E1', color: '#D4A017',
                  border: '1px solid #D4A017', borderRadius: 6,
                  padding: '4px 12px', fontSize: '0.82rem', fontWeight: 700
                }}>
                  ⭐ Aluno de Funcional Kids
                </span>
              </div>
            )}
          </div>

          {/* Dados do Responsável */}
          {cliente.pf && (cliente.nomeResponsavel || cliente.cpfResponsavel) && (
            <div className="form-section">
              <h2 className="form-section-title">Dados do Responsável</h2>
              <div className="view-group">
                <span className="view-label">Nome do Responsável</span>
                <span className="view-value">{cliente.nomeResponsavel || '—'}</span>
              </div>
              <div className="form-row">
                <div className="view-group">
                  <span className="view-label">Parentesco</span>
                  <span className="view-value">{PARENTESCO[cliente.parentescoResponsavel ?? ''] ?? cliente.parentescoResponsavel ?? '—'}</span>
                </div>
                <div className="view-group">
                  <span className="view-label">CPF do Responsável</span>
                  <span className="view-value">{cliente.cpfResponsavel || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Contato */}
          <div className="form-section">
            <h2 className="form-section-title">{cliente.nomeResponsavel ? 'Contato do Responsável' : 'Contato'}</h2>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">{cliente.nomeResponsavel ? 'Celular do Responsável' : 'Celular'}</span>
                <span className="view-value">{cliente.celular || '—'}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Telefone / Contato 2</span>
                <span className="view-value">{cliente.contato2 || '—'}</span>
              </div>
            </div>
            <div className="view-group">
              <span className="view-label">{cliente.nomeResponsavel ? 'E-mail do Responsável' : 'E-mail'}</span>
              <span className="view-value">{cliente.email || '—'}</span>
            </div>
          </div>

          {/* Endereço */}
          <div className="form-section">
            <h2 className="form-section-title">Endereço</h2>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">CEP</span>
                <span className="view-value">{cliente.cep || '—'}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Bairro</span>
                <span className="view-value">{cliente.bairro || '—'}</span>
              </div>
            </div>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Logradouro</span>
                <span className="view-value">{cliente.endereco || '—'}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Número</span>
                <span className="view-value">{cliente.numero || '—'}</span>
              </div>
            </div>
            {cliente.complemento && (
              <div className="view-group">
                <span className="view-label">Complemento</span>
                <span className="view-value">{cliente.complemento}</span>
              </div>
            )}
            <div className="view-group">
              <span className="view-label">Cidade</span>
              <span className="view-value">{cliente.nomeCidade || '—'}</span>
            </div>
          </div>

          {/* Dados Comerciais */}
          <div className="form-section">
            <h2 className="form-section-title">Dados Comerciais</h2>
            <div className="view-group">
              <span className="view-label">Condição de Pagamento</span>
              <span className="view-value">{cliente.nomeCondicaoPagamento || '—'}</span>
            </div>
            {cliente.observacao && (
              <div className="view-group">
                <span className="view-label">Observação</span>
                <span className="view-value" style={{ whiteSpace: 'pre-wrap' }}>{cliente.observacao}</span>
              </div>
            )}
            <div className="view-group">
              <span className="view-label">Status</span>
              <span className={`status-badge ${cliente.ativo ? 'status-active' : 'status-inactive'}`}>
                {cliente.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Datas */}
          <div className="form-section view-dates">
            <h2 className="form-section-title">Informações do Sistema</h2>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Criado em</span>
                <span className="view-value view-muted">{formatDate(cliente.dataCriacao)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Atualizado em</span>
                <span className="view-value view-muted">{formatDate(cliente.dataAtualizacao)}</span>
              </div>
            </div>
          </div>

          <div className="form-page-footer">
            <button className="btn-primary" onClick={() => navigate(`/clientes/editar/${cliente.id}`)}>
              <Pencil size={15} /> Editar
            </button>
            <button className="btn-secondary" onClick={() => navigate('/clientes')}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
