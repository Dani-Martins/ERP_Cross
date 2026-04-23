#nullable enable
namespace ERP_Cross.API.Entities;

public class Veiculo : ModeloBase
{
    public string Placa { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string? Marca { get; set; }
    public int? Ano { get; set; }
    public string? Descricao { get; set; }
    public bool Ativo { get; set; } = true;
}

