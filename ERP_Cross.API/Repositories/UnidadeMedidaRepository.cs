using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class UnidadeMedidaRepository
{
    private readonly IDbConnection _connection;

    public UnidadeMedidaRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<UnidadeMedida>> GetAllAsync(string? q = null)
    {
        var sql = "SELECT Id, NomeUnidade, Sigla, Ativo, DataCriacao, DataAtualizacao FROM UnidadesMedida";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE NomeUnidade LIKE @q";
        return await _connection.QueryAsync<UnidadeMedida>(sql, new { q = $"%{q}%" });
    }

    public async Task<UnidadeMedida?> GetByIdAsync(int id)
    {
        const string sql = "SELECT Id, NomeUnidade, Sigla, Ativo, DataCriacao, DataAtualizacao FROM UnidadesMedida WHERE Id = @Id";
        return await _connection.QueryFirstOrDefaultAsync<UnidadeMedida>(sql, new { Id = id });
    }

    public async Task<int> InsertAsync(UnidadeMedida unidade)
    {
        const string sql = @"
            INSERT INTO UnidadesMedida (NomeUnidade, Sigla, Ativo, DataCriacao, DataAtualizacao)
            VALUES (@NomeUnidade, @Sigla, @Ativo, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, unidade);
    }

    public async Task<bool> UpdateAsync(UnidadeMedida unidade)
    {
        const string sql = @"
            UPDATE UnidadesMedida 
            SET NomeUnidade = @NomeUnidade, Sigla = @Sigla, Ativo = @Ativo, DataAtualizacao = NOW()
            WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, unidade);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM UnidadesMedida WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}
