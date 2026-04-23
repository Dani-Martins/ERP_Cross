#nullable enable
namespace ERP_Cross.API.Entities;

public class NotaVenda
{
    public string NumeroNota { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string Serie { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public DateTime DataEmissao { get; set; }
    public int? TransportadoraId { get; set; }
    public string? PlacaVeiculo { get; set; }
    public string TipoFrete { get; set; } = "CIF";
    public decimal ValorFrete { get; set; }
    public decimal TotalProdutos { get; set; }
    public decimal TotalPagar { get; set; }
    public int? CondicaoPagamentoId { get; set; }
    public string? Observacao { get; set; }
    public string? Status { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }
    public string? NomeCliente { get; set; }
    public string? NomeCondicaoPagamento { get; set; }
    public string? NomeTransportadora { get; set; }
}

