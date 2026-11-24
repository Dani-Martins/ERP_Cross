#nullable enable
using System.Data;
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class NotaCompraItemService
{
    private readonly NotaCompraItemRepository _repository;
    private readonly NotaCompraRepository _notaCompraRepository;
    private readonly ProdutoRepository _produtoRepository;
    private readonly IDbConnection _db;

    public NotaCompraItemService(
        NotaCompraItemRepository repository,
        NotaCompraRepository notaCompraRepository,
        ProdutoRepository produtoRepository,
        IDbConnection db)
    {
        _repository = repository;
        _notaCompraRepository = notaCompraRepository;
        _produtoRepository = produtoRepository;
        _db = db;
    }

    public async Task<IEnumerable<NotaCompraItem>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<IEnumerable<NotaCompraItem>> GetByNotaCompraIdAsync(long notaCompraId) => await _repository.GetByNotaCompraIdAsync(notaCompraId);
    public async Task<NotaCompraItem?> GetByIdAsync(long id) => await _repository.GetByIdAsync(id);

    public Task<NotaCompraItem> CreateAsync(CreateNotaCompraItemDto dto, IDbTransaction? transacao = null)
    {
        if (transacao == null)
            throw new ArgumentException("Não é possível adicionar itens a uma compra já cadastrada.");
        return EmTransacaoAsync(async transaction =>
    {
        if (dto.Quantidade <= 0)
            throw new ArgumentException("A quantidade do item deve ser maior que zero.");
        if (dto.PrecoUnit < 0 || dto.DescontoUnit < 0 || dto.DescontoUnit > dto.PrecoUnit)
            throw new ArgumentException("O preço e o desconto do item devem resultar em um valor líquido não negativo.");
        var nota = await _notaCompraRepository.GetByIdAsync(dto.NotaCompraId, transaction)
            ?? throw new ArgumentException("Nota de compra informada nao foi encontrada.");
        if (!nota.Ativo || string.Equals(nota.Status, "CANCELADO", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Não é possível adicionar itens a uma nota de compra inativa ou cancelada.");

        var i = new NotaCompraItem
        {
            NotaCompraId = dto.NotaCompraId, ProdutoId = dto.ProdutoId, UnidadeId = dto.UnidadeId,
            Quantidade = dto.Quantidade, PrecoUnit = dto.PrecoUnit, DescontoUnit = dto.DescontoUnit,
            Ativo = dto.Ativo
        };
        CalcularCampos(i, nota);
        i.Id = await _repository.InsertAsync(i, transaction);
        if (i.Ativo)
            await _produtoRepository.RegistrarCompraAsync(i.ProdutoId, i.Id, i.Quantidade, i.LiquidoUnit, transaction);
        return i;
    }, transacao);
    }

    public Task<bool> UpdateAsync(long id, UpdateNotaCompraItemDto dto, IDbTransaction? transacao = null)
        => throw new ArgumentException("Uma compra cadastrada não pode ser alterada.");

    public Task<bool> DeleteAsync(long id, IDbTransaction? transacao = null)
        => throw new ArgumentException("Uma compra cadastrada não pode ser alterada.");

    private async Task<T> EmTransacaoAsync<T>(Func<IDbTransaction, Task<T>> operacao, IDbTransaction? transacao)
    {
        if (transacao != null) return await operacao(transacao);
        var abriuConexao = _db.State == ConnectionState.Closed;
        if (abriuConexao) _db.Open();
        try
        {
            using var transaction = _db.BeginTransaction();
            var resultado = await operacao(transaction);
            transaction.Commit();
            return resultado;
        }
        finally
        {
            if (abriuConexao) _db.Close();
        }
    }

    private static void CalcularCampos(NotaCompraItem i, NotaCompra nota)
    {
        i.LiquidoUnit = i.PrecoUnit - i.DescontoUnit;
        i.Total = i.LiquidoUnit * i.Quantidade;
        var despesasAdicionais =
            (string.Equals(nota.TipoFrete, "FOB", StringComparison.OrdinalIgnoreCase) ? nota.ValorFrete : 0)
            + nota.ValorSeguro
            + nota.OutrasDespesas;
        i.Rateio = nota.TotalProdutos > 0 && i.Quantidade > 0
            ? i.LiquidoUnit * despesasAdicionais / nota.TotalProdutos
            : 0;
        i.CustoFinalUnit = i.LiquidoUnit + i.Rateio;
        i.CustoFinal = i.CustoFinalUnit * i.Quantidade;
    }
}

