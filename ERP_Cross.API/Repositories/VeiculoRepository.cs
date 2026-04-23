#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class VeiculoRepository
{
    private readonly IDbConnection _connection;

    public VeiculoRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<Veiculo>> GetAllAsync(string? q = null)
    {
        var sql = @"SELECT Id, Placa, Modelo, Marca, Ano, Descricao,
                           Ativo, DataCriacao, DataAtualizacao
                    FROM Veiculos";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE Placa LIKE @q OR Modelo LIKE @q";
        return await _connection.QueryAsync<Veiculo>(sql, new { q = $"%{q}%" });
    }

    public async Task<Veiculo?> GetByIdAsync(int id)
    {
        const string sql = @"SELECT Id, Placa, Modelo, Marca, Ano, Descricao,
                                    Ativo, DataCriacao, DataAtualizacao
                             FROM Veiculos
                             WHERE Id = @Id";
        return await _connection.QueryFirstOrDefaultAsync<Veiculo>(sql, new { Id = id });
    }

    public async Task<int> InsertAsync(Veiculo veiculo)
    {
        const string sql = @"
            INSERT INTO Veiculos (Placa, Modelo, Marca, Ano, Descricao, Ativo, DataCriacao, DataAtualizacao)
            VALUES (@Placa, @Modelo, @Marca, @Ano, @Descricao, @Ativo, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, veiculo);
    }

    public async Task<bool> UpdateAsync(Veiculo veiculo)
    {
        const string sql = @"
            UPDATE Veiculos 
            SET Placa = @Placa, Modelo = @Modelo, Marca = @Marca, Ano = @Ano,
                Descricao = @Descricao, Ativo = @Ativo, DataAtualizacao = NOW()
            WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, veiculo);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM Veiculos WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}

