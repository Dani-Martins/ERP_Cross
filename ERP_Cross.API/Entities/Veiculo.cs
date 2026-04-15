namespace ERP_Cross.API.Entities;

public class Veiculo : ModeloBase
{
    public string Placa { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string? Rntrc { get; set; }
    public bool Ativo { get; set; } = true;
}
