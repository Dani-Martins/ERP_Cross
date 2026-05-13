#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class NotaCompraItemService
{
    private readonly NotaCompraItemRepository _repository;
    private readonly NotaCompraRepository _notaCompraRepository;

    public NotaCompraItemService(NotaCompraItemRepository repository, NotaCompraRepository notaCompraRepository)
    {
        _repository = repository;
        _notaCompraRepository = notaCompraRepository;
    }

    public async Task<IEnumerable<NotaCompraItem>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<IEnumerable<NotaCompraItem>> GetByNotaCompraIdAsync(long notaCompraId) => await _repository.GetByNotaCompraIdAsync(notaCompraId);
    public async Task<NotaCompraItem?> GetByIdAsync(long id) => await _repository.GetByIdAsync(id);

    public async Task<NotaCompraItem> CreateAsync(CreateNotaCompraItemDto dto)
    {
        var nota = await _notaCompraRepository.GetByIdAsync(dto.NotaCompraId)
            ?? throw new ArgumentException("Nota de compra informada nao foi encontrada.");

        var i = new NotaCompraItem
        {
            NotaCompraId = dto.NotaCompraId, ProdutoId = dto.ProdutoId, UnidadeId = dto.UnidadeId,
            Quantidade = dto.Quantidade, PrecoUnit = dto.PrecoUnit, DescontoUnit = dto.DescontoUnit,
            Ativo = dto.Ativo
        };
        CalcularCampos(i, nota);
        i.Id = await _repository.InsertAsync(i);
        return i;
    }

    public async Task<bool> UpdateAsync(long id, UpdateNotaCompraItemDto dto)
    {
        var i = await _repository.GetByIdAsync(id);
        if (i == null) return false;

        var nota = await _notaCompraRepository.GetByIdAsync(dto.NotaCompraId)
            ?? throw new ArgumentException("Nota de compra informada nao foi encontrada.");

        i.NotaCompraId = dto.NotaCompraId; i.ProdutoId = dto.ProdutoId; i.UnidadeId = dto.UnidadeId;
        i.Quantidade = dto.Quantidade; i.PrecoUnit = dto.PrecoUnit; i.DescontoUnit = dto.DescontoUnit;
        i.Ativo = dto.Ativo;
        CalcularCampos(i, nota);

        return await _repository.UpdateAsync(i);
    }

    public async Task<bool> DeleteAsync(long id) => await _repository.DeleteAsync(id);

    private static void CalcularCampos(NotaCompraItem i, NotaCompra nota)
    {
        i.LiquidoUnit = i.PrecoUnit - i.DescontoUnit;
        i.Total = i.LiquidoUnit * i.Quantidade;
        i.Rateio = nota.TotalProdutos > 0
            ? i.LiquidoUnit * nota.ValorFrete / nota.TotalProdutos
            : 0;
        i.CustoFinalUnit = i.LiquidoUnit + i.Rateio;
        i.CustoFinal = i.CustoFinalUnit * i.Quantidade;
    }
}

