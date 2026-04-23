#nullable enable
namespace ERP_Cross.API.Entities;

public class Produto : ModeloBase
{
    public string NomeProduto { get; set; } = string.Empty;
    public int? UnidadeId { get; set; }
    public int? MarcaId { get; set; }
    public int? CategoriaId { get; set; }
    public string? Descricao { get; set; }
    public string? CodigoBarras { get; set; }
    public decimal CustoCompra { get; set; }
    public decimal PrecoVenda { get; set; }
    public decimal LucroPercentual { get; set; }
    public decimal Estoque { get; set; }
    public decimal EstoqueMinimo { get; set; }
    public bool Ativo { get; set; } = true;
    public string? NomeUnidade { get; set; }
    public string? NomeMarca { get; set; }
    public string? NomeCategoria { get; set; }
}

