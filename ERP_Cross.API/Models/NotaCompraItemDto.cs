namespace ERP_Cross.API.Models;

public class CreateNotaCompraItemDto
{
    public long NotaCompraId { get; set; }
    public int ProdutoId { get; set; }
    public int UnidadeId { get; set; }
    public decimal Quantidade { get; set; }
    public decimal PrecoUnit { get; set; }
    public decimal DescontoUnit { get; set; }
    public decimal LiquidoUnit { get; set; }
    public decimal Total { get; set; }
    public decimal Rateio { get; set; }
    public decimal CustoFinalUnit { get; set; }
    public decimal CustoFinal { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateNotaCompraItemDto
{
    public long NotaCompraId { get; set; }
    public int ProdutoId { get; set; }
    public int UnidadeId { get; set; }
    public decimal Quantidade { get; set; }
    public decimal PrecoUnit { get; set; }
    public decimal DescontoUnit { get; set; }
    public decimal LiquidoUnit { get; set; }
    public decimal Total { get; set; }
    public decimal Rateio { get; set; }
    public decimal CustoFinalUnit { get; set; }
    public decimal CustoFinal { get; set; }
    public bool Ativo { get; set; } = true;
}

public class NotaCompraItemView
{
    public long Id { get; set; }
    public long NotaCompraId { get; set; }
    public int ProdutoId { get; set; }
    public int UnidadeId { get; set; }
    public decimal Quantidade { get; set; }
    public decimal PrecoUnit { get; set; }
    public decimal DescontoUnit { get; set; }
    public decimal LiquidoUnit { get; set; }
    public decimal Total { get; set; }
    public decimal Rateio { get; set; }
    public decimal CustoFinalUnit { get; set; }
    public decimal CustoFinal { get; set; }
    public bool Ativo { get; set; }
    public DateTime CriadoEm { get; set; }
    public string? NomeProduto { get; set; }
    public string? NomeUnidade { get; set; }
}
