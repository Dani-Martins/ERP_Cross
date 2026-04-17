using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateFormaPagamentoDto
{
    [Required]
    public string NomeFormaPagamento { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
}

public class UpdateFormaPagamentoDto
{
    [Required]
    public string NomeFormaPagamento { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
}

public class FormaPagamentoView
{
    public int Id { get; set; }
    public string NomeFormaPagamento { get; set; } = string.Empty;
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
