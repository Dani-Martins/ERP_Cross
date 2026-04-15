namespace ERP_Cross.API.Entities;

public class Cidade : ModeloBase
{
    public string NomeCidade { get; set; } = string.Empty;
    public string Ddd { get; set; } = string.Empty;
    public int IdEstado { get; set; }
}
