#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class NotaVendaProdutoRepository
{
    private readonly IDbConnection _db;
    public NotaVendaProdutoRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "nvp.NumeroNota, nvp.Modelo, nvp.Serie, nvp.ClienteId, nvp.ProdutoId, nvp.UnidadeId, nvp.Quantidade, nvp.QuantidadeBaixada, nvp.PrecoUnit, nvp.Desconto, nvp.Total, nvp.Ativo, nvp.CriadoEm, " +
        "pr.NomeProduto, cl.Nome AS NomeCliente";

    private const string FromJoin = @"
        FROM NotaVendaProduto nvp
        LEFT JOIN Produto pr ON nvp.ProdutoId = pr.Id
        LEFT JOIN Clientes cl ON nvp.ClienteId = cl.Id";

    public async Task<IEnumerable<NotaVendaProduto>> GetByNotaVendaAsync(string numeroNota, string modelo, string serie, int clienteId, IDbTransaction? transaction = null)
        => await _db.QueryAsync<NotaVendaProduto>(
            $"SELECT {SelectColumns} {FromJoin} WHERE nvp.NumeroNota=@NumeroNota AND nvp.Modelo=@Modelo AND nvp.Serie=@Serie AND nvp.ClienteId=@ClienteId" + (transaction != null ? " FOR UPDATE" : ""),
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId }, transaction);

    public async Task<NotaVendaProduto?> GetByKeyAsync(string numeroNota, string modelo, string serie, int clienteId, int produtoId, IDbTransaction? transaction = null)
        => await _db.QueryFirstOrDefaultAsync<NotaVendaProduto>(
            $"SELECT {SelectColumns} {FromJoin} WHERE nvp.NumeroNota=@NumeroNota AND nvp.Modelo=@Modelo AND nvp.Serie=@Serie AND nvp.ClienteId=@ClienteId AND nvp.ProdutoId=@ProdutoId" + (transaction != null ? " FOR UPDATE" : ""),
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId, ProdutoId = produtoId }, transaction);

    public async Task<bool> InsertAsync(NotaVendaProduto p, IDbTransaction? transaction = null)
        => await _db.ExecuteAsync(
            @"INSERT INTO NotaVendaProduto (NumeroNota, Modelo, Serie, ClienteId, ProdutoId, UnidadeId, Quantidade, QuantidadeBaixada, PrecoUnit, Desconto, Total, Ativo, CriadoEm)
              VALUES (@NumeroNota, @Modelo, @Serie, @ClienteId, @ProdutoId, @UnidadeId, @Quantidade, @QuantidadeBaixada, @PrecoUnit, @Desconto, @Total, @Ativo, NOW())", p, transaction) > 0;

    public async Task<bool> UpdateAsync(NotaVendaProduto p, IDbTransaction? transaction = null)
        => await _db.ExecuteAsync(
            @"UPDATE NotaVendaProduto SET UnidadeId=@UnidadeId, Quantidade=@Quantidade, QuantidadeBaixada=@QuantidadeBaixada, PrecoUnit=@PrecoUnit, Desconto=@Desconto, Total=@Total, Ativo=@Ativo
              WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId AND ProdutoId=@ProdutoId", p, transaction) > 0;

    public async Task<bool> DeleteAsync(string numeroNota, string modelo, string serie, int clienteId, int produtoId, IDbTransaction? transaction = null)
        => await _db.ExecuteAsync(
            "UPDATE NotaVendaProduto SET Ativo = 0 WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId AND ProdutoId=@ProdutoId AND Ativo=1",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId, ProdutoId = produtoId }, transaction) > 0;
}

