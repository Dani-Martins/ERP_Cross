namespace ERP_Cross.API.Entities;

public class FormaPagamento : ModeloBase
{
    public string NomeFormaPagamento { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
}
