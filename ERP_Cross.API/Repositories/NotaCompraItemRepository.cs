using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class NotaCompraItemRepository
{
    private readonly IDbConnection _db;
    public NotaCompraItemRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "Id, NotaCompraId, ProdutoId, UnidadeId, Quantidade, PrecoUnit, DescontoUnit, " +
        "LiquidoUnit, Total, Rateio, CustoFinalUnit, CustoFinal, CriadoEm";

    public async Task<IEnumerable<NotaCompraItem>> GetAllAsync()
        => await _db.QueryAsync<NotaCompraItem>($"SELECT {SelectColumns} FROM NotaCompraItem");

    public async Task<IEnumerable<NotaCompraItem>> GetByNotaCompraIdAsync(long notaCompraId)
        => await _db.QueryAsync<NotaCompraItem>(
            $"SELECT {SelectColumns} FROM NotaCompraItem WHERE NotaCompraId = @NotaCompraId",
            new { NotaCompraId = notaCompraId });

    public async Task<NotaCompraItem?> GetByIdAsync(long id)
        => await _db.QueryFirstOrDefaultAsync<NotaCompraItem>(
            $"SELECT {SelectColumns} FROM NotaCompraItem WHERE Id = @Id", new { Id = id });

    public async Task<long> InsertAsync(NotaCompraItem i)
        => await _db.ExecuteScalarAsync<long>(
            @"INSERT INTO NotaCompraItem (NotaCompraId, ProdutoId, UnidadeId, Quantidade, PrecoUnit,
              DescontoUnit, LiquidoUnit, Total, Rateio, CustoFinalUnit, CustoFinal, CriadoEm)
              VALUES (@NotaCompraId, @ProdutoId, @UnidadeId, @Quantidade, @PrecoUnit,
              @DescontoUnit, @LiquidoUnit, @Total, @Rateio, @CustoFinalUnit, @CustoFinal, NOW());
              SELECT LAST_INSERT_ID();", i);

    public async Task<bool> UpdateAsync(NotaCompraItem i)
        => await _db.ExecuteAsync(
            @"UPDATE NotaCompraItem SET NotaCompraId=@NotaCompraId, ProdutoId=@ProdutoId, UnidadeId=@UnidadeId,
              Quantidade=@Quantidade, PrecoUnit=@PrecoUnit, DescontoUnit=@DescontoUnit, LiquidoUnit=@LiquidoUnit,
              Total=@Total, Rateio=@Rateio, CustoFinalUnit=@CustoFinalUnit, CustoFinal=@CustoFinal
              WHERE Id=@Id", i) > 0;

    public async Task<bool> DeleteAsync(long id)
        => await _db.ExecuteAsync("DELETE FROM NotaCompraItem WHERE Id = @Id", new { Id = id }) > 0;
}
