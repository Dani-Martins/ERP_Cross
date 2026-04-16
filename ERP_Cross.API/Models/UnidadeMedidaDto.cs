using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateUnidadeMedidaDto
{
    [Required]
    public string NomeUnidade { get; set; } = string.Empty;
    public string? Sigla { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateUnidadeMedidaDto
{
    [Required]
    public string NomeUnidade { get; set; } = string.Empty;
    public string? Sigla { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UnidadeMedidaView
{
    public int Id { get; set; }
    public string NomeUnidade { get; set; } = string.Empty;
    public string? Sigla { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
