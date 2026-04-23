#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class CondicaoPagamentoService
{
    private readonly CondicaoPagamentoRepository _repository;

    public CondicaoPagamentoService(CondicaoPagamentoRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CondicaoPagamento>> GetAllAsync(string? q = null) => await _repository.GetAllAsync(q);
    public async Task<CondicaoPagamento?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<CondicaoPagamento> CreateAsync(CreateCondicaoPagamentoDto dto)
    {
        var condicao = new CondicaoPagamento
        {
            NomeCondicao = dto.NomeCondicao,
            TaxaJuros = dto.TaxaJuros,
            Multa = dto.Multa,
            Desconto = dto.Desconto,
            Ativo = dto.Ativo
        };
        condicao.Id = await _repository.InsertAsync(condicao);
        return condicao;
    }

    public async Task<bool> UpdateAsync(int id, UpdateCondicaoPagamentoDto dto)
    {
        var condicao = await _repository.GetByIdAsync(id);
        if (condicao == null) return false;

        condicao.NomeCondicao = dto.NomeCondicao;
        condicao.TaxaJuros = dto.TaxaJuros;
        condicao.Multa = dto.Multa;
        condicao.Desconto = dto.Desconto;
        condicao.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(condicao);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}

