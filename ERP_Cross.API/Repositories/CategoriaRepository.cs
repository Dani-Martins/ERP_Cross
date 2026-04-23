#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class CategoriaRepository
{
    private readonly IDbConnection _connection;

    public CategoriaRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<Categoria>> GetAllAsync(string? q = null)
    {
        var sql = "SELECT Id, NomeCategoria, Descricao, Ativo, DataCriacao, DataAtualizacao FROM Categorias";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE NomeCategoria LIKE @q";
        return await _connection.QueryAsync<Categoria>(sql, new { q = $"%{q}%" });
    }

    public async Task<Categoria?> GetByIdAsync(int id)
    {
        const string sql = "SELECT Id, NomeCategoria, Descricao, Ativo, DataCriacao, DataAtualizacao FROM Categorias WHERE Id = @Id";
        return await _connection.QueryFirstOrDefaultAsync<Categoria>(sql, new { Id = id });
    }

    public async Task<int> InsertAsync(Categoria categoria)
    {
        const string sql = @"
            INSERT INTO Categorias (NomeCategoria, Descricao, Ativo, DataCriacao, DataAtualizacao)
            VALUES (@NomeCategoria, @Descricao, @Ativo, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, categoria);
    }

    public async Task<bool> UpdateAsync(Categoria categoria)
    {
        const string sql = @"
            UPDATE Categorias 
            SET NomeCategoria = @NomeCategoria, Descricao = @Descricao, Ativo = @Ativo, DataAtualizacao = NOW()
            WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, categoria);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM Categorias WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}

