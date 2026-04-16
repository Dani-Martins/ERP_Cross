using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class ClienteRepository
{
    private readonly IDbConnection _connection;
    public ClienteRepository(IDbConnection connection) { _connection = connection; }

    private const string SelectColumns = @"
        Id, Nome, NomeFantasia, CpfCnpj, RgIe, Telefone, Celular, Email,
        Cep, Endereco, Numero, Complemento, Bairro, IdCidade,
        Pf, DataNascimento, Sexo, IdCondicaoPagamento, LimiteCredito,
        Ativo, DataCriacao, DataAtualizacao";

    public async Task<IEnumerable<Cliente>> GetAllAsync(string? q = null)
    {
        var sql = $"SELECT {SelectColumns} FROM Clientes";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE Nome LIKE @q OR NomeFantasia LIKE @q";
        return await _connection.QueryAsync<Cliente>(sql, new { q = $"%{q}%" });
    }

    public async Task<Cliente?> GetByIdAsync(int id)
        => await _connection.QueryFirstOrDefaultAsync<Cliente>($"SELECT {SelectColumns} FROM Clientes WHERE Id = @Id", new { Id = id });

    public async Task<int> InsertAsync(Cliente c)
    {
        const string sql = @"
            INSERT INTO Clientes (Nome, NomeFantasia, CpfCnpj, RgIe, Telefone, Celular, Email,
                Cep, Endereco, Numero, Complemento, Bairro, IdCidade,
                Pf, DataNascimento, Sexo, IdCondicaoPagamento, LimiteCredito, Ativo, DataCriacao, DataAtualizacao)
            VALUES (@Nome, @NomeFantasia, @CpfCnpj, @RgIe, @Telefone, @Celular, @Email,
                @Cep, @Endereco, @Numero, @Complemento, @Bairro, @IdCidade,
                @Pf, @DataNascimento, @Sexo, @IdCondicaoPagamento, @LimiteCredito, @Ativo, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, c);
    }

    public async Task<bool> UpdateAsync(Cliente c)
    {
        const string sql = @"
            UPDATE Clientes SET
                Nome=@Nome, NomeFantasia=@NomeFantasia, CpfCnpj=@CpfCnpj, RgIe=@RgIe,
                Telefone=@Telefone, Celular=@Celular, Email=@Email,
                Cep=@Cep, Endereco=@Endereco, Numero=@Numero, Complemento=@Complemento, Bairro=@Bairro, IdCidade=@IdCidade,
                Pf=@Pf, DataNascimento=@DataNascimento, Sexo=@Sexo,
                IdCondicaoPagamento=@IdCondicaoPagamento, LimiteCredito=@LimiteCredito,
                Ativo=@Ativo, DataAtualizacao=NOW()
            WHERE Id = @Id";
        return await _connection.ExecuteAsync(sql, c) > 0;
    }

    public async Task<bool> DeleteAsync(int id)
        => await _connection.ExecuteAsync("DELETE FROM Clientes WHERE Id = @Id", new { Id = id }) > 0;
}
