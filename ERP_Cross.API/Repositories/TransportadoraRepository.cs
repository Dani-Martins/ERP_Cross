using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class TransportadoraRepository
{
    private readonly IDbConnection _connection;
    public TransportadoraRepository(IDbConnection connection) { _connection = connection; }

    private const string SelectColumns = @"
        t.Id, t.Nome, t.NomeFantasia, t.CpfCnpj, t.RgIe, t.Telefone, t.Celular, t.Email,
        t.Cep, t.Endereco, t.Numero, t.Complemento, t.Bairro, t.IdCidade,
        t.TipoPessoa, t.IdCondicaoPagamento, t.Ativo, t.DataCriacao, t.DataAtualizacao,
        ci.NomeCidade, cp.NomeCondicao AS NomeCondicaoPagamento";

    private const string FromJoin = @"
        FROM Transportadoras t
        LEFT JOIN Cidades ci ON t.IdCidade = ci.Id
        LEFT JOIN CondicoesPagamento cp ON t.IdCondicaoPagamento = cp.Id";

    public async Task<IEnumerable<Transportadora>> GetAllAsync(string? q = null)
    {
        var sql = $"SELECT {SelectColumns} {FromJoin}";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE t.Nome LIKE @q OR t.NomeFantasia LIKE @q";
        return await _connection.QueryAsync<Transportadora>(sql, new { q = $"%{q}%" });
    }

    public async Task<Transportadora?> GetByIdAsync(int id)
        => await _connection.QueryFirstOrDefaultAsync<Transportadora>($"SELECT {SelectColumns} {FromJoin} WHERE t.Id = @Id", new { Id = id });

    public async Task<int> InsertAsync(Transportadora t)
    {
        const string sql = @"
            INSERT INTO Transportadoras (Nome, NomeFantasia, CpfCnpj, RgIe, Telefone, Celular, Email,
                Cep, Endereco, Numero, Complemento, Bairro, IdCidade,
                TipoPessoa, IdCondicaoPagamento, Ativo, DataCriacao, DataAtualizacao)
            VALUES (@Nome, @NomeFantasia, @CpfCnpj, @RgIe, @Telefone, @Celular, @Email,
                @Cep, @Endereco, @Numero, @Complemento, @Bairro, @IdCidade,
                @TipoPessoa, @IdCondicaoPagamento, @Ativo, NOW(), NOW());
            SELECT LAST_INSERT_ID();";
        return await _connection.ExecuteScalarAsync<int>(sql, t);
    }

    public async Task<bool> UpdateAsync(Transportadora t)
    {
        const string sql = @"
            UPDATE Transportadoras SET
                Nome=@Nome, NomeFantasia=@NomeFantasia, CpfCnpj=@CpfCnpj, RgIe=@RgIe,
                Telefone=@Telefone, Celular=@Celular, Email=@Email,
                Cep=@Cep, Endereco=@Endereco, Numero=@Numero, Complemento=@Complemento, Bairro=@Bairro, IdCidade=@IdCidade,
                TipoPessoa=@TipoPessoa, IdCondicaoPagamento=@IdCondicaoPagamento,
                Ativo=@Ativo, DataAtualizacao=NOW()
            WHERE Id = @Id";
        return await _connection.ExecuteAsync(sql, t) > 0;
    }

    public async Task<bool> DeleteAsync(int id)
        => await _connection.ExecuteAsync("DELETE FROM Transportadoras WHERE Id = @Id", new { Id = id }) > 0;
}
