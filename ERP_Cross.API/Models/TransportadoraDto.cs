#nullable enable
using System.ComponentModel.DataAnnotations;

namespace ERP_Cross.API.Models;

public class CreateTransportadoraDto
{
    [Required]
    public string Nome { get; set; } = string.Empty;
    public string? NomeFantasia { get; set; }
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
    public string? TipoPessoa { get; set; }
    public int? IdCondicaoPagamento { get; set; }
    public bool Ativo { get; set; } = true;
}

public class UpdateTransportadoraDto
{
    [Required]
    public string Nome { get; set; } = string.Empty;
    public string? NomeFantasia { get; set; }
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
    public string? TipoPessoa { get; set; }
    public int? IdCondicaoPagamento { get; set; }
    public bool Ativo { get; set; } = true;
}

public class TransportadoraView
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? NomeFantasia { get; set; }
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
    public string? TipoPessoa { get; set; }
    public int? IdCondicaoPagamento { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
    public string? NomeCidade { get; set; }
    public string? NomeCondicaoPagamento { get; set; }
}

