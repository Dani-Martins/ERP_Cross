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
        "p.Id, p.NomeProduto, p.Referencia, p.UnidadeId, p.MarcaId, p.CategoriaId, p.Descricao, p.CodigoBarras, " +
        "p.CustoCompra, p.PrecoVenda, p.LucroPercentual, p.Estoque, p.EstoqueAnterior, p.EstoqueMinimo, p.Ativo, p.DataCriacao, p.DataAtualizacao, " +
        "um.NomeUnidade, um.Sigla AS SiglaUnidade, m.NomeMarca, cat.NomeCategoria";

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

    public async Task<Produto?> GetByIdAsync(int id, IDbTransaction? transaction = null)
        => await _db.QueryFirstOrDefaultAsync<Produto>($"SELECT {SelectColumns} {FromJoin} WHERE p.Id = @Id", new { Id = id }, transaction);

    public async Task<int> InsertAsync(Produto p)
        => await _db.ExecuteScalarAsync<int>(
            @"INSERT INTO Produto (NomeProduto, Referencia, UnidadeId, MarcaId, CategoriaId, Descricao, CodigoBarras,
              CustoCompra, PrecoVenda, LucroPercentual, Estoque, EstoqueMinimo, Ativo, DataCriacao)
              VALUES (@NomeProduto, @Referencia, @UnidadeId, @MarcaId, @CategoriaId, @Descricao, @CodigoBarras,
              @CustoCompra, @PrecoVenda, @LucroPercentual, @Estoque, @EstoqueMinimo, @Ativo, NOW());
              SELECT LAST_INSERT_ID();", p);

    public async Task<bool> UpdateAsync(Produto p)
        => await _db.ExecuteAsync(
            @"UPDATE Produto SET NomeProduto=@NomeProduto, Referencia=@Referencia, UnidadeId=@UnidadeId, MarcaId=@MarcaId,
              CategoriaId=@CategoriaId, Descricao=@Descricao, CodigoBarras=@CodigoBarras,
              PrecoVenda=@PrecoVenda, LucroPercentual=@LucroPercentual,
              Ativo=@Ativo, DataAtualizacao=NOW()
              WHERE Id=@Id", p) > 0;

    public async Task<bool> AjustarEstoqueAsync(int id, decimal delta, IDbTransaction? transaction = null)
    {
        if (transaction == null) throw new ArgumentException("Uma transação é necessária para movimentar o estoque.");
        var produto = await BloquearProdutoAsync(id, transaction);
        if (produto == null || produto.Estoque + delta < 0) return false;
        if (delta == 0) return true;
        await GarantirSaldoInicialAsync(produto, transaction);
        await InserirMovimentoAsync(id, "ESTOQUE", delta, null, null, transaction);
        await AtualizarSaldoAsync(produto, produto.Estoque + delta, null, transaction);
        return true;
    }

    public async Task RegistrarCompraAsync(int id, long itemId, decimal quantidade, decimal custoUnitario, IDbTransaction transaction)
    {
        var produto = await BloquearProdutoAsync(id, transaction)
            ?? throw new ArgumentException("Produto informado não foi encontrado.");
        await GarantirSaldoInicialAsync(produto, transaction);
        var custo = CalcularMedia(produto.Estoque, produto.CustoCompra, quantidade, custoUnitario);
        await InserirMovimentoAsync(id, "COMPRA", quantidade, custoUnitario, itemId, transaction);
        await AtualizarSaldoAsync(produto, produto.Estoque + quantidade, custo, transaction);
    }

    public async Task<bool> EstornarCompraAsync(int id, long itemId, decimal quantidade, decimal custoUnitario, IDbTransaction transaction)
    {
        var produto = await BloquearProdutoAsync(id, transaction)
            ?? throw new ArgumentException("Produto informado não foi encontrado.");
        await GarantirSaldoInicialAsync(produto, transaction);
        var saldoDesejado = Math.Max(0, produto.Estoque - quantidade);
        var insuficiente = produto.Estoque < quantidade;
        var movimentos = (await _db.QueryAsync<MovimentoEstoque>(
            "SELECT Id, Tipo, Quantidade, CustoUnitario, NotaCompraItemId, Cancelado FROM EstoqueMovimento WHERE ProdutoId=@Id ORDER BY Id",
            new { Id = id }, transaction)).ToList();
        var compra = movimentos.SingleOrDefault(m => m.Tipo == "COMPRA" && m.NotaCompraItemId == itemId && !m.Cancelado);
        decimal custo;
        if (compra == null)
        {
            custo = EstimarCustoAposEstorno(produto.Estoque, produto.CustoCompra, quantidade, custoUnitario);
            await InserirMovimentoAsync(id, "ESTORNO_ANTIGO", quantidade, custoUnitario, itemId, transaction);
        }
        else
        {
            await _db.ExecuteAsync("UPDATE EstoqueMovimento SET Cancelado=1 WHERE Id=@Id", new { compra.Id }, transaction);
            compra.Cancelado = true;
            var (saldoRecalculado, custoRecalculado) = RecalcularMovimentos(movimentos);
            custo = custoRecalculado;
            // Vendas anteriores podem zerar o saldo durante o recálculo; preserve o estorno do saldo atual.
            var ajuste = saldoDesejado - saldoRecalculado;
            if (ajuste != 0)
                await InserirMovimentoAsync(id, "AJUSTE", ajuste, null, null, transaction);
        }
        await AtualizarSaldoAsync(produto, saldoDesejado, custo, transaction);
        return insuficiente;
    }

    private sealed class MovimentoEstoque
    {
        public long Id { get; set; }
        public string Tipo { get; set; } = "";
        public decimal Quantidade { get; set; }
        public decimal? CustoUnitario { get; set; }
        public long? NotaCompraItemId { get; set; }
        public bool Cancelado { get; set; }
    }

    private async Task<Produto?> BloquearProdutoAsync(int id, IDbTransaction transaction)
        => await _db.QueryFirstOrDefaultAsync<Produto>(
            "SELECT Id, Estoque, CustoCompra FROM Produto WHERE Id=@Id FOR UPDATE", new { Id = id }, transaction);

    private async Task GarantirSaldoInicialAsync(Produto produto, IDbTransaction transaction)
    {
        var existe = await _db.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM EstoqueMovimento WHERE ProdutoId=@Id", new { produto.Id }, transaction);
        if (existe == 0)
            await InserirMovimentoAsync(produto.Id, "INICIAL", produto.Estoque, produto.CustoCompra, null, transaction);
    }

    private async Task InserirMovimentoAsync(int produtoId, string tipo, decimal quantidade, decimal? custo, long? itemId, IDbTransaction transaction)
        => await _db.ExecuteAsync(
            @"INSERT INTO EstoqueMovimento (ProdutoId, NotaCompraItemId, Tipo, Quantidade, CustoUnitario)
              VALUES (@ProdutoId, @ItemId, @Tipo, @Quantidade, @Custo)",
            new { ProdutoId = produtoId, ItemId = itemId, Tipo = tipo, Quantidade = quantidade, Custo = custo }, transaction);

    private async Task AtualizarSaldoAsync(Produto produto, decimal saldo, decimal? custo, IDbTransaction transaction)
    {
        if (custo.HasValue)
            await _db.ExecuteAsync(
                @"UPDATE Produto SET EstoqueAnterior=@Anterior, Estoque=@Saldo, CustoCompra=@Custo,
                  PrecoVenda=@Custo * (1 + LucroPercentual / 100), DataAtualizacao=NOW() WHERE Id=@Id",
                new { produto.Id, Anterior = produto.Estoque, Saldo = saldo, Custo = custo.Value }, transaction);
        else
            await _db.ExecuteAsync(
                "UPDATE Produto SET EstoqueAnterior=@Anterior, Estoque=@Saldo, DataAtualizacao=NOW() WHERE Id=@Id",
                new { produto.Id, Anterior = produto.Estoque, Saldo = saldo }, transaction);
    }

    private static decimal CalcularMedia(decimal saldo, decimal custo, decimal quantidade, decimal novoCusto)
        => Math.Round((saldo * custo + quantidade * novoCusto) / (saldo + quantidade), 2, MidpointRounding.AwayFromZero);

    private static decimal EstimarCustoAposEstorno(decimal saldo, decimal custo, decimal quantidade, decimal custoUnitario)
    {
        var restante = Math.Max(0, saldo - quantidade);
        return restante == 0 ? 0 : Math.Max(0, Math.Round((saldo * custo - quantidade * custoUnitario) / restante, 2, MidpointRounding.AwayFromZero));
    }

    private static (decimal Saldo, decimal Custo) RecalcularMovimentos(IEnumerable<MovimentoEstoque> movimentos)
    {
        decimal saldo = 0, custo = 0;
        foreach (var movimento in movimentos)
        {
            if (movimento.Cancelado) continue;
            switch (movimento.Tipo)
            {
                case "INICIAL":
                    saldo = movimento.Quantidade;
                    custo = movimento.CustoUnitario ?? throw new InvalidOperationException("Custo inicial do estoque não registrado.");
                    break;
                case "COMPRA":
                    var custoCompra = movimento.CustoUnitario ?? throw new InvalidOperationException("Custo da compra não registrado.");
                    custo = CalcularMedia(saldo, custo, movimento.Quantidade, custoCompra);
                    saldo += movimento.Quantidade;
                    break;
                case "ESTOQUE":
                case "AJUSTE":
                    saldo = Math.Max(0, saldo + movimento.Quantidade);
                    break;
                case "ESTORNO_ANTIGO":
                    var custoAntigo = movimento.CustoUnitario ?? throw new InvalidOperationException("Custo do estorno não registrado.");
                    custo = EstimarCustoAposEstorno(saldo, custo, movimento.Quantidade, custoAntigo);
                    saldo = Math.Max(0, saldo - movimento.Quantidade);
                    break;
                default:
                    throw new InvalidOperationException($"Tipo de movimento de estoque desconhecido: {movimento.Tipo}.");
            }
        }
        return (saldo, custo);
    }

    public async Task<bool> DeleteAsync(int id)
        => await _db.ExecuteAsync("UPDATE Produto SET Ativo = 0, DataAtualizacao = NOW() WHERE Id = @Id", new { Id = id }) > 0;

    public async Task<bool> CodigoBarrasExistsAsync(string codigoBarras, int? excludeId = null)
    {
        const string sql = "SELECT COUNT(1) FROM Produto WHERE CodigoBarras = @CodigoBarras AND (@ExcludeId IS NULL OR Id != @ExcludeId)";
        var count = await _db.ExecuteScalarAsync<int>(sql, new { CodigoBarras = codigoBarras, ExcludeId = excludeId });
        return count > 0;
    }
}

