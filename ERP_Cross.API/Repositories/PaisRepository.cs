#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class PaisRepository
{
    private readonly IDbConnection _connection;

    public PaisRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<Pais>> GetAllAsync(string? q = null)
    {
        var sql = "SELECT Id, NomePais, Sigla, Ddi, Ativo, DataCriacao, DataAtualizacao FROM Paises";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE NomePais LIKE @q";
        return await _connection.QueryAsync<Pais>(sql, new { q = $"%{q}%" });
    }

    public async Task<Pais?> GetByIdAsync(int id)
    {
        const string sql = "SELECT Id, NomePais, Sigla, Ddi, Ativo, DataCriacao, DataAtualizacao FROM Paises WHERE Id = @Id";
        return await _connection.QueryFirstOrDefaultAsync<Pais>(sql, new { Id = id });
    }

    public async Task<bool> SiglaExistsAsync(string sigla, int? excludeId = null)
    {
        const string sql = "SELECT COUNT(1) FROM Paises WHERE Sigla = @Sigla AND (@ExcludeId IS NULL OR Id != @ExcludeId)";
        var count = await _connection.ExecuteScalarAsync<int>(sql, new { Sigla = sigla, ExcludeId = excludeId });
        return count > 0;
    }

    public async Task<int> InsertAsync(Pais pais)
    {
        const string sql = @"
            INSERT INTO Paises (NomePais, Sigla, Ddi, Ativo, DataCriacao, DataAtualizacao)
            VALUES (@NomePais, @Sigla, @Ddi, @Ativo, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, pais);
    }

    public async Task<bool> UpdateAsync(Pais pais)
    {
        const string sql = @"
            UPDATE Paises 
            SET NomePais = @NomePais, Sigla = @Sigla, Ddi = @Ddi, Ativo = @Ativo, DataAtualizacao = NOW()
            WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, pais);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "UPDATE Paises SET Ativo = 0, DataAtualizacao = NOW() WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}

