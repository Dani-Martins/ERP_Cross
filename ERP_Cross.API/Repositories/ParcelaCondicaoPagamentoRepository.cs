using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class ParcelaCondicaoPagamentoRepository
{
    private readonly IDbConnection _db;
    public ParcelaCondicaoPagamentoRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "Id, Numero, Dias, Percentual, FormaPagamentoId, CondicaoPagamentoId, DataCriacao, DataAtualizacao";

    public async Task<IEnumerable<ParcelaCondicaoPagamento>> GetAllAsync()
        => await _db.QueryAsync<ParcelaCondicaoPagamento>($"SELECT {SelectColumns} FROM ParcelaCondicaoPagamento");

    public async Task<IEnumerable<ParcelaCondicaoPagamento>> GetByCondicaoIdAsync(int condicaoId)
        => await _db.QueryAsync<ParcelaCondicaoPagamento>(
            $"SELECT {SelectColumns} FROM ParcelaCondicaoPagamento WHERE CondicaoPagamentoId = @CondicaoPagamentoId",
            new { CondicaoPagamentoId = condicaoId });

    public async Task<ParcelaCondicaoPagamento?> GetByIdAsync(int id)
        => await _db.QueryFirstOrDefaultAsync<ParcelaCondicaoPagamento>(
            $"SELECT {SelectColumns} FROM ParcelaCondicaoPagamento WHERE Id = @Id", new { Id = id });

    public async Task<int> InsertAsync(ParcelaCondicaoPagamento p)
        => await _db.ExecuteScalarAsync<int>(
            @"INSERT INTO ParcelaCondicaoPagamento (Numero, Dias, Percentual, FormaPagamentoId, CondicaoPagamentoId, DataCriacao)
              VALUES (@Numero, @Dias, @Percentual, @FormaPagamentoId, @CondicaoPagamentoId, NOW());
              SELECT LAST_INSERT_ID();", p);

    public async Task<bool> UpdateAsync(ParcelaCondicaoPagamento p)
        => await _db.ExecuteAsync(
            @"UPDATE ParcelaCondicaoPagamento SET Numero=@Numero, Dias=@Dias, Percentual=@Percentual,
              FormaPagamentoId=@FormaPagamentoId, CondicaoPagamentoId=@CondicaoPagamentoId, DataAtualizacao=NOW()
              WHERE Id=@Id", p) > 0;

    public async Task<bool> DeleteAsync(int id)
        => await _db.ExecuteAsync("DELETE FROM ParcelaCondicaoPagamento WHERE Id = @Id", new { Id = id }) > 0;
}
