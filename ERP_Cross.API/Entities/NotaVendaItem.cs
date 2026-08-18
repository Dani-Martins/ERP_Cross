#nullable enable
namespace ERP_Cross.API.Entities;

public class NotaVendaItem
{
    public long Id { get; set; }
    public string NumeroNota { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string Serie { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public int ProdutoId { get; set; }
    public int UnidadeId { get; set; }
    public decimal Quantidade { get; set; }
    public decimal PrecoUnit { get; set; }
    public decimal DescontoUnit { get; set; }
    public decimal Total { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; }
    public string? NomeProduto { get; set; }
    public string? NomeUnidade { get; set; }
}
