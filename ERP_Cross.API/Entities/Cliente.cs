#nullable enable
namespace ERP_Cross.API.Entities;

public class Cliente : ModeloPessoa
{
    public string? NomeFantasia { get; set; }
    public bool Pf { get; set; } = true;
    public DateTime? DataNascimento { get; set; }
    public string? Sexo { get; set; }
    public int? IdCondicaoPagamento { get; set; }
    public bool FuncionalKids { get; set; } = false;
    public string? NomeResponsavel { get; set; }
    public string? CpfResponsavel { get; set; }
    public string? ParentescoResponsavel { get; set; }
    public string? Observacao { get; set; }
    public string? NomeCidade { get; set; }
    public string? NomeCondicaoPagamento { get; set; }
}

