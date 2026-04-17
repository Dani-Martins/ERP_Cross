using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class NotaCompraRepository
{
    private readonly IDbConnection _db;
    public NotaCompraRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "nc.Id, nc.FornecedorId, nc.Modelo, nc.Serie, nc.NumeroNota, nc.DataEmissao, nc.ChaveAcesso, nc.TipoFrete, " +
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

    public async Task<NotaCompra?> GetByIdAsync(long id)
        => await _db.QueryFirstOrDefaultAsync<NotaCompra>($"SELECT {SelectColumns} {FromJoin} WHERE nc.Id = @Id", new { Id = id });

    public async Task<long> InsertAsync(NotaCompra n)
        => await _db.ExecuteScalarAsync<long>(
            @"INSERT INTO NotaCompra (FornecedorId, Modelo, Serie, NumeroNota, DataEmissao, ChaveAcesso, TipoFrete,
              ValorFrete, ValorSeguro, OutrasDespesas, TotalProdutos, TotalPagar, CondicaoPagamentoId,
              TransportadoraId, PlacaVeiculo, Observacao, Status, Ativo, CriadoEm)
              VALUES (@FornecedorId, @Modelo, @Serie, @NumeroNota, @DataEmissao, @ChaveAcesso, @TipoFrete,
              @ValorFrete, @ValorSeguro, @OutrasDespesas, @TotalProdutos, @TotalPagar, @CondicaoPagamentoId,
              @TransportadoraId, @PlacaVeiculo, @Observacao, @Status, @Ativo, NOW());
              SELECT LAST_INSERT_ID();", n);

    public async Task<bool> UpdateAsync(NotaCompra n)
        => await _db.ExecuteAsync(
            @"UPDATE NotaCompra SET FornecedorId=@FornecedorId, Modelo=@Modelo, Serie=@Serie, NumeroNota=@NumeroNota,
              DataEmissao=@DataEmissao, ChaveAcesso=@ChaveAcesso, TipoFrete=@TipoFrete, ValorFrete=@ValorFrete,
              ValorSeguro=@ValorSeguro, OutrasDespesas=@OutrasDespesas, TotalProdutos=@TotalProdutos,
              TotalPagar=@TotalPagar, CondicaoPagamentoId=@CondicaoPagamentoId, TransportadoraId=@TransportadoraId,
              PlacaVeiculo=@PlacaVeiculo, Observacao=@Observacao, Status=@Status, Ativo=@Ativo, AtualizadoEm=NOW()
              WHERE Id=@Id", n) > 0;

    public async Task<bool> DeleteAsync(long id)
        => await _db.ExecuteAsync("DELETE FROM NotaCompra WHERE Id = @Id", new { Id = id }) > 0;
}
