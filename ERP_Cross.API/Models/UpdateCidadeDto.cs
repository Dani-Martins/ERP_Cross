namespace ERP_Cross.API.Models;

public class UpdateCidadeDto
{
    public string NomeCidade { get; set; } = string.Empty;
    public string Ddd { get; set; } = string.Empty;
    public int IdEstado { get; set; }
}
