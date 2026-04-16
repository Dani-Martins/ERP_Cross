using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class NotaVendaProdutoRepository
{
    private readonly IDbConnection _db;
    public NotaVendaProdutoRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "NumeroNota, Modelo, Serie, ClienteId, ProdutoId, Quantidade, PrecoUnit, Desconto, CriadoEm";

    public async Task<IEnumerable<NotaVendaProduto>> GetByNotaVendaAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _db.QueryAsync<NotaVendaProduto>(
            $"SELECT {SelectColumns} FROM NotaVendaProduto WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId });

    public async Task<NotaVendaProduto?> GetByKeyAsync(string numeroNota, string modelo, string serie, int clienteId, int produtoId)
        => await _db.QueryFirstOrDefaultAsync<NotaVendaProduto>(
            $"SELECT {SelectColumns} FROM NotaVendaProduto WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId AND ProdutoId=@ProdutoId",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId, ProdutoId = produtoId });

    public async Task<bool> InsertAsync(NotaVendaProduto p)
        => await _db.ExecuteAsync(
            @"INSERT INTO NotaVendaProduto (NumeroNota, Modelo, Serie, ClienteId, ProdutoId, Quantidade, PrecoUnit, Desconto, CriadoEm)
              VALUES (@NumeroNota, @Modelo, @Serie, @ClienteId, @ProdutoId, @Quantidade, @PrecoUnit, @Desconto, NOW())", p) > 0;

    public async Task<bool> UpdateAsync(NotaVendaProduto p)
        => await _db.ExecuteAsync(
            @"UPDATE NotaVendaProduto SET Quantidade=@Quantidade, PrecoUnit=@PrecoUnit, Desconto=@Desconto
              WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId AND ProdutoId=@ProdutoId", p) > 0;

    public async Task<bool> DeleteAsync(string numeroNota, string modelo, string serie, int clienteId, int produtoId)
        => await _db.ExecuteAsync(
            "DELETE FROM NotaVendaProduto WHERE NumeroNota=@NumeroNota AND Modelo=@Modelo AND Serie=@Serie AND ClienteId=@ClienteId AND ProdutoId=@ProdutoId",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId, ProdutoId = produtoId }) > 0;
}
