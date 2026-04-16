using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class NotaVendaRepository
{
    private readonly IDbConnection _db;
    public NotaVendaRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "NumeroNota, Modelo, Serie, ClienteId, DataEmissao, TransportadoraId, PlacaVeiculo, " +
        "TipoFrete, ValorFrete, TotalProdutos, TotalPagar, CondicaoPagamentoId, Observacao, Status, CriadoEm, AtualizadoEm";

    public async Task<IEnumerable<NotaVenda>> GetAllAsync()
        => await _db.QueryAsync<NotaVenda>($"SELECT {SelectColumns} FROM NotaVenda");

    public async Task<NotaVenda?> GetByKeyAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _db.QueryFirstOrDefaultAsync<NotaVenda>(
            $"SELECT {SelectColumns} FROM NotaVenda WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId });

    public async Task<bool> InsertAsync(NotaVenda n)
        => await _db.ExecuteAsync(
            @"INSERT INTO NotaVenda (NumeroNota, Modelo, Serie, ClienteId, DataEmissao, TransportadoraId, PlacaVeiculo,
              TipoFrete, ValorFrete, TotalProdutos, TotalPagar, CondicaoPagamentoId, Observacao, Status, CriadoEm)
              VALUES (@NumeroNota, @Modelo, @Serie, @ClienteId, @DataEmissao, @TransportadoraId, @PlacaVeiculo,
              @TipoFrete, @ValorFrete, @TotalProdutos, @TotalPagar, @CondicaoPagamentoId, @Observacao, @Status, NOW())", n) > 0;

    public async Task<bool> UpdateAsync(NotaVenda n)
        => await _db.ExecuteAsync(
            @"UPDATE NotaVenda SET DataEmissao=@DataEmissao, TransportadoraId=@TransportadoraId,
              PlacaVeiculo=@PlacaVeiculo, TipoFrete=@TipoFrete, ValorFrete=@ValorFrete,
              TotalProdutos=@TotalProdutos, TotalPagar=@TotalPagar, CondicaoPagamentoId=@CondicaoPagamentoId,
              Observacao=@Observacao, Status=@Status, AtualizadoEm=NOW()
              WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId", n) > 0;

    public async Task<bool> DeleteAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _db.ExecuteAsync(
            "DELETE FROM NotaVenda WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId }) > 0;
}
