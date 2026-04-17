using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class NotaVendaProdutoRepository
{
    private readonly IDbConnection _db;
    public NotaVendaProdutoRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "nvp.NumeroNota, nvp.Modelo, nvp.Serie, nvp.ClienteId, nvp.ProdutoId, nvp.Quantidade, nvp.PrecoUnit, nvp.Desconto, nvp.Ativo, nvp.CriadoEm, " +
        "pr.NomeProduto, cl.Nome AS NomeCliente";

    private const string FromJoin = @"
        FROM NotaVendaProduto nvp
        LEFT JOIN Produto pr ON nvp.ProdutoId = pr.Id
        LEFT JOIN Clientes cl ON nvp.ClienteId = cl.Id";

    public async Task<IEnumerable<NotaVendaProduto>> GetByNotaVendaAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _db.QueryAsync<NotaVendaProduto>(
            $"SELECT {SelectColumns} {FromJoin} WHERE nvp.NumeroNota=@NumeroNota AND nvp.Modelo=@Modelo AND nvp.Serie=@Serie AND nvp.ClienteId=@ClienteId",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId });

    public async Task<NotaVendaProduto?> GetByKeyAsync(string numeroNota, string modelo, string serie, int clienteId, int produtoId)
        => await _db.QueryFirstOrDefaultAsync<NotaVendaProduto>(
            $"SELECT {SelectColumns} {FromJoin} WHERE nvp.NumeroNota=@NumeroNota AND nvp.Modelo=@Modelo AND nvp.Serie=@Serie AND nvp.ClienteId=@ClienteId AND nvp.ProdutoId=@ProdutoId",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId, ProdutoId = produtoId });

    public async Task<bool> InsertAsync(NotaVendaProduto p)
        => await _db.ExecuteAsync(
            @"INSERT INTO NotaVendaProduto (NumeroNota, Modelo, Serie, ClienteId, ProdutoId, Quantidade, PrecoUnit, Desconto, Ativo, CriadoEm)
              VALUES (@NumeroNota, @Modelo, @Serie, @ClienteId, @ProdutoId, @Quantidade, @PrecoUnit, @Desconto, @Ativo, NOW())", p) > 0;

    public async Task<bool> UpdateAsync(NotaVendaProduto p)
        => await _db.ExecuteAsync(
            @"UPDATE NotaVendaProduto SET Quantidade=@Quantidade, PrecoUnit=@PrecoUnit, Desconto=@Desconto, Ativo=@Ativo
              WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId AND ProdutoId=@ProdutoId", p) > 0;

    public async Task<bool> DeleteAsync(string numeroNota, string modelo, string serie, int clienteId, int produtoId)
        => await _db.ExecuteAsync(
            "DELETE FROM NotaVendaProduto WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId AND ProdutoId=@ProdutoId",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId, ProdutoId = produtoId }) > 0;
}
