#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class ParcelaNotaVendaRepository
{
    private readonly IDbConnection _db;
    public ParcelaNotaVendaRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "pnv.Id, pnv.NumeroNota, pnv.Modelo, pnv.Serie, pnv.ClienteId, pnv.NumParcela, pnv.FormaPagamentoId, " +
        "pnv.DataVencimento, pnv.ValorParcela, pnv.Pago, pnv.DataPagamento, pnv.CriadoEm, " +
        "fp.Nome AS NomeFormaPagamento";

    private const string FromJoin = @"
        FROM parcelasnotavenda pnv
        LEFT JOIN formaespagamento fp ON pnv.FormaPagamentoId = fp.Id";

    public async Task<IEnumerable<ParcelaNotaVenda>> GetByNotaAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _db.QueryAsync<ParcelaNotaVenda>(
            $"SELECT {SelectColumns} {FromJoin} WHERE pnv.NumeroNota=@NumeroNota AND pnv.Modelo=@Modelo AND pnv.Serie=@Serie AND pnv.ClienteId=@ClienteId ORDER BY pnv.NumParcela",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId });

    public async Task<ParcelaNotaVenda?> GetByIdAsync(long id)
        => await _db.QueryFirstOrDefaultAsync<ParcelaNotaVenda>(
            $"SELECT {SelectColumns} {FromJoin} WHERE pnv.Id=@Id",
            new { Id = id });

    public async Task<bool> InsertAsync(ParcelaNotaVenda parcela)
        => await _db.ExecuteAsync(
            @"INSERT INTO parcelasnotavenda (NumeroNota, Modelo, Serie, ClienteId, NumParcela, FormaPagamentoId,
              DataVencimento, ValorParcela, Pago, DataPagamento, CriadoEm)
              VALUES (@NumeroNota, @Modelo, @Serie, @ClienteId, @NumParcela, @FormaPagamentoId,
              @DataVencimento, @ValorParcela, @Pago, @DataPagamento, NOW())", parcela) > 0;

    public async Task<bool> UpdateAsync(ParcelaNotaVenda parcela)
        => await _db.ExecuteAsync(
            @"UPDATE parcelasnotavenda SET FormaPagamentoId=@FormaPagamentoId,
              DataVencimento=@DataVencimento, ValorParcela=@ValorParcela, Pago=@Pago, DataPagamento=@DataPagamento
              WHERE Id=@Id", parcela) > 0;

    public async Task<bool> DeleteAsync(long id)
        => await _db.ExecuteAsync(
            "DELETE FROM parcelasnotavenda WHERE Id=@Id",
            new { Id = id }) > 0;

    public async Task<bool> DeleteByNotaAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _db.ExecuteAsync(
            "DELETE FROM parcelasnotavenda WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId }) > 0;
}
