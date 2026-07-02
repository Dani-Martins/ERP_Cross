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

    public ContaReceberService(
        ContaReceberRepository repository,
        ClienteRepository clienteRepository,
        ParcelaCondicaoPagamentoRepository parcelaRepository)
    {
        _repository = repository;
        _clienteRepository = clienteRepository;
        _parcelaRepository = parcelaRepository;
    }

    public async Task<IEnumerable<ContaReceber>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<ContaReceber?> GetByIdAsync(long id) => await _repository.GetByIdAsync(id);
    public async Task<long> GetProximoNumeroNotaAsync() => await _repository.GetProximoNumeroNotaAsync();

    public async Task<ContaReceber> CreateAsync(CreateContaReceberDto dto)
    {
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

    public async Task<bool> UpdateAsync(long id, UpdateContaReceberDto dto)
    {
        var c = await _repository.GetByIdAsync(id);
        if (c == null) return false;

        c.NumeroNota = dto.NumeroNota; c.Modelo = dto.Modelo; c.Serie = dto.Serie; c.ClienteId = dto.ClienteId;
        c.NumParcela = dto.NumParcela; c.ValorParcela = dto.ValorParcela; c.DataEmissao = dto.DataEmissao;
        c.DataVencimento = dto.DataVencimento; c.DataRecebimento = dto.DataRecebimento;
        c.ValorRecebido = dto.ValorRecebido; c.Juros = dto.Juros; c.Multa = dto.Multa;
        c.Desconto = dto.Desconto; c.Status = dto.Status; c.Ativo = dto.Ativo; c.FormaPagamentoId = dto.FormaPagamentoId;
        c.Observacao = dto.Observacao;

        return await _repository.UpdateAsync(c);
    }

    public async Task<bool> DeleteAsync(long id) => await _repository.DeleteAsync(id);

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

