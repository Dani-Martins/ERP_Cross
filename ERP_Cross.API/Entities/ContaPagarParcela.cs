#nullable enable
namespace ERP_Cross.API.Entities;

public class ContaPagarParcela
{
    public long Id { get; set; }
    public long ContaPagarId { get; set; }
    public int NumParcela { get; set; }
    public DateTime DataVencimento { get; set; }
    public decimal ValorParcela { get; set; }
    public bool Pago { get; set; }
    public DateTime? DataPagamento { get; set; }
    public decimal? ValorPago { get; set; }
}
