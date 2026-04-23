#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class CondicaoPagamentoRepository
{
    private readonly IDbConnection _connection;

    public CondicaoPagamentoRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<CondicaoPagamento>> GetAllAsync(string? q = null)
    {
        var sql = "SELECT Id, NomeCondicao, TaxaJuros, Multa, Desconto, Ativo, DataCriacao, DataAtualizacao FROM CondicoesPagamento";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE NomeCondicao LIKE @q";
        return await _connection.QueryAsync<CondicaoPagamento>(sql, new { q = $"%{q}%" });
    }

    public async Task<CondicaoPagamento?> GetByIdAsync(int id)
    {
        const string sql = "SELECT Id, NomeCondicao, TaxaJuros, Multa, Desconto, Ativo, DataCriacao, DataAtualizacao FROM CondicoesPagamento WHERE Id = @Id";
        return await _connection.QueryFirstOrDefaultAsync<CondicaoPagamento>(sql, new { Id = id });
    }

    public async Task<int> InsertAsync(CondicaoPagamento condicao)
    {
        const string sql = @"
            INSERT INTO CondicoesPagamento (NomeCondicao, TaxaJuros, Multa, Desconto, Ativo, DataCriacao, DataAtualizacao)
            VALUES (@NomeCondicao, @TaxaJuros, @Multa, @Desconto, @Ativo, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, condicao);
    }

    public async Task<bool> UpdateAsync(CondicaoPagamento condicao)
    {
        const string sql = @"
            UPDATE CondicoesPagamento 
            SET NomeCondicao = @NomeCondicao, TaxaJuros = @TaxaJuros, Multa = @Multa, 
                Desconto = @Desconto, Ativo = @Ativo, DataAtualizacao = NOW()
            WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, condicao);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM CondicoesPagamento WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}

