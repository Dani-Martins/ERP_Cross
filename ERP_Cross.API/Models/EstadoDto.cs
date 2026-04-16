using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateEstadoDto
{
    [Required]
    public string NomeEstado { get; set; } = string.Empty;
    [Required]
    public string Uf { get; set; } = string.Empty;
    public int IdPais { get; set; }
}

public class UpdateEstadoDto
{
    [Required]
    public string NomeEstado { get; set; } = string.Empty;
    [Required]
    public string Uf { get; set; } = string.Empty;
    public int IdPais { get; set; }
}

public class EstadoView
{
    public int Id { get; set; }
    public string NomeEstado { get; set; } = string.Empty;
    public string Uf { get; set; } = string.Empty;
    public int IdPais { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
