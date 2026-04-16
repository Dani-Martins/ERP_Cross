using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class FuncionarioRepository
{
    private readonly IDbConnection _connection;
    public FuncionarioRepository(IDbConnection connection) { _connection = connection; }

    private const string SelectColumns = @"
        Id, Nome, CpfCnpj, RgIe, Telefone, Celular, Email,
        Cep, Endereco, Numero, Complemento, Bairro, IdCidade,
        IdCargo, Pis, Ctps, Salario, DataAdmissao, DataDemissao, Sexo,
        Ativo, DataCriacao, DataAtualizacao";

    public async Task<IEnumerable<Funcionario>> GetAllAsync(string? q = null)
    {
        var sql = $"SELECT {SelectColumns} FROM Funcionarios";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE Nome LIKE @q";
        return await _connection.QueryAsync<Funcionario>(sql, new { q = $"%{q}%" });
    }

    public async Task<Funcionario?> GetByIdAsync(int id)
        => await _connection.QueryFirstOrDefaultAsync<Funcionario>($"SELECT {SelectColumns} FROM Funcionarios WHERE Id = @Id", new { Id = id });

    public async Task<int> InsertAsync(Funcionario f)
    {
        const string sql = @"
            INSERT INTO Funcionarios (Nome, CpfCnpj, RgIe, Telefone, Celular, Email,
                Cep, Endereco, Numero, Complemento, Bairro, IdCidade,
                IdCargo, Pis, Ctps, Salario, DataAdmissao, DataDemissao, Sexo, Ativo, DataCriacao, DataAtualizacao)
            VALUES (@Nome, @CpfCnpj, @RgIe, @Telefone, @Celular, @Email,
                @Cep, @Endereco, @Numero, @Complemento, @Bairro, @IdCidade,
                @IdCargo, @Pis, @Ctps, @Salario, @DataAdmissao, @DataDemissao, @Sexo, @Ativo, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, f);
    }

    public async Task<bool> UpdateAsync(Funcionario f)
    {
        const string sql = @"
            UPDATE Funcionarios SET
                Nome=@Nome, CpfCnpj=@CpfCnpj, RgIe=@RgIe,
                Telefone=@Telefone, Celular=@Celular, Email=@Email,
                Cep=@Cep, Endereco=@Endereco, Numero=@Numero, Complemento=@Complemento, Bairro=@Bairro, IdCidade=@IdCidade,
                IdCargo=@IdCargo, Pis=@Pis, Ctps=@Ctps, Salario=@Salario,
                DataAdmissao=@DataAdmissao, DataDemissao=@DataDemissao, Sexo=@Sexo,
                Ativo=@Ativo, DataAtualizacao=NOW()
            WHERE Id = @Id";
        return await _connection.ExecuteAsync(sql, f) > 0;
    }

    public async Task<bool> DeleteAsync(int id)
        => await _connection.ExecuteAsync("DELETE FROM Funcionarios WHERE Id = @Id", new { Id = id }) > 0;
}
