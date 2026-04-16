using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateCargoDto
{
    [Required]
    public string NomeCargo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public decimal SalarioBase { get; set; }
    public bool ExigeCnh { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateCargoDto
{
    [Required]
    public string NomeCargo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public decimal SalarioBase { get; set; }
    public bool ExigeCnh { get; set; }
    public bool Ativo { get; set; } = true;
}

public class CargoView
{
    public int Id { get; set; }
    public string NomeCargo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public decimal SalarioBase { get; set; }
    public bool ExigeCnh { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
