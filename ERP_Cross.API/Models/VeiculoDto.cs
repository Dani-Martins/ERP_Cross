using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateVeiculoDto
{
    [Required]
    public string Placa { get; set; } = string.Empty;
    [Required]
    public string Modelo { get; set; } = string.Empty;
    public string? Marca { get; set; }
    public int? Ano { get; set; }
    public string? Descricao { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateVeiculoDto
{
    [Required]
    public string Placa { get; set; } = string.Empty;
    [Required]
    public string Modelo { get; set; } = string.Empty;
    public string? Marca { get; set; }
    public int? Ano { get; set; }
    public string? Descricao { get; set; }
    public bool Ativo { get; set; } = true;
}

public class VeiculoView
{
    public int Id { get; set; }
    public string Placa { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string? Marca { get; set; }
    public int? Ano { get; set; }
    public string? Descricao { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
