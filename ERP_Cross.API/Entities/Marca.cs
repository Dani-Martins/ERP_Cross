namespace ERP_Cross.API.Entities;

public class Marca : ModeloBase
{
    public string NomeMarca { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativo { get; set; } = true;
}
