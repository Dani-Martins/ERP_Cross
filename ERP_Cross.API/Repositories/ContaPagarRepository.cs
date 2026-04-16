using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class ContaPagarRepository
{
    private readonly IDbConnection _db;
    public ContaPagarRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "Id, NotaCompraId, FornecedorId, Modelo, Serie, NumeroNota, NumParcela, ValorParcela, " +
        "DataEmissao, DataVencimento, DataPagamento, ValorPago, Juros, Multa, Desconto, " +
        "Status, FormaPagamentoId, Observacao, CriadoEm, AtualizadoEm";

    public async Task<IEnumerable<ContaPagar>> GetAllAsync()
        => await _db.QueryAsync<ContaPagar>($"SELECT {SelectColumns} FROM ContaPagar");

    public async Task<ContaPagar?> GetByIdAsync(long id)
        => await _db.QueryFirstOrDefaultAsync<ContaPagar>($"SELECT {SelectColumns} FROM ContaPagar WHERE Id = @Id", new { Id = id });

    public async Task<long> InsertAsync(ContaPagar c)
        => await _db.ExecuteScalarAsync<long>(
            @"INSERT INTO ContaPagar (NotaCompraId, FornecedorId, Modelo, Serie, NumeroNota, NumParcela, ValorParcela,
              DataEmissao, DataVencimento, DataPagamento, ValorPago, Juros, Multa, Desconto,
              Status, FormaPagamentoId, Observacao, CriadoEm)
              VALUES (@NotaCompraId, @FornecedorId, @Modelo, @Serie, @NumeroNota, @NumParcela, @ValorParcela,
              @DataEmissao, @DataVencimento, @DataPagamento, @ValorPago, @Juros, @Multa, @Desconto,
              @Status, @FormaPagamentoId, @Observacao, NOW());
              SELECT LAST_INSERT_ID();", c);

    public async Task<bool> UpdateAsync(ContaPagar c)
        => await _db.ExecuteAsync(
            @"UPDATE ContaPagar SET NotaCompraId=@NotaCompraId, FornecedorId=@FornecedorId, Modelo=@Modelo,
              Serie=@Serie, NumeroNota=@NumeroNota, NumParcela=@NumParcela, ValorParcela=@ValorParcela,
              DataEmissao=@DataEmissao, DataVencimento=@DataVencimento, DataPagamento=@DataPagamento,
              ValorPago=@ValorPago, Juros=@Juros, Multa=@Multa, Desconto=@Desconto,
              Status=@Status, FormaPagamentoId=@FormaPagamentoId, Observacao=@Observacao, AtualizadoEm=NOW()
              WHERE Id=@Id", c) > 0;

    public async Task<bool> DeleteAsync(long id)
        => await _db.ExecuteAsync("DELETE FROM ContaPagar WHERE Id = @Id", new { Id = id }) > 0;
}
