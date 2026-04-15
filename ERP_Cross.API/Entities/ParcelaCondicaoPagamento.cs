namespace ERP_Cross.API.Entities;

public class ParcelaCondicaoPagamento : ModeloBase
{
    public int Numero { get; set; }
    public int Dias { get; set; }
    public decimal Percentual { get; set; }
    public int FormaPagamentoId { get; set; }
    public int CondicaoPagamentoId { get; set; }
}
