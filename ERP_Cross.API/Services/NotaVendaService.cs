#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class NotaVendaService
{
    private readonly NotaVendaRepository _repository;
    public NotaVendaService(NotaVendaRepository repository) { _repository = repository; }

    public async Task<IEnumerable<NotaVenda>> GetAllAsync() => await _repository.GetAllAsync();

    public async Task<NotaVenda?> GetByKeyAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _repository.GetByKeyAsync(numeroNota, modelo, serie, clienteId);

    public async Task<NotaVenda?> CreateAsync(CreateNotaVendaDto dto)
    {
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
        return ok ? n : null;
    }

    public async Task<bool> UpdateAsync(string numeroNota, string modelo, string serie, int clienteId, UpdateNotaVendaDto dto)
    {
        var n = await _repository.GetByKeyAsync(numeroNota, modelo, serie, clienteId);
        if (n == null) return false;

        n.DataEmissao = dto.DataEmissao; n.TransportadoraId = dto.TransportadoraId;
        n.PlacaVeiculo = dto.PlacaVeiculo; n.TipoFrete = dto.TipoFrete; n.ValorFrete = dto.ValorFrete;
        n.Desconto = dto.Desconto; n.TotalProdutos = dto.TotalProdutos;
        n.TotalPagar = dto.TotalProdutos + dto.ValorFrete - dto.Desconto;
        n.CondicaoPagamentoId = dto.CondicaoPagamentoId; n.Observacao = dto.Observacao; n.Status = dto.Status;
        n.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(n);
    }

    public async Task<bool> DeleteAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _repository.DeleteAsync(numeroNota, modelo, serie, clienteId);
}

