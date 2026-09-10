#nullable enable
namespace ERP_Cross.API.Entities;

public class Fornecedor : ModeloPessoa
{
    public string? NomeFantasia { get; set; }
    public int IdCondicaoPagamento { get; set; }
    public int? IdTransportadora { get; set; }
    public string? NomeCidade { get; set; }
    public string? NomeCondicaoPagamento { get; set; }
    public string? NomeTransportadora { get; set; }
}
