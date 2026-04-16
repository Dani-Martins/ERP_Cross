using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateFuncionarioDto
{
    [Required]
    public string Nome { get; set; } = string.Empty;
    [Required]
    public string CpfCnpj { get; set; } = string.Empty;
    public string? RgIe { get; set; }
    public string? Telefone { get; set; }
    public string? Celular { get; set; }
    public string? Email { get; set; }
    public string? Cep { get; set; }
    public string? Endereco { get; set; }
    public string? Numero { get; set; }
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public int IdCidade { get; set; }
    public int? IdCargo { get; set; }
    public string? Pis { get; set; }
    public string? Ctps { get; set; }
    public decimal? Salario { get; set; }
    public DateTime? DataAdmissao { get; set; }
    public DateTime? DataDemissao { get; set; }
    public string? Sexo { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateFuncionarioDto
{
    [Required]
    public string Nome { get; set; } = string.Empty;
    [Required]
    public string CpfCnpj { get; set; } = string.Empty;
    public string? RgIe { get; set; }
    public string? Telefone { get; set; }
    public string? Celular { get; set; }
    public string? Email { get; set; }
    public string? Cep { get; set; }
    public string? Endereco { get; set; }
    public string? Numero { get; set; }
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public int IdCidade { get; set; }
    public int? IdCargo { get; set; }
    public string? Pis { get; set; }
    public string? Ctps { get; set; }
    public decimal? Salario { get; set; }
    public DateTime? DataAdmissao { get; set; }
    public DateTime? DataDemissao { get; set; }
    public string? Sexo { get; set; }
    public bool Ativo { get; set; } = true;
}

public class FuncionarioView
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string CpfCnpj { get; set; } = string.Empty;
    public string? RgIe { get; set; }
    public string? Telefone { get; set; }
    public string? Celular { get; set; }
    public string? Email { get; set; }
    public string? Cep { get; set; }
    public string? Endereco { get; set; }
    public string? Numero { get; set; }
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public int IdCidade { get; set; }
    public int? IdCargo { get; set; }
    public string? Pis { get; set; }
    public string? Ctps { get; set; }
    public decimal? Salario { get; set; }
    public DateTime? DataAdmissao { get; set; }
    public DateTime? DataDemissao { get; set; }
    public string? Sexo { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
