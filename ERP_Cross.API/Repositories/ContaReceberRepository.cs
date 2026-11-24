#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class ContaReceberRepository
{
    private readonly IDbConnection _db;
    public ContaReceberRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "cr.Id, cr.NumeroNota, cr.Modelo, cr.Serie, cr.ClienteId, cr.NumParcela, cr.ValorParcela, " +
        "cr.DataEmissao, cr.DataVencimento, cr.DataRecebimento, cr.DataCancelamento, cr.ValorRecebido, cr.Juros, cr.Multa, cr.Desconto, " +
        "cr.Status, cr.Ativo, cr.FormaPagamentoId, cr.Observacao, cr.CriadoEm, cr.AtualizadoEm, " +
        "cl.Nome AS NomeCliente, fp.NomeFormaPagamento";

    private const string FromJoin = @"
        FROM ContaReceber cr
        LEFT JOIN Clientes cl ON cr.ClienteId = cl.Id
        LEFT JOIN FormasPagamento fp ON cr.FormaPagamentoId = fp.Id";

    public async Task<IEnumerable<ContaReceber>> GetAllAsync()
        => await _db.QueryAsync<ContaReceber>($"SELECT {SelectColumns} {FromJoin} WHERE cr.Ativo = 1");

    public async Task<ContaReceber?> GetByIdAsync(long id)
        => await _db.QueryFirstOrDefaultAsync<ContaReceber>($"SELECT {SelectColumns} {FromJoin} WHERE cr.Id = @Id", new { Id = id });

    public async Task<IEnumerable<ContaReceber>> GetByNotaAsync(string numeroNota, string modelo, string serie, int clienteId, IDbTransaction? transaction = null)
        => await _db.QueryAsync<ContaReceber>(
            $"SELECT {SelectColumns} {FromJoin} WHERE cr.NumeroNota=@NumeroNota AND cr.Modelo=@Modelo AND cr.Serie=@Serie AND cr.ClienteId=@ClienteId AND cr.Ativo=1 ORDER BY cr.NumParcela, cr.Id",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId }, transaction);

    public async Task<bool> CancelarNotaSemRecebimentosAsync(string numeroNota, string modelo, string serie, int clienteId, IDbTransaction transaction)
    {
            var parcelas = (await _db.QueryAsync<long>(
                @"SELECT Id FROM ContaReceber
                  WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId
                  FOR UPDATE",
                new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId }, transaction)).ToList();
            if (parcelas.Count == 0)
                return false;

            var recebidas = await _db.ExecuteScalarAsync<int>(
                @"SELECT COUNT(*) FROM ContaReceber
                  WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId
                    AND (Status IN ('PAGO', 'RECEBIDO') OR DataRecebimento IS NOT NULL)",
                new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId }, transaction);
            if (recebidas > 0)
                return false;

            var canceladas = await _db.ExecuteAsync(
                @"UPDATE ContaReceber SET Status='CANCELADO', DataCancelamento=NOW(), AtualizadoEm=NOW()
                  WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId
                    AND Ativo=1 AND Status NOT IN ('PAGO', 'RECEBIDO', 'CANCELADO')
                    AND DataRecebimento IS NULL AND DataCancelamento IS NULL",
                new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId }, transaction);
            if (canceladas == 0)
                return false;
            return true;
    }

    public async Task<long> InsertAsync(ContaReceber c, IDbTransaction? transaction = null)
        => await _db.ExecuteScalarAsync<long>(
            @"INSERT INTO ContaReceber (NumeroNota, Modelo, Serie, ClienteId, NumParcela, ValorParcela,
              DataEmissao, DataVencimento, DataRecebimento, ValorRecebido, Juros, Multa, Desconto,
              Status, Ativo, FormaPagamentoId, Observacao, CriadoEm)
              VALUES (@NumeroNota, @Modelo, @Serie, @ClienteId, @NumParcela, @ValorParcela,
              @DataEmissao, @DataVencimento, @DataRecebimento, @ValorRecebido, @Juros, @Multa, @Desconto,
              @Status, @Ativo, @FormaPagamentoId, @Observacao, NOW());
              SELECT LAST_INSERT_ID();", c, transaction);

    public async Task<bool> UpdateAsync(ContaReceber c)
        => await _db.ExecuteAsync(
            @"UPDATE ContaReceber SET NumeroNota=@NumeroNota, Modelo=@Modelo, Serie=@Serie, ClienteId=@ClienteId,
              NumParcela=@NumParcela, ValorParcela=@ValorParcela, DataEmissao=@DataEmissao,
              DataVencimento=@DataVencimento, DataRecebimento=@DataRecebimento, ValorRecebido=@ValorRecebido,
              Juros=@Juros, Multa=@Multa, Desconto=@Desconto, Status=@Status, Ativo=@Ativo,
              FormaPagamentoId=@FormaPagamentoId, Observacao=@Observacao, AtualizadoEm=NOW()
              WHERE Id=@Id", c) > 0;

        public async Task<bool> UpdatePendenteDaNotaAsync(ContaReceber c, IDbTransaction? transaction = null)
                => await _db.ExecuteAsync(
                        @"UPDATE ContaReceber SET ValorParcela=@ValorParcela, DataEmissao=@DataEmissao,
                            DataVencimento=@DataVencimento, FormaPagamentoId=@FormaPagamentoId, Observacao=@Observacao,
                            AtualizadoEm=NOW()
                            WHERE Id=@Id AND Ativo=1 AND Status NOT IN ('PAGO', 'RECEBIDO', 'CANCELADO')
                                AND DataRecebimento IS NULL AND DataCancelamento IS NULL", c, transaction) > 0;

    public async Task<bool> DeleteAsync(long id)
        => await _db.ExecuteAsync("UPDATE ContaReceber SET Ativo = 0, AtualizadoEm = NOW() WHERE Id = @Id", new { Id = id }) > 0;

    public async Task<bool> ArquivarPendenteAsync(long id, IDbTransaction? transaction = null)
        => await _db.ExecuteAsync(
            @"UPDATE ContaReceber SET Ativo=0, AtualizadoEm=NOW()
              WHERE Id=@Id AND Ativo=1 AND Status NOT IN ('PAGO', 'RECEBIDO', 'CANCELADO')
                AND DataRecebimento IS NULL AND DataCancelamento IS NULL",
            new { Id = id }, transaction) > 0;

        public async Task<bool> ArquivarDuplicataCanceladaAsync(long id, IDbTransaction? transaction = null)
                => await _db.ExecuteAsync(
                        @"UPDATE ContaReceber SET Ativo=0, AtualizadoEm=NOW()
                            WHERE Id=@Id AND Ativo=1 AND Status='CANCELADO' AND DataCancelamento IS NOT NULL",
                        new { Id = id }, transaction) > 0;

        public async Task<bool> RegistrarRecebimentoAsync(long id, DateTime dataRecebimento, decimal valorRecebido)
                => await _db.ExecuteAsync(
                        @"UPDATE ContaReceber SET Status = 'PAGO', DataRecebimento = @DataRecebimento,
                            ValorRecebido = @ValorRecebido, AtualizadoEm = NOW()
                            WHERE Id = @Id AND Status NOT IN ('PAGO', 'RECEBIDO', 'CANCELADO')",
                        new { Id = id, DataRecebimento = dataRecebimento, ValorRecebido = valorRecebido }) > 0;

        public async Task<bool> CancelarAsync(long id)
                => await _db.ExecuteAsync(
                        @"UPDATE ContaReceber SET Status = 'CANCELADO', DataCancelamento = NOW(), AtualizadoEm = NOW()
                            WHERE Id = @Id AND Status NOT IN ('PAGO', 'RECEBIDO', 'CANCELADO')",
                        new { Id = id }) > 0;

        public async Task<int> CancelarDaParcelaEmDianteAsync(ContaReceber parcela)
                => await _db.ExecuteAsync(
                        @"UPDATE ContaReceber SET Status = 'CANCELADO', DataCancelamento = NOW(), AtualizadoEm = NOW()
                            WHERE NumeroNota = @NumeroNota AND Modelo = @Modelo AND Serie = @Serie AND ClienteId = @ClienteId
                                AND NumParcela >= @NumParcela AND Ativo = 1
                                AND Status NOT IN ('PAGO', 'RECEBIDO', 'CANCELADO')",
                        parcela);

        public async Task<int> CancelarPendentesDaNotaAsync(string numeroNota, string modelo, string serie, int clienteId, IDbTransaction? transaction = null)
                => await _db.ExecuteAsync(
                        @"UPDATE ContaReceber SET Status='CANCELADO', DataCancelamento=NOW(), AtualizadoEm=NOW()
                            WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId
                                AND Ativo=1 AND Status NOT IN ('PAGO', 'RECEBIDO', 'CANCELADO')",
                        new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId }, transaction);

        public async Task<int> ExcluirPendentesDaNotaAsync(string numeroNota, string modelo, string serie, int clienteId)
                => await _db.ExecuteAsync(
                        @"DELETE FROM ContaReceber
                            WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId
                                AND Status NOT IN ('PAGO', 'RECEBIDO', 'CANCELADO')",
                        new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId });

    public async Task<long> GetProximoNumeroNotaAsync()
    {
        const string sql = "SELECT COALESCE(MAX(CAST(NumeroNota AS UNSIGNED)), 0) + 1 FROM ContaReceber";
        return await _db.ExecuteScalarAsync<long>(sql);
    }

    public async Task<int> BaixaLoteAsync(IEnumerable<long> ids, DateTime dataRecebimento)
    {
        const string sql = @"
            UPDATE ContaReceber
            SET Status = 'PAGO', DataRecebimento = @DataRecebimento,
                ValorRecebido = ValorParcela, AtualizadoEm = NOW()
            WHERE Id IN @Ids AND Status NOT IN ('PAGO','CANCELADO')";
        return await _db.ExecuteAsync(sql, new { Ids = ids, DataRecebimento = dataRecebimento });
    }
}

