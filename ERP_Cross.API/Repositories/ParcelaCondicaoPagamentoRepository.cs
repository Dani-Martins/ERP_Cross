#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class ParcelaCondicaoPagamentoRepository
{
    private readonly IDbConnection _db;
    public ParcelaCondicaoPagamentoRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "pc.Id, pc.Numero, pc.Dias, pc.Percentual, pc.FormaPagamentoId, pc.CondicaoPagamentoId, pc.Ativo, pc.DataCriacao, pc.DataAtualizacao, " +
        "fp.NomeFormaPagamento, cp.NomeCondicao";

    private const string FromJoin = @"
        FROM ParcelaCondicaoPagamento pc
        LEFT JOIN FormasPagamento fp ON pc.FormaPagamentoId = fp.Id
        LEFT JOIN CondicoesPagamento cp ON pc.CondicaoPagamentoId = cp.Id";

    public async Task<IEnumerable<ParcelaCondicaoPagamento>> GetAllAsync()
        => await _db.QueryAsync<ParcelaCondicaoPagamento>($"SELECT {SelectColumns} {FromJoin}");

    public async Task<IEnumerable<ParcelaCondicaoPagamento>> GetByCondicaoIdAsync(int condicaoId)
        => await _db.QueryAsync<ParcelaCondicaoPagamento>(
            $"SELECT {SelectColumns} {FromJoin} WHERE pc.CondicaoPagamentoId = @CondicaoPagamentoId",
            new { CondicaoPagamentoId = condicaoId });

    public async Task<ParcelaCondicaoPagamento?> GetByIdAsync(int id)
        => await _db.QueryFirstOrDefaultAsync<ParcelaCondicaoPagamento>(
            $"SELECT {SelectColumns} {FromJoin} WHERE pc.Id = @Id", new { Id = id });

    public async Task<int> InsertAsync(ParcelaCondicaoPagamento p)
        => await _db.ExecuteScalarAsync<int>(
            @"INSERT INTO ParcelaCondicaoPagamento (Numero, Dias, Percentual, FormaPagamentoId, CondicaoPagamentoId, Ativo, DataCriacao)
              VALUES (@Numero, @Dias, @Percentual, @FormaPagamentoId, @CondicaoPagamentoId, @Ativo, NOW());
              SELECT LAST_INSERT_ID();", p);

    public async Task<bool> UpdateAsync(ParcelaCondicaoPagamento p)
        => await _db.ExecuteAsync(
            @"UPDATE ParcelaCondicaoPagamento SET Numero=@Numero, Dias=@Dias, Percentual=@Percentual,
              FormaPagamentoId=@FormaPagamentoId, CondicaoPagamentoId=@CondicaoPagamentoId, Ativo=@Ativo, DataAtualizacao=NOW()
              WHERE Id=@Id", p) > 0;

    public async Task<bool> DeleteAsync(int id)
        => await _db.ExecuteAsync("DELETE FROM ParcelaCondicaoPagamento WHERE Id = @Id", new { Id = id }) > 0;
}

