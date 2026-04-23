#nullable enable
namespace ERP_Cross.API.Entities;

public class Categoria : ModeloBase
{
    public string NomeCategoria { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativo { get; set; } = true;
}

