namespace ERP_Cross.API.Entities;

public class Fornecedor : ModeloPessoa
{
    public string? NomeFantasia { get; set; }
    public int IdCondicaoPagamento { get; set; }
}
