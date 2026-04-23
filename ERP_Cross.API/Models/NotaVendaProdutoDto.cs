#nullable enable
using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateNotaVendaProdutoDto
{
    [Required]
    public string NumeroNota { get; set; } = string.Empty;
    [Required]
    public string Modelo { get; set; } = string.Empty;
    [Required]
    public string Serie { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public int ProdutoId { get; set; }
    public decimal Quantidade { get; set; }
    public decimal PrecoUnit { get; set; }
    public decimal Desconto { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateNotaVendaProdutoDto
{
    public decimal Quantidade { get; set; }
    public decimal PrecoUnit { get; set; }
    public decimal Desconto { get; set; }
    public bool Ativo { get; set; } = true;
}

public class NotaVendaProdutoView
{
    public string NumeroNota { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string Serie { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public int ProdutoId { get; set; }
    public decimal Quantidade { get; set; }
    public decimal PrecoUnit { get; set; }
    public decimal Desconto { get; set; }
    public bool Ativo { get; set; }
    public DateTime CriadoEm { get; set; }
    public string? NomeProduto { get; set; }
    public string? NomeCliente { get; set; }
}

