#nullable enable
using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateContaReceberDto
{
    [Required, RegularExpression(@"^\d{1,9}$", ErrorMessage = "Número da nota deve conter até 9 dígitos.")]
    public string NumeroNota { get; set; } = string.Empty;
    [Required, RegularExpression(@"^\d{1,3}$", ErrorMessage = "Modelo deve conter até 3 dígitos.")]
    public string Modelo { get; set; } = string.Empty;
    [Required, RegularExpression(@"^\d{1,3}$", ErrorMessage = "Série deve conter até 3 dígitos.")]
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
    [StringLength(20, ErrorMessage = "Status deve ter no maximo 20 caracteres.")]
    public string Status { get; set; } = "ABERTO";
    public bool Ativo { get; set; } = true;
    public int? FormaPagamentoId { get; set; }
    public string? Observacao { get; set; }
}

public class UpdateContaReceberDto
{
    [Required, RegularExpression(@"^\d{1,9}$", ErrorMessage = "Número da nota deve conter até 9 dígitos.")]
    public string NumeroNota { get; set; } = string.Empty;
    [Required, RegularExpression(@"^\d{1,3}$", ErrorMessage = "Modelo deve conter até 3 dígitos.")]
    public string Modelo { get; set; } = string.Empty;
    [Required, RegularExpression(@"^\d{1,3}$", ErrorMessage = "Série deve conter até 3 dígitos.")]
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
    [StringLength(20, ErrorMessage = "Status deve ter no maximo 20 caracteres.")]
    public string Status { get; set; } = "ABERTO";
    public bool Ativo { get; set; } = true;
    public int? FormaPagamentoId { get; set; }
    public string? Observacao { get; set; }
}

public class CreateContaReceberLoteDto
{
    public int ClienteId { get; set; }
    public decimal ValorTotal { get; set; }
    public DateTime DataEmissao { get; set; }
    public string? Observacao { get; set; }
    [StringLength(20)]
    public string Status { get; set; } = "ABERTO";
    public bool Ativo { get; set; } = true;
}

public class CreateContaReceberParcelasDto
{
    [Required, RegularExpression(@"^\d{1,9}$", ErrorMessage = "Número da nota deve conter até 9 dígitos.")]
    public string NumeroNota { get; set; } = string.Empty;
    [Required, RegularExpression(@"^\d{1,3}$", ErrorMessage = "Modelo deve conter até 3 dígitos.")]
    public string Modelo { get; set; } = string.Empty;
    [Required, RegularExpression(@"^\d{1,3}$", ErrorMessage = "Série deve conter até 3 dígitos.")]
    public string Serie { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public DateTime DataEmissao { get; set; }
    [Required, MinLength(1)]
    public List<ContaReceberParcelaInput> Parcelas { get; set; } = new();
    public decimal Juros { get; set; }
    public decimal Multa { get; set; }
    public decimal Desconto { get; set; }
    public int? FormaPagamentoId { get; set; }
    public string? Observacao { get; set; }
}

public class ContaReceberParcelaInput
{
    public int NumParcela { get; set; }
    public DateTime DataVencimento { get; set; }
    [Range(0.01, double.MaxValue)]
    public decimal ValorParcela { get; set; }
    public DateTime? DataRecebimento { get; set; }
}

public class BaixaContaReceberLoteDto
{
    public IEnumerable<long> Ids { get; set; } = [];
    public DateTime DataRecebimento { get; set; }
}

public class RegistrarRecebimentoDto
{
    public DateTime DataRecebimento { get; set; }
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
    public DateTime? DataCancelamento { get; set; }
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

