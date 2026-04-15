namespace ERP_Cross.API.Entities;

public class UnidadeMedida : ModeloBase
{
    public string NomeUnidade { get; set; } = string.Empty;
    public string? Sigla { get; set; }
    public bool Ativo { get; set; } = true;
}
