#nullable enable
using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreatePaisDto
{
    [Required]
    public string NomePais { get; set; } = string.Empty;
    [Required]
    public string Sigla { get; set; } = string.Empty;
    [Required]
    public string Ddi { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
}

public class UpdatePaisDto
{
    [Required]
    public string NomePais { get; set; } = string.Empty;
    [Required]
    public string Sigla { get; set; } = string.Empty;
    [Required]
    public string Ddi { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
}

public class PaisView
{
    public int Id { get; set; }
    public string NomePais { get; set; } = string.Empty;
    public string Sigla { get; set; } = string.Empty;
    public string Ddi { get; set; } = string.Empty;
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}

