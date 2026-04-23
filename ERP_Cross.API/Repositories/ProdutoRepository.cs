#nullable enable
using System.Data;
using Dapper;
using ERP_Cross.API.Entities;

namespace ERP_Cross.API.Repositories;

public class ProdutoRepository
{
    private readonly IDbConnection _db;
    public ProdutoRepository(IDbConnection db) { _db = db; }

    private const string SelectColumns =
        "p.Id, p.NomeProduto, p.UnidadeId, p.MarcaId, p.CategoriaId, p.Descricao, p.CodigoBarras, " +
        "p.CustoCompra, p.PrecoVenda, p.LucroPercentual, p.Estoque, p.EstoqueMinimo, p.Ativo, p.DataCriacao, p.DataAtualizacao, " +
        "um.NomeUnidade, m.NomeMarca, cat.NomeCategoria";

    private const string FromJoin = @"
        FROM Produto p
        LEFT JOIN UnidadesMedida um ON p.UnidadeId = um.Id
        LEFT JOIN Marcas m ON p.MarcaId = m.Id
        LEFT JOIN Categorias cat ON p.CategoriaId = cat.Id";

    public async Task<IEnumerable<Produto>> GetAllAsync(string? q = null)
    {
        var sql = $"SELECT {SelectColumns} {FromJoin}";
        if (!string.IsNullOrWhiteSpace(q))
            sql += " WHERE p.NomeProduto LIKE @q";
        return await _db.QueryAsync<Produto>(sql, new { q = $"%{q}%" });
    }

    public async Task<Produto?> GetByIdAsync(int id)
        => await _db.QueryFirstOrDefaultAsync<Produto>($"SELECT {SelectColumns} {FromJoin} WHERE p.Id = @Id", new { Id = id });

    public async Task<int> InsertAsync(Produto p)
        => await _db.ExecuteScalarAsync<int>(
            @"INSERT INTO Produto (NomeProduto, UnidadeId, MarcaId, CategoriaId, Descricao, CodigoBarras,
              CustoCompra, PrecoVenda, LucroPercentual, Estoque, EstoqueMinimo, Ativo, DataCriacao)
              VALUES (@NomeProduto, @UnidadeId, @MarcaId, @CategoriaId, @Descricao, @CodigoBarras,
              @CustoCompra, @PrecoVenda, @LucroPercentual, @Estoque, @EstoqueMinimo, @Ativo, NOW());
              SELECT LAST_INSERT_ID();", p);

    public async Task<bool> UpdateAsync(Produto p)
        => await _db.ExecuteAsync(
            @"UPDATE Produto SET NomeProduto=@NomeProduto, UnidadeId=@UnidadeId, MarcaId=@MarcaId,
              CategoriaId=@CategoriaId, Descricao=@Descricao, CodigoBarras=@CodigoBarras,
              CustoCompra=@CustoCompra, PrecoVenda=@PrecoVenda, LucroPercentual=@LucroPercentual,
              Estoque=@Estoque, EstoqueMinimo=@EstoqueMinimo, Ativo=@Ativo, DataAtualizacao=NOW()
              WHERE Id=@Id", p) > 0;

    public async Task<bool> DeleteAsync(int id)
        => await _db.ExecuteAsync("DELETE FROM Produto WHERE Id = @Id", new { Id = id }) > 0;
}

