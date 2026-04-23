#nullable enable
using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateNotaCompraDto
{
    public int FornecedorId { get; set; }
    [Required]
    public string Modelo { get; set; } = string.Empty;
    [Required]
    public string Serie { get; set; } = string.Empty;
    [Required]
    public string NumeroNota { get; set; } = string.Empty;
    public DateTime DataEmissao { get; set; }
    public string? ChaveAcesso { get; set; }
    public string TipoFrete { get; set; } = "CIF";
    public decimal ValorFrete { get; set; }
    public decimal ValorSeguro { get; set; }
    public decimal OutrasDespesas { get; set; }
    public decimal TotalProdutos { get; set; }
    public decimal TotalPagar { get; set; }
    public int? CondicaoPagamentoId { get; set; }
    public int? TransportadoraId { get; set; }
    public string? PlacaVeiculo { get; set; }
    public string? Observacao { get; set; }
    public string? Status { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateNotaCompraDto
{
    public int FornecedorId { get; set; }
    [Required]
    public string Modelo { get; set; } = string.Empty;
    [Required]
    public string Serie { get; set; } = string.Empty;
    [Required]
    public string NumeroNota { get; set; } = string.Empty;
    public DateTime DataEmissao { get; set; }
    public string? ChaveAcesso { get; set; }
    public string TipoFrete { get; set; } = "CIF";
    public decimal ValorFrete { get; set; }
    public decimal ValorSeguro { get; set; }
    public decimal OutrasDespesas { get; set; }
    public decimal TotalProdutos { get; set; }
    public decimal TotalPagar { get; set; }
    public int? CondicaoPagamentoId { get; set; }
    public int? TransportadoraId { get; set; }
    public string? PlacaVeiculo { get; set; }
    public string? Observacao { get; set; }
    public string? Status { get; set; }
    public bool Ativo { get; set; } = true;
}

public class NotaCompraView
{
    public long Id { get; set; }
    public int FornecedorId { get; set; }
    public string Modelo { get; set; } = string.Empty;
    public string Serie { get; set; } = string.Empty;
    public string NumeroNota { get; set; } = string.Empty;
    public DateTime DataEmissao { get; set; }
    public string? ChaveAcesso { get; set; }
    public string TipoFrete { get; set; } = string.Empty;
    public decimal ValorFrete { get; set; }
    public decimal ValorSeguro { get; set; }
    public decimal OutrasDespesas { get; set; }
    public decimal TotalProdutos { get; set; }
    public decimal TotalPagar { get; set; }
    public int? CondicaoPagamentoId { get; set; }
    public int? TransportadoraId { get; set; }
    public string? PlacaVeiculo { get; set; }
    public string? Observacao { get; set; }
    public string? Status { get; set; }
    public bool Ativo { get; set; }
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }
    public string? NomeFornecedor { get; set; }
    public string? NomeCondicaoPagamento { get; set; }
    public string? NomeTransportadora { get; set; }
}

