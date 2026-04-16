using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class ContaReceberRepository
{
    private readonly IDbConnection _db;
    public ContaReceberRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "Id, NumeroNota, Modelo, Serie, ClienteId, NumParcela, ValorParcela, " +
        "DataEmissao, DataVencimento, DataRecebimento, ValorRecebido, Juros, Multa, Desconto, " +
        "Status, FormaPagamentoId, Observacao, CriadoEm, AtualizadoEm";

    public async Task<IEnumerable<ContaReceber>> GetAllAsync()
        => await _db.QueryAsync<ContaReceber>($"SELECT {SelectColumns} FROM ContaReceber");

    public async Task<ContaReceber?> GetByIdAsync(long id)
        => await _db.QueryFirstOrDefaultAsync<ContaReceber>($"SELECT {SelectColumns} FROM ContaReceber WHERE Id = @Id", new { Id = id });

    public async Task<long> InsertAsync(ContaReceber c)
        => await _db.ExecuteScalarAsync<long>(
            @"INSERT INTO ContaReceber (NumeroNota, Modelo, Serie, ClienteId, NumParcela, ValorParcela,
              DataEmissao, DataVencimento, DataRecebimento, ValorRecebido, Juros, Multa, Desconto,
              Status, FormaPagamentoId, Observacao, CriadoEm)
              VALUES (@NumeroNota, @Modelo, @Serie, @ClienteId, @NumParcela, @ValorParcela,
              @DataEmissao, @DataVencimento, @DataRecebimento, @ValorRecebido, @Juros, @Multa, @Desconto,
              @Status, @FormaPagamentoId, @Observacao, NOW());
              SELECT LAST_INSERT_ID();", c);

    public async Task<bool> UpdateAsync(ContaReceber c)
        => await _db.ExecuteAsync(
            @"UPDATE ContaReceber SET NumeroNota=@NumeroNota, Modelo=@Modelo, Serie=@Serie, ClienteId=@ClienteId,
              NumParcela=@NumParcela, ValorParcela=@ValorParcela, DataEmissao=@DataEmissao,
              DataVencimento=@DataVencimento, DataRecebimento=@DataRecebimento, ValorRecebido=@ValorRecebido,
              Juros=@Juros, Multa=@Multa, Desconto=@Desconto, Status=@Status,
              FormaPagamentoId=@FormaPagamentoId, Observacao=@Observacao, AtualizadoEm=NOW()
              WHERE Id=@Id", c) > 0;

    public async Task<bool> DeleteAsync(long id)
        => await _db.ExecuteAsync("DELETE FROM ContaReceber WHERE Id = @Id", new { Id = id }) > 0;
}
