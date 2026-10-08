#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class ContaPagarParcelaRepository
{
    private readonly IDbConnection _db;
    public ContaPagarParcelaRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "Id, ContaPagarId, NumParcela, DataVencimento, ValorParcela, Pago, DataPagamento, ValorPago";

    public async Task<IEnumerable<ContaPagarParcela>> GetByContaAsync(long contaId)
        => await _db.QueryAsync<ContaPagarParcela>(
            $"SELECT {SelectColumns} FROM ContaPagarParcela WHERE ContaPagarId = @ContaId ORDER BY NumParcela",
            new { ContaId = contaId });

    public async Task<ContaPagarParcela?> GetByIdAsync(long id)
        => await _db.QueryFirstOrDefaultAsync<ContaPagarParcela>(
            $"SELECT {SelectColumns} FROM ContaPagarParcela WHERE Id = @Id", new { Id = id });

    public async Task InsertAsync(ContaPagarParcela p)
        => await _db.ExecuteAsync(
            @"INSERT INTO ContaPagarParcela (ContaPagarId, NumParcela, DataVencimento, ValorParcela, Pago, DataPagamento, ValorPago)
              VALUES (@ContaPagarId, @NumParcela, @DataVencimento, @ValorParcela, @Pago, @DataPagamento, @ValorPago)", p);

    public async Task<bool> MarcarPagaAsync(long id, DateTime dataPagamento, decimal valorPago)
        => await _db.ExecuteAsync(
            @"UPDATE ContaPagarParcela SET Pago = 1, DataPagamento = @DataPagamento, ValorPago = @ValorPago
              WHERE Id = @Id AND Pago = 0", new { Id = id, DataPagamento = dataPagamento, ValorPago = valorPago }) > 0;

    public async Task<int> CountAbertasAsync(long contaId)
        => await _db.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM ContaPagarParcela WHERE ContaPagarId = @ContaId AND Pago = 0", new { ContaId = contaId });

    public async Task DeleteByContaAsync(long contaId)
        => await _db.ExecuteAsync("DELETE FROM ContaPagarParcela WHERE ContaPagarId = @ContaId", new { ContaId = contaId });
}
