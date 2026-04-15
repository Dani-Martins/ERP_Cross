namespace ERP_Cross.API.Entities;

public class Estado : ModeloBase
{
    public string NomeEstado { get; set; } = string.Empty;
    public string Uf { get; set; } = string.Empty;
    public int IdPais { get; set; }
}
