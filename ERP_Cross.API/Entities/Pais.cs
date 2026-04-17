namespace ERP_Cross.API.Entities;

public class Pais : ModeloBase
{
    public string NomePais { get; set; } = string.Empty;
    public string Sigla { get; set; } = string.Empty;
    public string Ddi { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
}
