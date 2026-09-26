#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class ParcelaNotaCompraRepository
{
    private readonly IDbConnection _db;
    public ParcelaNotaCompraRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "pnc.Id, pnc.NumeroNota, pnc.Modelo, pnc.Serie, pnc.FornecedorId, pnc.NumParcela, pnc.FormaPagamentoId, " +
        "pnc.DataVencimento, pnc.ValorParcela, pnc.Pago, pnc.DataPagamento, pnc.CriadoEm, " +
        "fp.Nome AS NomeFormaPagamento";

    private const string FromJoin = @"
        FROM parcelasnotacompra pnc
        LEFT JOIN formaespagamento fp ON pnc.FormaPagamentoId = fp.Id";

    public async Task<IEnumerable<ParcelaNotaCompra>> GetByNotaAsync(string numeroNota, string modelo, string serie, int fornecedorId)
        => await _db.QueryAsync<ParcelaNotaCompra>(
            $"SELECT {SelectColumns} {FromJoin} WHERE pnc.NumeroNota=@NumeroNota AND pnc.Modelo=@Modelo AND pnc.Serie=@Serie AND pnc.FornecedorId=@FornecedorId ORDER BY pnc.NumParcela",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, FornecedorId = fornecedorId });

    public async Task<ParcelaNotaCompra?> GetByIdAsync(long id)
        => await _db.QueryFirstOrDefaultAsync<ParcelaNotaCompra>(
            $"SELECT {SelectColumns} {FromJoin} WHERE pnc.Id=@Id",
            new { Id = id });

    public async Task<bool> InsertAsync(ParcelaNotaCompra parcela)
        => await _db.ExecuteAsync(
            @"INSERT INTO parcelasnotacompra (NumeroNota, Modelo, Serie, FornecedorId, NumParcela, FormaPagamentoId,
              DataVencimento, ValorParcela, Pago, DataPagamento, CriadoEm)
              VALUES (@NumeroNota, @Modelo, @Serie, @FornecedorId, @NumParcela, @FormaPagamentoId,
              @DataVencimento, @ValorParcela, @Pago, @DataPagamento, NOW())", parcela) > 0;

    public async Task<bool> UpdateAsync(ParcelaNotaCompra parcela)
        => await _db.ExecuteAsync(
            @"UPDATE parcelasnotacompra SET FormaPagamentoId=@FormaPagamentoId,
              DataVencimento=@DataVencimento, ValorParcela=@ValorParcela, Pago=@Pago, DataPagamento=@DataPagamento
              WHERE Id=@Id", parcela) > 0;

    public async Task<bool> DeleteAsync(long id)
        => await _db.ExecuteAsync(
            "DELETE FROM parcelasnotacompra WHERE Id=@Id",
            new { Id = id }) > 0;

    public async Task<bool> DeleteByNotaAsync(string numeroNota, string modelo, string serie, int fornecedorId)
        => await _db.ExecuteAsync(
            "DELETE FROM parcelasnotacompra WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND FornecedorId=@FornecedorId",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, FornecedorId = fornecedorId }) > 0;
}
