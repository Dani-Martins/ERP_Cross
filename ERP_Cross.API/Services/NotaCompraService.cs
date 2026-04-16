using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class NotaCompraService
{
    private readonly NotaCompraRepository _repository;
    public NotaCompraService(NotaCompraRepository repository) { _repository = repository; }

    public async Task<IEnumerable<NotaCompra>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<NotaCompra?> GetByIdAsync(long id) => await _repository.GetByIdAsync(id);

    public async Task<NotaCompra> CreateAsync(CreateNotaCompraDto dto)
    {
        var n = new NotaCompra
        {
            FornecedorId = dto.FornecedorId, Modelo = dto.Modelo, Serie = dto.Serie, NumeroNota = dto.NumeroNota,
            DataEmissao = dto.DataEmissao, ChaveAcesso = dto.ChaveAcesso, TipoFrete = dto.TipoFrete,
            ValorFrete = dto.ValorFrete, ValorSeguro = dto.ValorSeguro, OutrasDespesas = dto.OutrasDespesas,
            TotalProdutos = dto.TotalProdutos, TotalPagar = dto.TotalPagar,
            CondicaoPagamentoId = dto.CondicaoPagamentoId, TransportadoraId = dto.TransportadoraId,
            PlacaVeiculo = dto.PlacaVeiculo, Observacao = dto.Observacao, Status = dto.Status
        };
        n.Id = await _repository.InsertAsync(n);
        return n;
    }

    public async Task<bool> UpdateAsync(long id, UpdateNotaCompraDto dto)
    {
        var n = await _repository.GetByIdAsync(id);
        if (n == null) return false;

        n.FornecedorId = dto.FornecedorId; n.Modelo = dto.Modelo; n.Serie = dto.Serie; n.NumeroNota = dto.NumeroNota;
        n.DataEmissao = dto.DataEmissao; n.ChaveAcesso = dto.ChaveAcesso; n.TipoFrete = dto.TipoFrete;
        n.ValorFrete = dto.ValorFrete; n.ValorSeguro = dto.ValorSeguro; n.OutrasDespesas = dto.OutrasDespesas;
        n.TotalProdutos = dto.TotalProdutos; n.TotalPagar = dto.TotalPagar;
        n.CondicaoPagamentoId = dto.CondicaoPagamentoId; n.TransportadoraId = dto.TransportadoraId;
        n.PlacaVeiculo = dto.PlacaVeiculo; n.Observacao = dto.Observacao; n.Status = dto.Status;

        return await _repository.UpdateAsync(n);
    }

    public async Task<bool> DeleteAsync(long id) => await _repository.DeleteAsync(id);
}
