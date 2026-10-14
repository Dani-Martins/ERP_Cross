#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class ContaReceberService
{
    private readonly ContaReceberRepository _repository;
    private readonly ClienteRepository _clienteRepository;
    private readonly ParcelaCondicaoPagamentoRepository _parcelaRepository;
    private readonly NotaVendaRepository _notasVenda;
    private readonly CondicaoPagamentoRepository _condicoesPagamento;

    public ContaReceberService(
        ContaReceberRepository repository,
        ClienteRepository clienteRepository,
        ParcelaCondicaoPagamentoRepository parcelaRepository,
        NotaVendaRepository notasVenda,
        CondicaoPagamentoRepository condicoesPagamento)
    {
        _repository = repository;
        _clienteRepository = clienteRepository;
        _parcelaRepository = parcelaRepository;
        _notasVenda = notasVenda;
        _condicoesPagamento = condicoesPagamento;
    }

    public async Task<IEnumerable<ContaReceber>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<ContaReceber?> GetByIdAsync(long id) => await _repository.GetByIdAsync(id);
    public async Task<long> GetProximoNumeroNotaAsync() => await _repository.GetProximoNumeroNotaAsync();

    public async Task<ContaReceber> CreateAsync(CreateContaReceberDto dto)
    {
        var existente = await _repository.GetByNotaAsync(dto.NumeroNota, dto.Modelo, dto.Serie, dto.ClienteId);
        if (existente.Any(c => c.NumParcela == dto.NumParcela && c.Ativo))
            throw new InvalidOperationException("Já existe um recebível para esta parcela da nota de venda.");

        var c = new ContaReceber
        {
            NumeroNota = dto.NumeroNota, Modelo = dto.Modelo, Serie = dto.Serie, ClienteId = dto.ClienteId,
            NumParcela = dto.NumParcela, ValorParcela = dto.ValorParcela, DataEmissao = dto.DataEmissao,
            DataVencimento = dto.DataVencimento, DataRecebimento = dto.DataRecebimento,
            ValorRecebido = dto.ValorRecebido, Juros = dto.Juros, Multa = dto.Multa,
            Desconto = dto.Desconto, Status = dto.Status, Ativo = dto.Ativo, FormaPagamentoId = dto.FormaPagamentoId,
            Observacao = dto.Observacao
        };
        c.Id = await _repository.InsertAsync(c);
        return c;
    }

    public async Task<IEnumerable<ContaReceber>> CreateParcelasAsync(CreateContaReceberParcelasDto dto)
    {
        if (dto.ClienteId <= 0)
            throw new InvalidOperationException("Selecione o cliente.");
        if (await _clienteRepository.GetByIdAsync(dto.ClienteId) == null)
            throw new InvalidOperationException("Cliente não encontrado.");

        var existentes = await _repository.GetByNotaAsync(dto.NumeroNota, dto.Modelo, dto.Serie, dto.ClienteId);
        if (existentes.Any(c => c.Ativo))
            throw new InvalidOperationException("Já existem recebíveis cadastrados para esta nota.");

        var resultado = new List<ContaReceber>();
        foreach (var parcela in dto.Parcelas.OrderBy(p => p.NumParcela))
        {
            var c = new ContaReceber
            {
                NumeroNota = dto.NumeroNota,
                Modelo = dto.Modelo,
                Serie = dto.Serie,
                ClienteId = dto.ClienteId,
                NumParcela = parcela.NumParcela,
                ValorParcela = parcela.ValorParcela,
                DataEmissao = dto.DataEmissao,
                DataVencimento = parcela.DataVencimento,
                DataRecebimento = parcela.DataRecebimento,
                ValorRecebido = parcela.DataRecebimento.HasValue ? parcela.ValorParcela : null,
                Juros = dto.Juros,
                Multa = dto.Multa,
                Desconto = dto.Desconto,
                Status = parcela.DataRecebimento.HasValue ? "PAGO" : "ABERTO",
                Ativo = true,
                FormaPagamentoId = dto.FormaPagamentoId,
                Observacao = dto.Observacao,
            };
            c.Id = await _repository.InsertAsync(c);
            resultado.Add(c);
        }
        return resultado;
    }

    public async Task<bool> UpdateAsync(long id, UpdateContaReceberDto dto)
    {
        var c = await _repository.GetByIdAsync(id);
        if (c == null) return false;
        if (c.Status == "PAGO" || c.Status == "RECEBIDO" || c.Status == "CANCELADO") return false;

        c.NumeroNota = dto.NumeroNota; c.Modelo = dto.Modelo; c.Serie = dto.Serie; c.ClienteId = dto.ClienteId;
        c.NumParcela = dto.NumParcela; c.ValorParcela = dto.ValorParcela; c.DataEmissao = dto.DataEmissao;
        c.DataVencimento = dto.DataVencimento; c.DataRecebimento = dto.DataRecebimento;
        c.ValorRecebido = dto.ValorRecebido; c.Juros = dto.Juros; c.Multa = dto.Multa;
        c.Desconto = dto.Desconto; c.Status = dto.Status; c.Ativo = dto.Ativo; c.FormaPagamentoId = dto.FormaPagamentoId;
        c.Observacao = dto.Observacao;

        return await _repository.UpdateAsync(c);
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var conta = await _repository.GetByIdAsync(id);
        if (conta == null || conta.Status == "PAGO" || conta.Status == "RECEBIDO" || conta.Status == "CANCELADO") return false;
        return await _repository.DeleteAsync(id);
    }

    public async Task<bool> RegistrarRecebimentoAsync(long id, DateTime dataRecebimento)
        => await _repository.RegistrarRecebimentoAsync(id, dataRecebimento);

    public async Task<bool> CancelarAsync(long id)
    {
        var parcela = await _repository.GetByIdAsync(id);
        if (parcela == null || parcela.Status == "PAGO" || parcela.Status == "RECEBIDO" || parcela.Status == "CANCELADO")
            return false;

        return await _repository.CancelarDaParcelaEmDianteAsync(parcela) > 0;
    }

    public async Task<int> SincronizarNotasDeVendaAsync()
    {
        var parcelasCriadas = 0;
        foreach (var nota in await _notasVenda.GetAllAsync())
            parcelasCriadas += await SincronizarDaNotaAsync(nota);
        return parcelasCriadas;
    }

    public async Task<int> SincronizarDaNotaAsync(NotaVenda nota)
    {
        var existentes = (await _repository.GetByNotaAsync(nota.NumeroNota, nota.Modelo, nota.Serie, nota.ClienteId)).ToList();
        var statusNota = (nota.Status ?? "ABERTA").ToUpperInvariant();
        if (!nota.Ativo || statusNota == "CANCELADO")
        {
            await _repository.CancelarPendentesDaNotaAsync(nota.NumeroNota, nota.Modelo, nota.Serie, nota.ClienteId);
            return 0;
        }

        if (nota.TotalPagar <= 0) return 0;

        var definicoes = nota.CondicaoPagamentoId.HasValue
            ? (await _condicoesPagamento.GetParcelasAsync(nota.CondicaoPagamentoId.Value)).OrderBy(p => p.Numero).ToList()
            : new List<CondicaoPagamentoRepository.ParcelaCondicaoPagamento>();
        if (definicoes.Count == 0)
            definicoes.Add(new CondicaoPagamentoRepository.ParcelaCondicaoPagamento { Numero = 1, Dias = 0, Percentual = 100 });

        decimal acumulado = 0;
        var criadas = 0;
        for (var i = 0; i < definicoes.Count; i++)
        {
            var definicao = definicoes[i];
            var valor = i == definicoes.Count - 1
                ? Math.Round(nota.TotalPagar - acumulado, 2)
                : Math.Round(nota.TotalPagar * definicao.Percentual / 100m, 2);
            acumulado += valor;

            var grupo = existentes.Where(c => c.NumParcela == definicao.Numero).OrderBy(c => c.Id).ToList();
            var encerradas = grupo.Where(RecebivelEncerrado).ToList();
            var pendentes = grupo.Where(c => !RecebivelEncerrado(c)).ToList();

            if (encerradas.Count > 0)
            {
                foreach (var duplicataPendente in pendentes)
                    await _repository.ArquivarPendenteAsync(duplicataPendente.Id);

                if (encerradas.All(c => c.Status == "CANCELADO" && c.DataCancelamento.HasValue))
                {
                    foreach (var duplicataCancelada in encerradas.Skip(1))
                        await _repository.ArquivarDuplicataCanceladaAsync(duplicataCancelada.Id);
                }
                continue;
            }

            var recebivel = pendentes.FirstOrDefault() ?? new ContaReceber
            {
                NumeroNota = nota.NumeroNota,
                Modelo = nota.Modelo,
                Serie = nota.Serie,
                ClienteId = nota.ClienteId,
                NumParcela = definicao.Numero,
                Status = "ABERTO",
                Ativo = true,
                Juros = 0,
                Multa = 0,
                Desconto = 0,
            };
            recebivel.ValorParcela = valor;
            recebivel.DataEmissao = nota.DataEmissao.Date;
            recebivel.DataVencimento = nota.DataEmissao.Date.AddDays(definicao.Dias);
            recebivel.FormaPagamentoId = definicao.FormaPagamentoId;
            recebivel.Observacao = nota.Observacao;

            if (recebivel.Id == 0)
            {
                recebivel.Id = await _repository.InsertAsync(recebivel);
                criadas++;
            }
            else
            {
                await _repository.UpdatePendenteDaNotaAsync(recebivel);
                foreach (var duplicata in pendentes.Skip(1))
                    await _repository.ArquivarPendenteAsync(duplicata.Id);
            }
        }

        foreach (var parcelaSobra in existentes.Where(c => !definicoes.Any(d => d.Numero == c.NumParcela) && !RecebivelEncerrado(c)))
            await _repository.ArquivarPendenteAsync(parcelaSobra.Id);

        return criadas;
    }

    private static bool RecebivelEncerrado(ContaReceber conta)
        => conta.Status == "PAGO" || conta.Status == "RECEBIDO" || conta.Status == "CANCELADO"
            || conta.DataRecebimento.HasValue || conta.DataCancelamento.HasValue;

    public async Task<int> BaixaLoteAsync(BaixaContaReceberLoteDto dto)
        => await _repository.BaixaLoteAsync(dto.Ids, dto.DataRecebimento);

    public async Task<IEnumerable<ContaReceber>> CreateLoteAsync(CreateContaReceberLoteDto dto)
    {
        var cliente = await _clienteRepository.GetByIdAsync(dto.ClienteId)
            ?? throw new InvalidOperationException("Cliente n\u00e3o encontrado.");

        if (cliente.IdCondicaoPagamento == null)
            throw new InvalidOperationException("O cliente n\u00e3o possui condi\u00e7\u00e3o de pagamento definida.");

        var parcelas = (await _parcelaRepository.GetByCondicaoIdAsync(cliente.IdCondicaoPagamento.Value))
            .Where(p => p.Ativo)
            .OrderBy(p => p.Numero)
            .ToList();

        if (!parcelas.Any())
            throw new InvalidOperationException("A condi\u00e7\u00e3o de pagamento n\u00e3o possui parcelas cadastradas.");

        var proximoNumero = await _repository.GetProximoNumeroNotaAsync();
        var numeroNota = proximoNumero.ToString().PadLeft(6, '0');

        var resultado = new List<ContaReceber>();
        foreach (var parcela in parcelas)
        {
            var c = new ContaReceber
            {
                NumeroNota = numeroNota,
                Modelo = "SE",
                Serie = "001",
                ClienteId = dto.ClienteId,
                NumParcela = parcela.Numero,
                ValorParcela = Math.Round(dto.ValorTotal * parcela.Percentual / 100m, 2),
                DataEmissao = dto.DataEmissao,
                DataVencimento = dto.DataEmissao.AddDays(parcela.Dias),
                Juros = 0, Multa = 0, Desconto = 0,
                Status = dto.Status,
                Ativo = dto.Ativo,
                FormaPagamentoId = parcela.FormaPagamentoId,
                Observacao = dto.Observacao,
            };
            c.Id = await _repository.InsertAsync(c);
            resultado.Add(c);
        }
        return resultado;
    }
}

