#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class NotaCompraRepository
{
    private readonly IDbConnection _db;
    public NotaCompraRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "nc.Id, nc.FornecedorId, nc.Modelo, nc.Serie, nc.NumeroNota, nc.DataEmissao, nc.DataChegada, nc.ChaveAcesso, nc.TipoFrete, " +
        "nc.ValorFrete, nc.ValorSeguro, nc.OutrasDespesas, nc.TotalProdutos, nc.TotalPagar, nc.CondicaoPagamentoId, " +
        "nc.TransportadoraId, nc.PlacaVeiculo, nc.Observacao, nc.Status, nc.Ativo, nc.CriadoEm, nc.AtualizadoEm, " +
        "f.Nome AS NomeFornecedor, cp.NomeCondicao AS NomeCondicaoPagamento, t.Nome AS NomeTransportadora";

    private const string FromJoin = @"
        FROM NotaCompra nc
        LEFT JOIN Fornecedores f ON nc.FornecedorId = f.Id
        LEFT JOIN CondicoesPagamento cp ON nc.CondicaoPagamentoId = cp.Id
        LEFT JOIN Transportadoras t ON nc.TransportadoraId = t.Id";

    public async Task<IEnumerable<NotaCompra>> GetAllAsync()
        => await _db.QueryAsync<NotaCompra>($"SELECT {SelectColumns} {FromJoin}");

    public async Task<NotaCompra?> GetByIdAsync(long id, IDbTransaction? transaction = null)
        => await _db.QueryFirstOrDefaultAsync<NotaCompra>($"SELECT {SelectColumns} {FromJoin} WHERE nc.Id = @Id" + (transaction != null ? " FOR UPDATE" : ""), new { Id = id }, transaction);

    public async Task<NotaCompra?> GetByNumeroModeloSerieAsync(string numeroNota, string modelo, string serie, int fornecedorId, long? excludeId = null, IDbTransaction? transaction = null)
        => await _db.QueryFirstOrDefaultAsync<NotaCompra>(
            $"SELECT {SelectColumns} {FromJoin} WHERE nc.NumeroNota=@NumeroNota AND nc.Modelo=@Modelo AND nc.Serie=@Serie AND nc.FornecedorId=@FornecedorId AND (@ExcludeId IS NULL OR nc.Id<>@ExcludeId)",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, FornecedorId = fornecedorId, ExcludeId = excludeId }, transaction);

    public async Task<long> InsertAsync(NotaCompra n, IDbTransaction? transaction = null)
        => await _db.ExecuteScalarAsync<long>(
            @"INSERT INTO NotaCompra (FornecedorId, Modelo, Serie, NumeroNota, DataEmissao, DataChegada, ChaveAcesso, TipoFrete,
              ValorFrete, ValorSeguro, OutrasDespesas, TotalProdutos, TotalPagar, CondicaoPagamentoId,
              TransportadoraId, PlacaVeiculo, Observacao, Status, Ativo, CriadoEm)
              VALUES (@FornecedorId, @Modelo, @Serie, @NumeroNota, @DataEmissao, @DataChegada, @ChaveAcesso, @TipoFrete,
              @ValorFrete, @ValorSeguro, @OutrasDespesas, @TotalProdutos, @TotalPagar, @CondicaoPagamentoId,
              @TransportadoraId, @PlacaVeiculo, @Observacao, @Status, @Ativo, NOW());
              SELECT LAST_INSERT_ID();", n, transaction);

    public async Task<bool> UpdateAsync(NotaCompra n, IDbTransaction? transaction = null)
        => await _db.ExecuteAsync(
            @"UPDATE NotaCompra SET FornecedorId=@FornecedorId, Modelo=@Modelo, Serie=@Serie, NumeroNota=@NumeroNota,
              DataEmissao=@DataEmissao, DataChegada=@DataChegada, ChaveAcesso=@ChaveAcesso, TipoFrete=@TipoFrete, ValorFrete=@ValorFrete,
              ValorSeguro=@ValorSeguro, OutrasDespesas=@OutrasDespesas, TotalProdutos=@TotalProdutos,
              TotalPagar=@TotalPagar, CondicaoPagamentoId=@CondicaoPagamentoId, TransportadoraId=@TransportadoraId,
              PlacaVeiculo=@PlacaVeiculo, Observacao=@Observacao, Status=@Status, Ativo=@Ativo, AtualizadoEm=NOW()
              WHERE Id=@Id", n, transaction) > 0;

    public async Task<bool> DeleteAsync(long id, IDbTransaction? transaction = null)
        => await _db.ExecuteAsync("UPDATE NotaCompra SET Ativo = 0, AtualizadoEm = NOW() WHERE Id = @Id AND Ativo = 1", new { Id = id }, transaction) > 0;
}

