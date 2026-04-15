namespace ERP_Cross.API.Models;

public class UpdateEstadoDto
{
    public string NomeEstado { get; set; } = string.Empty;
    public string Uf { get; set; } = string.Empty;
    public int IdPais { get; set; }
}
