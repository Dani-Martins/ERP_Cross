namespace ERP_Cross.API.Models;

public class CreateParcelaCondicaoPagamentoDto
{
    public int Numero { get; set; }
    public int Dias { get; set; }
    public decimal Percentual { get; set; }
    public int FormaPagamentoId { get; set; }
    public int CondicaoPagamentoId { get; set; }
}

public class UpdateParcelaCondicaoPagamentoDto
{
    public int Numero { get; set; }
    public int Dias { get; set; }
    public decimal Percentual { get; set; }
    public int FormaPagamentoId { get; set; }
    public int CondicaoPagamentoId { get; set; }
}

public class ParcelaCondicaoPagamentoView
{
    public int Id { get; set; }
    public int Numero { get; set; }
    public int Dias { get; set; }
    public decimal Percentual { get; set; }
    public int FormaPagamentoId { get; set; }
    public int CondicaoPagamentoId { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
