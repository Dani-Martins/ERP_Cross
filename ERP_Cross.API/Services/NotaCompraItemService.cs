#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class NotaCompraItemService
{
    private readonly NotaCompraItemRepository _repository;
    public NotaCompraItemService(NotaCompraItemRepository repository) { _repository = repository; }

    public async Task<IEnumerable<NotaCompraItem>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<IEnumerable<NotaCompraItem>> GetByNotaCompraIdAsync(long notaCompraId) => await _repository.GetByNotaCompraIdAsync(notaCompraId);
    public async Task<NotaCompraItem?> GetByIdAsync(long id) => await _repository.GetByIdAsync(id);

    public async Task<NotaCompraItem> CreateAsync(CreateNotaCompraItemDto dto)
    {
        var i = new NotaCompraItem
        {
            NotaCompraId = dto.NotaCompraId, ProdutoId = dto.ProdutoId, UnidadeId = dto.UnidadeId,
            Quantidade = dto.Quantidade, PrecoUnit = dto.PrecoUnit, DescontoUnit = dto.DescontoUnit,
            LiquidoUnit = dto.LiquidoUnit, Total = dto.Total, Rateio = dto.Rateio,
            CustoFinalUnit = dto.CustoFinalUnit, CustoFinal = dto.CustoFinal,
            Ativo = dto.Ativo
        };
        i.Id = await _repository.InsertAsync(i);
        return i;
    }

    public async Task<bool> UpdateAsync(long id, UpdateNotaCompraItemDto dto)
    {
        var i = await _repository.GetByIdAsync(id);
        if (i == null) return false;

        i.NotaCompraId = dto.NotaCompraId; i.ProdutoId = dto.ProdutoId; i.UnidadeId = dto.UnidadeId;
        i.Quantidade = dto.Quantidade; i.PrecoUnit = dto.PrecoUnit; i.DescontoUnit = dto.DescontoUnit;
        i.LiquidoUnit = dto.LiquidoUnit; i.Total = dto.Total; i.Rateio = dto.Rateio;
        i.CustoFinalUnit = dto.CustoFinalUnit; i.CustoFinal = dto.CustoFinal;
        i.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(i);
    }

    public async Task<bool> DeleteAsync(long id) => await _repository.DeleteAsync(id);
}

