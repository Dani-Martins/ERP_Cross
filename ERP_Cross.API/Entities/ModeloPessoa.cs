#nullable enable
namespace ERP_Cross.API.Entities;

public abstract class ModeloPessoa : ModeloBase
{
    public string Nome { get; set; } = string.Empty;
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
    public bool Ativo { get; set; } = true;
}

