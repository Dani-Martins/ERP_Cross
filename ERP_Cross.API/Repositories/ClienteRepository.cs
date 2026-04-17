using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class ClienteRepository
{
    private readonly IDbConnection _connection;
    public ClienteRepository(IDbConnection connection) { _connection = connection; }

    private const string SelectColumns = @"
        c.Id, c.Nome, c.NomeFantasia, c.CpfCnpj, c.RgIe, c.Telefone, c.Celular, c.Email,
        c.Cep, c.Endereco, c.Numero, c.Complemento, c.Bairro, c.IdCidade,
        c.Pf, c.DataNascimento, c.Sexo, c.IdCondicaoPagamento, c.LimiteCredito,
        c.Ativo, c.DataCriacao, c.DataAtualizacao,
        ci.NomeCidade, cp.NomeCondicao AS NomeCondicaoPagamento";

    private const string FromJoin = @"
        FROM Clientes c
        LEFT JOIN Cidades ci ON c.IdCidade = ci.Id
        LEFT JOIN CondicoesPagamento cp ON c.IdCondicaoPagamento = cp.Id";

    public async Task<IEnumerable<Cliente>> GetAllAsync(string? q = null)
    {
        var sql = $"SELECT {SelectColumns} {FromJoin}";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE c.Nome LIKE @q OR c.NomeFantasia LIKE @q";
        return await _connection.QueryAsync<Cliente>(sql, new { q = $"%{q}%" });
    }

    public async Task<Cliente?> GetByIdAsync(int id)
        => await _connection.QueryFirstOrDefaultAsync<Cliente>($"SELECT {SelectColumns} {FromJoin} WHERE c.Id = @Id", new { Id = id });

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
