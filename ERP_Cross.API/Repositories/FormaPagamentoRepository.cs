using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class FormaPagamentoRepository
{
    private readonly IDbConnection _connection;

    public FormaPagamentoRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<FormaPagamento>> GetAllAsync(string? q = null)
    {
        var sql = "SELECT Id, NomeFormaPagamento, DataCriacao, DataAtualizacao FROM FormasPagamento";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE NomeFormaPagamento LIKE @q";
        return await _connection.QueryAsync<FormaPagamento>(sql, new { q = $"%{q}%" });
    }

    public async Task<FormaPagamento?> GetByIdAsync(int id)
    {
        const string sql = "SELECT Id, NomeFormaPagamento, DataCriacao, DataAtualizacao FROM FormasPagamento WHERE Id = @Id";
        return await _connection.QueryFirstOrDefaultAsync<FormaPagamento>(sql, new { Id = id });
    }

    public async Task<int> InsertAsync(FormaPagamento forma)
    {
        const string sql = @"
            INSERT INTO FormasPagamento (NomeFormaPagamento, DataCriacao, DataAtualizacao)
            VALUES (@NomeFormaPagamento, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, forma);
    }

    public async Task<bool> UpdateAsync(FormaPagamento forma)
    {
        const string sql = @"
            UPDATE FormasPagamento 
            SET NomeFormaPagamento = @NomeFormaPagamento, DataAtualizacao = NOW()
            WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, forma);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM FormasPagamento WHERE Id = @Id";
        var rows = await _connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}
