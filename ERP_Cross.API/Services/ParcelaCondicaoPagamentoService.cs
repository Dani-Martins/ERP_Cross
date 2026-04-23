#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class ParcelaCondicaoPagamentoService
{
    private readonly ParcelaCondicaoPagamentoRepository _repository;
    public ParcelaCondicaoPagamentoService(ParcelaCondicaoPagamentoRepository repository) { _repository = repository; }

    public async Task<IEnumerable<ParcelaCondicaoPagamento>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<IEnumerable<ParcelaCondicaoPagamento>> GetByCondicaoIdAsync(int condicaoId) => await _repository.GetByCondicaoIdAsync(condicaoId);
    public async Task<ParcelaCondicaoPagamento?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<ParcelaCondicaoPagamento> CreateAsync(CreateParcelaCondicaoPagamentoDto dto)
    {
        var p = new ParcelaCondicaoPagamento
        {
            Numero = dto.Numero, Dias = dto.Dias, Percentual = dto.Percentual,
            FormaPagamentoId = dto.FormaPagamentoId, CondicaoPagamentoId = dto.CondicaoPagamentoId,
            Ativo = dto.Ativo
        };
        p.Id = await _repository.InsertAsync(p);
        return p;
    }

    public async Task<bool> UpdateAsync(int id, UpdateParcelaCondicaoPagamentoDto dto)
    {
        var p = await _repository.GetByIdAsync(id);
        if (p == null) return false;

        p.Numero = dto.Numero; p.Dias = dto.Dias; p.Percentual = dto.Percentual;
        p.FormaPagamentoId = dto.FormaPagamentoId; p.CondicaoPagamentoId = dto.CondicaoPagamentoId;
        p.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(p);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}

