namespace ERP_Cross.API.Entities;

public class ContaPagar
{
    public long Id { get; set; }
    public long? NotaCompraId { get; set; }
    public int FornecedorId { get; set; }
    public string Modelo { get; set; } = string.Empty;
    public string Serie { get; set; } = string.Empty;
    public string NumeroNota { get; set; } = string.Empty;
    public int NumParcela { get; set; }
    public decimal ValorParcela { get; set; }
    public DateTime DataEmissao { get; set; }
    public DateTime DataVencimento { get; set; }
    public DateTime? DataPagamento { get; set; }
    public decimal? ValorPago { get; set; }
    public decimal Juros { get; set; }
    public decimal Multa { get; set; }
    public decimal Desconto { get; set; }
    public string Status { get; set; } = "ABERTO";
    public int? FormaPagamentoId { get; set; }
    public string? Observacao { get; set; }
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }
}
