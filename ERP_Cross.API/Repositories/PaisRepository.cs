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

    public async Task<IEnumerable<Pais>> GetAllAsync()
    {
        const string sql = "SELECT Id, NomePais, Sigla, Ddi, DataCriacao, DataAtualizacao FROM Paises";
        return await _connection.QueryAsync<Pais>(sql);
    }

    public async Task<Pais?> GetByIdAsync(int id)
    {
        const string sql = "SELECT Id, NomePais, Sigla, Ddi, DataCriacao, DataAtualizacao FROM Paises WHERE Id = @Id";
        return await _connection.QueryFirstOrDefaultAsync<Pais>(sql, new { Id = id });
    }

    public async Task<int> InsertAsync(Pais pais)
    {
        const string sql = @"
            INSERT INTO Paises (NomePais, Sigla, Ddi, DataCriacao, DataAtualizacao)
            VALUES (@NomePais, @Sigla, @Ddi, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, pais);
    }

    public async Task<bool> UpdateAsync(Pais pais)
    {
        const string sql = @"
            UPDATE Paises 
            SET NomePais = @NomePais, Sigla = @Sigla, Ddi = @Ddi, DataAtualizacao = NOW()
            WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, pais);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM Paises WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}
