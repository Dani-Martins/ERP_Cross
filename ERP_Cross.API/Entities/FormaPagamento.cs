#nullable enable
namespace ERP_Cross.API.Entities;

public class FormaPagamento : ModeloBase
{
    public string NomeFormaPagamento { get; set; } = string.Empty;
    public bool AceitaParcela { get; set; }
    public bool Ativo { get; set; } = true;
}

