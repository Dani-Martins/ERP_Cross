#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class NotaVendaService
{
    private readonly NotaVendaRepository _repository;
    private readonly ContaReceberService _contasReceber;
    public NotaVendaService(NotaVendaRepository repository, ContaReceberService contasReceber)
    {
        _repository = repository;
        _contasReceber = contasReceber;
    }

    public async Task<IEnumerable<NotaVenda>> GetAllAsync() => await _repository.GetAllAsync();

    public async Task<NotaVenda?> GetByKeyAsync(string numeroNota, string modelo, string serie)
        => await _repository.GetByKeyAsync(numeroNota, modelo, serie);

    public async Task<NotaVenda?> CreateAsync(CreateNotaVendaDto dto)
    {
        // Validar unicidade de Número, Modelo e Série
        var existing = await _repository.GetByKeyAsync(dto.NumeroNota, dto.Modelo, dto.Serie);
        if (existing != null && existing.Ativo)
            throw new InvalidOperationException($"Já existe uma nota de venda com os dados: Número '{dto.NumeroNota}', Modelo '{dto.Modelo}', Série '{dto.Serie}'.");

        var n = new NotaVenda
        {
            NumeroNota = dto.NumeroNota, Modelo = dto.Modelo, Serie = dto.Serie, ClienteId = dto.ClienteId,
            DataEmissao = dto.DataEmissao, TransportadoraId = dto.TransportadoraId, PlacaVeiculo = dto.PlacaVeiculo,
            TipoFrete = dto.TipoFrete, ValorFrete = dto.ValorFrete, Desconto = dto.Desconto,
            TotalProdutos = dto.TotalProdutos,
            TotalPagar = dto.TotalProdutos + dto.ValorFrete - dto.Desconto,
            CondicaoPagamentoId = dto.CondicaoPagamentoId,
            Observacao = dto.Observacao, Status = dto.Status,
            Ativo = dto.Ativo
        };
        var ok = await _repository.InsertAsync(n);
        if (ok) await _contasReceber.SincronizarDaNotaAsync(n);
        return ok ? n : null;
    }

    public async Task<bool> UpdateAsync(string numeroNota, string modelo, string serie, UpdateNotaVendaDto dto)
    {
        var n = await _repository.GetByKeyAsync(numeroNota, modelo, serie);
        if (n == null) return false;

        n.DataEmissao = dto.DataEmissao; n.TransportadoraId = dto.TransportadoraId;
        n.PlacaVeiculo = dto.PlacaVeiculo; n.TipoFrete = dto.TipoFrete; n.ValorFrete = dto.ValorFrete;
        n.Desconto = dto.Desconto; n.TotalProdutos = dto.TotalProdutos;
        n.TotalPagar = dto.TotalProdutos + dto.ValorFrete - dto.Desconto;
        n.CondicaoPagamentoId = dto.CondicaoPagamentoId; n.Observacao = dto.Observacao; n.Status = dto.Status;
        n.Ativo = dto.Ativo;

        var atualizado = await _repository.UpdateAsync(n);
        if (atualizado) await _contasReceber.SincronizarDaNotaAsync(n);
        return atualizado;
    }

    public async Task<string?> CancelarContaReceberAsync(string numeroNota, string modelo, string serie, int clienteId)
    {
        var nota = await _repository.GetByKeyAsync(numeroNota, modelo, serie);
        if (nota == null || nota.ClienteId != clienteId) return "Nota de venda não encontrada.";
        if (!nota.Ativo) return "A nota de venda está inativa.";
        if (!await _contasReceber.CancelarDaNotaAsync(numeroNota, modelo, serie, clienteId))
            return "Não é possível cancelar a conta: ela não está aberta, já foi cancelada ou possui parcela paga.";
        return null;
    }

    public async Task<bool> DeleteAsync(string numeroNota, string modelo, string serie)
    {
        var nota = await _repository.GetByKeyAsync(numeroNota, modelo, serie);
        if (nota == null || !await _repository.DeleteAsync(numeroNota, modelo, serie)) return false;
        nota.Ativo = false;
        await _contasReceber.SincronizarDaNotaAsync(nota);
        return true;
    }

    public async Task<int> SincronizarContasReceberAsync()
        => await _contasReceber.SincronizarNotasDeVendaAsync();

    public async Task<string> GetNextNumeroNotaAsync(string modelo, string serie)
        => await _repository.GetNextNumeroNotaAsync(modelo, serie);
}

