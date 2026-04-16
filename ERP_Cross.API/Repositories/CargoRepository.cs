using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class CargoRepository
{
    private readonly IDbConnection _connection;

    public CargoRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<Cargo>> GetAllAsync(string? q = null)
    {
        var sql = "SELECT Id, NomeCargo, Descricao, SalarioBase, ExigeCnh, Ativo, DataCriacao, DataAtualizacao FROM Cargos";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE NomeCargo LIKE @q";
        return await _connection.QueryAsync<Cargo>(sql, new { q = $"%{q}%" });
    }

    public async Task<Cargo?> GetByIdAsync(int id)
    {
        const string sql = "SELECT Id, NomeCargo, Descricao, SalarioBase, ExigeCnh, Ativo, DataCriacao, DataAtualizacao FROM Cargos WHERE Id = @Id";
        return await _connection.QueryFirstOrDefaultAsync<Cargo>(sql, new { Id = id });
    }

    public async Task<int> InsertAsync(Cargo cargo)
    {
        const string sql = @"
            INSERT INTO Cargos (NomeCargo, Descricao, SalarioBase, ExigeCnh, Ativo, DataCriacao, DataAtualizacao)
            VALUES (@NomeCargo, @Descricao, @SalarioBase, @ExigeCnh, @Ativo, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, cargo);
    }

    public async Task<bool> UpdateAsync(Cargo cargo)
    {
        const string sql = @"
            UPDATE Cargos 
            SET NomeCargo = @NomeCargo, Descricao = @Descricao, SalarioBase = @SalarioBase, 
                ExigeCnh = @ExigeCnh, Ativo = @Ativo, DataAtualizacao = NOW()
            WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, cargo);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM Cargos WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}
