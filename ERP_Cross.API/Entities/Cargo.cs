namespace ERP_Cross.API.Entities;

public class Cargo : ModeloBase
{
    public string NomeCargo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public decimal SalarioBase { get; set; }
    public bool ExigeCnh { get; set; }
    public bool Ativo { get; set; } = true;
}
