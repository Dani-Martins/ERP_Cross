#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class NotaCompraService
{
    private readonly NotaCompraRepository _repository;
    private readonly ContaPagarService _contasPagar;
    public NotaCompraService(NotaCompraRepository repository, ContaPagarService contasPagar)
    {
        _repository = repository;
        _contasPagar = contasPagar;
    }

    public async Task<IEnumerable<NotaCompra>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<NotaCompra?> GetByIdAsync(long id) => await _repository.GetByIdAsync(id);

    public async Task<NotaCompra> CreateAsync(CreateNotaCompraDto dto)
    {
        // Validar unicidade de Número, Modelo e Série
        var existing = await _repository.GetByNumeroModeloSerieAsync(dto.NumeroNota, dto.Modelo, dto.Serie);
        if (existing != null)
            throw new InvalidOperationException($"Já existe uma nota de compra com os dados: Número '{dto.NumeroNota}', Modelo '{dto.Modelo}', Série '{dto.Serie}'.");

        var n = new NotaCompra
        {
            FornecedorId = dto.FornecedorId, Modelo = dto.Modelo, Serie = dto.Serie, NumeroNota = dto.NumeroNota,
            DataEmissao = dto.DataEmissao, DataChegada = dto.DataChegada, ChaveAcesso = dto.ChaveAcesso, TipoFrete = dto.TipoFrete,
            ValorFrete = dto.ValorFrete, ValorSeguro = dto.ValorSeguro, OutrasDespesas = dto.OutrasDespesas,
            TotalProdutos = dto.TotalProdutos,
            TotalPagar = dto.TotalProdutos + dto.ValorFrete + dto.ValorSeguro + dto.OutrasDespesas,
            CondicaoPagamentoId = dto.CondicaoPagamentoId, TransportadoraId = dto.TransportadoraId,
            PlacaVeiculo = dto.PlacaVeiculo, Observacao = dto.Observacao, Status = dto.Status,
            Ativo = dto.Ativo
        };
        n.Id = await _repository.InsertAsync(n);
        await _contasPagar.SincronizarDaNotaAsync(n);
        return n;
    }

    public async Task<bool> UpdateAsync(long id, UpdateNotaCompraDto dto)
    {
        var n = await _repository.GetByIdAsync(id);
        if (n == null) return false;

        n.FornecedorId = dto.FornecedorId; n.Modelo = dto.Modelo; n.Serie = dto.Serie; n.NumeroNota = dto.NumeroNota;
        n.DataEmissao = dto.DataEmissao; n.DataChegada = dto.DataChegada; n.ChaveAcesso = dto.ChaveAcesso; n.TipoFrete = dto.TipoFrete;
        n.ValorFrete = dto.ValorFrete; n.ValorSeguro = dto.ValorSeguro; n.OutrasDespesas = dto.OutrasDespesas;
        n.TotalProdutos = dto.TotalProdutos;
        n.TotalPagar = dto.TotalProdutos + dto.ValorFrete + dto.ValorSeguro + dto.OutrasDespesas;
        n.CondicaoPagamentoId = dto.CondicaoPagamentoId; n.TransportadoraId = dto.TransportadoraId;
        n.PlacaVeiculo = dto.PlacaVeiculo; n.Observacao = dto.Observacao; n.Status = dto.Status;
        n.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(n);
    }

    public async Task<string?> CancelarContaPagarAsync(long id)
    {
        var nota = await _repository.GetByIdAsync(id);
        if (nota == null) return "Nota de compra não encontrada.";
        if (!nota.Ativo) return "A nota de compra está inativa.";
        if (!await _contasPagar.CancelarDaNotaCompraAsync(id))
            return "Não é possível cancelar a conta: ela não está aberta, já foi cancelada ou possui parcela paga.";
        return null;
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var n = await _repository.GetByIdAsync(id);
        if (!await _repository.DeleteAsync(id)) return false;
        if (n != null)
        {
            n.Ativo = false;
            await _contasPagar.SincronizarDaNotaAsync(n);
        }
        return true;
    }
}

