#nullable enable
namespace ERP_Cross.API.Entities;

public class CondicaoPagamento : ModeloBase
{
    public string NomeCondicao { get; set; } = string.Empty;
    public decimal TaxaJuros { get; set; }
    public decimal Multa { get; set; }
    public decimal Desconto { get; set; }
    public bool Ativo { get; set; } = true;
}

