#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class NotaCompraItemRepository
{
    private readonly IDbConnection _db;
    public NotaCompraItemRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "nci.Id, nci.NotaCompraId, nci.ProdutoId, nci.UnidadeId, nci.Quantidade, nci.PrecoUnit, nci.DescontoUnit, " +
        "nci.LiquidoUnit, nci.Total, nci.Rateio, nci.CustoFinalUnit, nci.CustoFinal, nci.Ativo, nci.CriadoEm, " +
        "pr.NomeProduto, um.NomeUnidade";

    private const string FromJoin = @"
        FROM NotaCompraItem nci
        LEFT JOIN Produto pr ON nci.ProdutoId = pr.Id
        LEFT JOIN UnidadesMedida um ON nci.UnidadeId = um.Id";

    public async Task<IEnumerable<NotaCompraItem>> GetAllAsync()
        => await _db.QueryAsync<NotaCompraItem>($"SELECT {SelectColumns} {FromJoin}");

    public async Task<IEnumerable<NotaCompraItem>> GetByNotaCompraIdAsync(long notaCompraId)
        => await _db.QueryAsync<NotaCompraItem>(
            $"SELECT {SelectColumns} {FromJoin} WHERE nci.NotaCompraId = @NotaCompraId",
            new { NotaCompraId = notaCompraId });

    public async Task<NotaCompraItem?> GetByIdAsync(long id)
        => await _db.QueryFirstOrDefaultAsync<NotaCompraItem>(
            $"SELECT {SelectColumns} {FromJoin} WHERE nci.Id = @Id", new { Id = id });

    public async Task<long> InsertAsync(NotaCompraItem i)
        => await _db.ExecuteScalarAsync<long>(
            @"INSERT INTO NotaCompraItem (NotaCompraId, ProdutoId, UnidadeId, Quantidade, PrecoUnit,
              DescontoUnit, LiquidoUnit, Total, Rateio, CustoFinalUnit, CustoFinal, Ativo, CriadoEm)
              VALUES (@NotaCompraId, @ProdutoId, @UnidadeId, @Quantidade, @PrecoUnit,
              @DescontoUnit, @LiquidoUnit, @Total, @Rateio, @CustoFinalUnit, @CustoFinal, @Ativo, NOW());
              SELECT LAST_INSERT_ID();", i);

    public async Task<bool> UpdateAsync(NotaCompraItem i)
        => await _db.ExecuteAsync(
            @"UPDATE NotaCompraItem SET NotaCompraId=@NotaCompraId, ProdutoId=@ProdutoId, UnidadeId=@UnidadeId,
              Quantidade=@Quantidade, PrecoUnit=@PrecoUnit, DescontoUnit=@DescontoUnit, LiquidoUnit=@LiquidoUnit,
              Total=@Total, Rateio=@Rateio, CustoFinalUnit=@CustoFinalUnit, CustoFinal=@CustoFinal, Ativo=@Ativo
              WHERE Id=@Id", i) > 0;

    public async Task<bool> DeleteAsync(long id)
        => await _db.ExecuteAsync("DELETE FROM NotaCompraItem WHERE Id = @Id", new { Id = id }) > 0;
}

