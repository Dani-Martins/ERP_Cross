#nullable enable
namespace ERP_Cross.API.Entities;

public abstract class ModeloBase
{
    public int Id { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataAtualizacao { get; set; }
}

