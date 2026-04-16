using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class EstadoRepository
{
    private readonly IDbConnection _connection;

    public EstadoRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<Estado>> GetAllAsync(string? q = null)
    {
        var sql = "SELECT Id, NomeEstado, Uf, IdPais, DataCriacao, DataAtualizacao FROM Estados";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE NomeEstado LIKE @q";
        return await _connection.QueryAsync<Estado>(sql, new { q = $"%{q}%" });
    }

    public async Task<Estado?> GetByIdAsync(int id)
    {
        const string sql = "SELECT Id, NomeEstado, Uf, IdPais, DataCriacao, DataAtualizacao FROM Estados WHERE Id = @Id";
        return await _connection.QueryFirstOrDefaultAsync<Estado>(sql, new { Id = id });
    }

    public async Task<int> InsertAsync(Estado estado)
    {
        const string sql = @"
            INSERT INTO Estados (NomeEstado, Uf, IdPais, DataCriacao, DataAtualizacao)
            VALUES (@NomeEstado, @Uf, @IdPais, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, estado);
    }

    public async Task<bool> UpdateAsync(Estado estado)
    {
        const string sql = @"
            UPDATE Estados 
            SET NomeEstado = @NomeEstado, Uf = @Uf, IdPais = @IdPais, DataAtualizacao = NOW()
            WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, estado);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM Estados WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}
