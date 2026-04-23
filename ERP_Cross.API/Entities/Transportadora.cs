#nullable enable
namespace ERP_Cross.API.Entities;

public class Transportadora : ModeloPessoa
{
    public string? NomeFantasia { get; set; }
    public string? TipoPessoa { get; set; }
    public int? IdCondicaoPagamento { get; set; }
    public string? NomeCidade { get; set; }
    public string? NomeCondicaoPagamento { get; set; }
}

