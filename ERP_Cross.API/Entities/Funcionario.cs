#nullable enable
namespace ERP_Cross.API.Entities;

public class Funcionario : ModeloPessoa
{
    public int? IdCargo { get; set; }
    public string? Pis { get; set; }
    public string? Ctps { get; set; }
    public decimal? Salario { get; set; }
    public DateTime? DataAdmissao { get; set; }
    public DateTime? DataDemissao { get; set; }
    public string? Sexo { get; set; }
    public string? NomeCidade { get; set; }
    public string? NomeCargo { get; set; }
}

