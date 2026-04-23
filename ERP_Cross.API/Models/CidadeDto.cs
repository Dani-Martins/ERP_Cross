#nullable enable
using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateCidadeDto
{
    [Required]
    public string NomeCidade { get; set; } = string.Empty;
    [Required]
    public string Ddd { get; set; } = string.Empty;
    public int IdEstado { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateCidadeDto
{
    [Required]
    public string NomeCidade { get; set; } = string.Empty;
    [Required]
    public string Ddd { get; set; } = string.Empty;
    public int IdEstado { get; set; }
    public bool Ativo { get; set; } = true;
}

public class CidadeView
{
    public int Id { get; set; }
    public string NomeCidade { get; set; } = string.Empty;
    public string Ddd { get; set; } = string.Empty;
    public int IdEstado { get; set; }
    public bool Ativo { get; set; }
    public string? NomeEstado { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}

