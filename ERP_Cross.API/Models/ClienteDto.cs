#nullable enable
using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateClienteDto
{
    [Required]
    public string Nome { get; set; } = string.Empty;
    public string? NomeFantasia { get; set; }
    [Required]
    public string CpfCnpj { get; set; } = string.Empty;
    public string? RgIe { get; set; }
    public string? Contato2 { get; set; }
    public string? Celular { get; set; }
    public string? Email { get; set; }
    public string? Cep { get; set; }
    public string? Endereco { get; set; }
    public string? Numero { get; set; }
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public int IdCidade { get; set; }
    public bool Pf { get; set; } = true;
    public DateTime? DataNascimento { get; set; }
    public string? Sexo { get; set; }
    public int? IdCondicaoPagamento { get; set; }
    public decimal LimiteCredito { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateClienteDto
{
    [Required]
    public string Nome { get; set; } = string.Empty;
    public string? NomeFantasia { get; set; }
    [Required]
    public string CpfCnpj { get; set; } = string.Empty;
    public string? RgIe { get; set; }
    public string? Contato2 { get; set; }
    public string? Celular { get; set; }
    public string? Email { get; set; }
    public string? Cep { get; set; }
    public string? Endereco { get; set; }
    public string? Numero { get; set; }
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public int IdCidade { get; set; }
    public bool Pf { get; set; } = true;
    public DateTime? DataNascimento { get; set; }
    public string? Sexo { get; set; }
    public int? IdCondicaoPagamento { get; set; }
    public decimal LimiteCredito { get; set; }
    public bool Ativo { get; set; } = true;
}

public class ClienteView
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? NomeFantasia { get; set; }
    public string CpfCnpj { get; set; } = string.Empty;
    public string? RgIe { get; set; }
    public string? Contato2 { get; set; }
    public string? Celular { get; set; }
    public string? Email { get; set; }
    public string? Cep { get; set; }
    public string? Endereco { get; set; }
    public string? Numero { get; set; }
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public int IdCidade { get; set; }
    public bool Pf { get; set; }
    public DateTime? DataNascimento { get; set; }
    public string? Sexo { get; set; }
    public int? IdCondicaoPagamento { get; set; }
    public decimal LimiteCredito { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
    public string? NomeCidade { get; set; }
    public string? NomeCondicaoPagamento { get; set; }
}

