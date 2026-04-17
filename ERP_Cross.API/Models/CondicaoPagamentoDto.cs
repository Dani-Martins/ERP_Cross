using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateCondicaoPagamentoDto
{
    [Required]
    public string NomeCondicao { get; set; } = string.Empty;
    public decimal TaxaJuros { get; set; }
    public decimal Multa { get; set; }
    public decimal Desconto { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateCondicaoPagamentoDto
{
    [Required]
    public string NomeCondicao { get; set; } = string.Empty;
    public decimal TaxaJuros { get; set; }
    public decimal Multa { get; set; }
    public decimal Desconto { get; set; }
    public bool Ativo { get; set; } = true;
}

public class CondicaoPagamentoView
{
    public int Id { get; set; }
    public string NomeCondicao { get; set; } = string.Empty;
    public decimal TaxaJuros { get; set; }
    public decimal Multa { get; set; }
    public decimal Desconto { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
