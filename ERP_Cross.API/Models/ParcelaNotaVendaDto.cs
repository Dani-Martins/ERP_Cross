#nullable enable
using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateParcelaNotaVendaDto
{
    [Required]
    public string NumeroNota { get; set; } = string.Empty;
    [Required]
    public string Modelo { get; set; } = string.Empty;
    [Required]
    public string Serie { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public int NumParcela { get; set; }
    public int? FormaPagamentoId { get; set; }
    public DateTime DataVencimento { get; set; }
    public decimal ValorParcela { get; set; }
    public bool Pago { get; set; } = false;
    public DateTime? DataPagamento { get; set; }
}

public class UpdateParcelaNotaVendaDto
{
    public int? FormaPagamentoId { get; set; }
    public DateTime DataVencimento { get; set; }
    public decimal ValorParcela { get; set; }
    public bool Pago { get; set; }
    public DateTime? DataPagamento { get; set; }
}

public class ParcelaNotaVendaView
{
    public long Id { get; set; }
    public string NumeroNota { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string Serie { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public int NumParcela { get; set; }
    public int? FormaPagamentoId { get; set; }
    public DateTime DataVencimento { get; set; }
    public decimal ValorParcela { get; set; }
    public bool Pago { get; set; }
    public DateTime? DataPagamento { get; set; }
    public DateTime CriadoEm { get; set; }
    public string? NomeFormaPagamento { get; set; }
}
