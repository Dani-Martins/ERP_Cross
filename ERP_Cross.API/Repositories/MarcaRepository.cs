#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class MarcaRepository
{
    private readonly IDbConnection _connection;

    public MarcaRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<Marca>> GetAllAsync(string? q = null)
    {
        var sql = "SELECT Id, NomeMarca, Descricao, Ativo, DataCriacao, DataAtualizacao FROM Marcas";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE NomeMarca LIKE @q";
        return await _connection.QueryAsync<Marca>(sql, new { q = $"%{q}%" });
    }

    public async Task<Marca?> GetByIdAsync(int id)
    {
        const string sql = "SELECT Id, NomeMarca, Descricao, Ativo, DataCriacao, DataAtualizacao FROM Marcas WHERE Id = @Id";
        return await _connection.QueryFirstOrDefaultAsync<Marca>(sql, new { Id = id });
    }

    public async Task<int> InsertAsync(Marca marca)
    {
        const string sql = @"
            INSERT INTO Marcas (NomeMarca, Descricao, Ativo, DataCriacao, DataAtualizacao)
            VALUES (@NomeMarca, @Descricao, @Ativo, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, marca);
    }

    public async Task<bool> UpdateAsync(Marca marca)
    {
        const string sql = @"
            UPDATE Marcas 
            SET NomeMarca = @NomeMarca, Descricao = @Descricao, Ativo = @Ativo, DataAtualizacao = NOW()
            WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, marca);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM Marcas WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}

