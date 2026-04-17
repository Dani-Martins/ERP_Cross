namespace ERP_Cross.API.Entities;

public class Cliente : ModeloPessoa
{
    public string? NomeFantasia { get; set; }
    public bool Pf { get; set; } = true;
    public DateTime? DataNascimento { get; set; }
    public string? Sexo { get; set; }
    public int? IdCondicaoPagamento { get; set; }
    public decimal LimiteCredito { get; set; }
    public string? NomeCidade { get; set; }
    public string? NomeCondicaoPagamento { get; set; }
}
