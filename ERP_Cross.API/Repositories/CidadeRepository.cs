using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class CidadeRepository
{
    private readonly IDbConnection _connection;

    public CidadeRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<Cidade>> GetAllAsync(string? q = null)
    {
        var sql = @"SELECT c.Id, c.NomeCidade, c.Ddd, c.IdEstado, c.Ativo, c.DataCriacao, c.DataAtualizacao,
                           e.NomeEstado
                    FROM Cidades c
                    LEFT JOIN Estados e ON c.IdEstado = e.Id";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE c.NomeCidade LIKE @q";
        return await _connection.QueryAsync<Cidade>(sql, new { q = $"%{q}%" });
    }

    public async Task<Cidade?> GetByIdAsync(int id)
    {
        const string sql = @"SELECT c.Id, c.NomeCidade, c.Ddd, c.IdEstado, c.Ativo, c.DataCriacao, c.DataAtualizacao,
                                    e.NomeEstado
                             FROM Cidades c
                             LEFT JOIN Estados e ON c.IdEstado = e.Id
                             WHERE c.Id = @Id";
        return await _connection.QueryFirstOrDefaultAsync<Cidade>(sql, new { Id = id });
    }

    public async Task<int> InsertAsync(Cidade cidade)
    {
        const string sql = @"
            INSERT INTO Cidades (NomeCidade, Ddd, IdEstado, Ativo, DataCriacao, DataAtualizacao)
            VALUES (@NomeCidade, @Ddd, @IdEstado, @Ativo, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, cidade);
    }

    public async Task<bool> UpdateAsync(Cidade cidade)
    {
        const string sql = @"
            UPDATE Cidades 
            SET NomeCidade = @NomeCidade, Ddd = @Ddd, IdEstado = @IdEstado, Ativo = @Ativo, DataAtualizacao = NOW()
            WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, cidade);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM Cidades WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}
