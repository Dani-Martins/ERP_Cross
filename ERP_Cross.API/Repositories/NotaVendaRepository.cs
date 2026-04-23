#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class NotaVendaRepository
{
    private readonly IDbConnection _db;
    public NotaVendaRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "nv.NumeroNota, nv.Modelo, nv.Serie, nv.ClienteId, nv.DataEmissao, nv.TransportadoraId, nv.PlacaVeiculo, " +
        "nv.TipoFrete, nv.ValorFrete, nv.TotalProdutos, nv.TotalPagar, nv.CondicaoPagamentoId, nv.Observacao, nv.Status, nv.Ativo, nv.CriadoEm, nv.AtualizadoEm, " +
        "cl.Nome AS NomeCliente, cp.NomeCondicao AS NomeCondicaoPagamento, t.Nome AS NomeTransportadora";

    private const string FromJoin = @"
        FROM NotaVenda nv
        LEFT JOIN Clientes cl ON nv.ClienteId = cl.Id
        LEFT JOIN CondicoesPagamento cp ON nv.CondicaoPagamentoId = cp.Id
        LEFT JOIN Transportadoras t ON nv.TransportadoraId = t.Id";

    public async Task<IEnumerable<NotaVenda>> GetAllAsync()
        => await _db.QueryAsync<NotaVenda>($"SELECT {SelectColumns} {FromJoin}");

    public async Task<NotaVenda?> GetByKeyAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _db.QueryFirstOrDefaultAsync<NotaVenda>(
            $"SELECT {SelectColumns} {FromJoin} WHERE nv.NumeroNota=@NumeroNota AND nv.Modelo=@Modelo AND nv.Serie=@Serie AND nv.ClienteId=@ClienteId",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId });

    public async Task<bool> InsertAsync(NotaVenda n)
        => await _db.ExecuteAsync(
            @"INSERT INTO NotaVenda (NumeroNota, Modelo, Serie, ClienteId, DataEmissao, TransportadoraId, PlacaVeiculo,
              TipoFrete, ValorFrete, TotalProdutos, TotalPagar, CondicaoPagamentoId, Observacao, Status, Ativo, CriadoEm)
              VALUES (@NumeroNota, @Modelo, @Serie, @ClienteId, @DataEmissao, @TransportadoraId, @PlacaVeiculo,
              @TipoFrete, @ValorFrete, @TotalProdutos, @TotalPagar, @CondicaoPagamentoId, @Observacao, @Status, @Ativo, NOW())", n) > 0;

    public async Task<bool> UpdateAsync(NotaVenda n)
        => await _db.ExecuteAsync(
            @"UPDATE NotaVenda SET DataEmissao=@DataEmissao, TransportadoraId=@TransportadoraId,
              PlacaVeiculo=@PlacaVeiculo, TipoFrete=@TipoFrete, ValorFrete=@ValorFrete,
              TotalProdutos=@TotalProdutos, TotalPagar=@TotalPagar, CondicaoPagamentoId=@CondicaoPagamentoId,
              Observacao=@Observacao, Status=@Status, Ativo=@Ativo, AtualizadoEm=NOW()
              WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId", n) > 0;

    public async Task<bool> DeleteAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _db.ExecuteAsync(
            "DELETE FROM NotaVenda WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId }) > 0;
}

