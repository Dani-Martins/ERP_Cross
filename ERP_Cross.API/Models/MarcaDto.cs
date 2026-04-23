#nullable enable
using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateMarcaDto
{
    [Required]
    public string NomeMarca { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateMarcaDto
{
    [Required]
    public string NomeMarca { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativo { get; set; } = true;
}

public class MarcaView
{
    public int Id { get; set; }
    public string NomeMarca { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}

