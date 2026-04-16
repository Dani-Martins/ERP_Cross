using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class FornecedorRepository
{
    private readonly IDbConnection _connection;
    public FornecedorRepository(IDbConnection connection) { _connection = connection; }

    private const string SelectColumns = @"
        Id, Nome, NomeFantasia, CpfCnpj, RgIe, Telefone, Celular, Email,
        Cep, Endereco, Numero, Complemento, Bairro, IdCidade,
        IdCondicaoPagamento, Ativo, DataCriacao, DataAtualizacao";

    public async Task<IEnumerable<Fornecedor>> GetAllAsync(string? q = null)
    {
        var sql = $"SELECT {SelectColumns} FROM Fornecedores";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE Nome LIKE @q OR NomeFantasia LIKE @q";
        return await _connection.QueryAsync<Fornecedor>(sql, new { q = $"%{q}%" });
    }

    public async Task<Fornecedor?> GetByIdAsync(int id)
        => await _connection.QueryFirstOrDefaultAsync<Fornecedor>($"SELECT {SelectColumns} FROM Fornecedores WHERE Id = @Id", new { Id = id });

    public async Task<int> InsertAsync(Fornecedor f)
    {
        const string sql = @"
            INSERT INTO Fornecedores (Nome, NomeFantasia, CpfCnpj, RgIe, Telefone, Celular, Email,
                Cep, Endereco, Numero, Complemento, Bairro, IdCidade,
                IdCondicaoPagamento, Ativo, DataCriacao, DataAtualizacao)
            VALUES (@Nome, @NomeFantasia, @CpfCnpj, @RgIe, @Telefone, @Celular, @Email,
                @Cep, @Endereco, @Numero, @Complemento, @Bairro, @IdCidade,
                @IdCondicaoPagamento, @Ativo, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, f);
    }

    public async Task<bool> UpdateAsync(Fornecedor f)
    {
        const string sql = @"
            UPDATE Fornecedores SET
                Nome=@Nome, NomeFantasia=@NomeFantasia, CpfCnpj=@CpfCnpj, RgIe=@RgIe,
                Telefone=@Telefone, Celular=@Celular, Email=@Email,
                Cep=@Cep, Endereco=@Endereco, Numero=@Numero, Complemento=@Complemento, Bairro=@Bairro, IdCidade=@IdCidade,
                IdCondicaoPagamento=@IdCondicaoPagamento, Ativo=@Ativo, DataAtualizacao=NOW()
            WHERE Id = @Id";
        return await _connection.ExecuteAsync(sql, f) > 0;
    }

    public async Task<bool> DeleteAsync(int id)
        => await _connection.ExecuteAsync("DELETE FROM Fornecedores WHERE Id = @Id", new { Id = id }) > 0;
}
