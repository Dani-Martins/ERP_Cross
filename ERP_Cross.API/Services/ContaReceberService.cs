using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class ContaReceberService
{
    private readonly ContaReceberRepository _repository;
    public ContaReceberService(ContaReceberRepository repository) { _repository = repository; }

    public async Task<IEnumerable<ContaReceber>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<ContaReceber?> GetByIdAsync(long id) => await _repository.GetByIdAsync(id);

    public async Task<ContaReceber> CreateAsync(CreateContaReceberDto dto)
    {
        var c = new ContaReceber
        {
            NumeroNota = dto.NumeroNota, Modelo = dto.Modelo, Serie = dto.Serie, ClienteId = dto.ClienteId,
            NumParcela = dto.NumParcela, ValorParcela = dto.ValorParcela, DataEmissao = dto.DataEmissao,
            DataVencimento = dto.DataVencimento, DataRecebimento = dto.DataRecebimento,
            ValorRecebido = dto.ValorRecebido, Juros = dto.Juros, Multa = dto.Multa,
            Desconto = dto.Desconto, Status = dto.Status, Ativo = dto.Ativo, FormaPagamentoId = dto.FormaPagamentoId,
            Observacao = dto.Observacao
        };
        c.Id = await _repository.InsertAsync(c);
        return c;
    }

    public async Task<bool> UpdateAsync(long id, UpdateContaReceberDto dto)
    {
        var c = await _repository.GetByIdAsync(id);
        if (c == null) return false;

        c.NumeroNota = dto.NumeroNota; c.Modelo = dto.Modelo; c.Serie = dto.Serie; c.ClienteId = dto.ClienteId;
        c.NumParcela = dto.NumParcela; c.ValorParcela = dto.ValorParcela; c.DataEmissao = dto.DataEmissao;
        c.DataVencimento = dto.DataVencimento; c.DataRecebimento = dto.DataRecebimento;
        c.ValorRecebido = dto.ValorRecebido; c.Juros = dto.Juros; c.Multa = dto.Multa;
        c.Desconto = dto.Desconto; c.Status = dto.Status; c.Ativo = dto.Ativo; c.FormaPagamentoId = dto.FormaPagamentoId;
        c.Observacao = dto.Observacao;

        return await _repository.UpdateAsync(c);
    }

    public async Task<bool> DeleteAsync(long id) => await _repository.DeleteAsync(id);
}
