using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateCategoriaDto
{
    [Required]
    public string NomeCategoria { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateCategoriaDto
{
    [Required]
    public string NomeCategoria { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativo { get; set; } = true;
}

public class CategoriaView
{
    public int Id { get; set; }
    public string NomeCategoria { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
