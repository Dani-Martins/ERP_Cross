using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateContaReceberDto
{
    [Required]
    public string NumeroNota { get; set; } = string.Empty;
    [Required]
    public string Modelo { get; set; } = string.Empty;
    [Required]
    public string Serie { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public int NumParcela { get; set; }
    public decimal ValorParcela { get; set; }
    public DateTime DataEmissao { get; set; }
    public DateTime DataVencimento { get; set; }
    public DateTime? DataRecebimento { get; set; }
    public decimal? ValorRecebido { get; set; }
    public decimal Juros { get; set; }
    public decimal Multa { get; set; }
    public decimal Desconto { get; set; }
    public string Status { get; set; } = "ABERTO";
    public bool Ativo { get; set; } = true;
    public int? FormaPagamentoId { get; set; }
    public string? Observacao { get; set; }
}

public class UpdateContaReceberDto
{
    [Required]
    public string NumeroNota { get; set; } = string.Empty;
    [Required]
    public string Modelo { get; set; } = string.Empty;
    [Required]
    public string Serie { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public int NumParcela { get; set; }
    public decimal ValorParcela { get; set; }
    public DateTime DataEmissao { get; set; }
    public DateTime DataVencimento { get; set; }
    public DateTime? DataRecebimento { get; set; }
    public decimal? ValorRecebido { get; set; }
    public decimal Juros { get; set; }
    public decimal Multa { get; set; }
    public decimal Desconto { get; set; }
    public string Status { get; set; } = "ABERTO";
    public bool Ativo { get; set; } = true;
    public int? FormaPagamentoId { get; set; }
    public string? Observacao { get; set; }
}

public class ContaReceberView
{
    public long Id { get; set; }
    public string NumeroNota { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string Serie { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public int NumParcela { get; set; }
    public decimal ValorParcela { get; set; }
    public DateTime DataEmissao { get; set; }
    public DateTime DataVencimento { get; set; }
    public DateTime? DataRecebimento { get; set; }
    public decimal? ValorRecebido { get; set; }
    public decimal Juros { get; set; }
    public decimal Multa { get; set; }
    public decimal Desconto { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool Ativo { get; set; }
    public int? FormaPagamentoId { get; set; }
    public string? Observacao { get; set; }
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }
    public string? NomeCliente { get; set; }
    public string? NomeFormaPagamento { get; set; }
}
