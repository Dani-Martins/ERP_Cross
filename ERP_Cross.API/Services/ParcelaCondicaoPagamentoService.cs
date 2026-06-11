#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class ParcelaCondicaoPagamentoService
{
    private readonly ParcelaCondicaoPagamentoRepository _repository;
    private readonly FormaPagamentoRepository _formaPagamentoRepository;

    public ParcelaCondicaoPagamentoService(ParcelaCondicaoPagamentoRepository repository, FormaPagamentoRepository formaPagamentoRepository)
    {
        _repository = repository;
        _formaPagamentoRepository = formaPagamentoRepository;
    }

    public async Task<IEnumerable<ParcelaCondicaoPagamento>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<IEnumerable<ParcelaCondicaoPagamento>> GetByCondicaoIdAsync(int condicaoId) => await _repository.GetByCondicaoIdAsync(condicaoId);
    public async Task<ParcelaCondicaoPagamento?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<ParcelaCondicaoPagamento> CreateAsync(CreateParcelaCondicaoPagamentoDto dto)
    {
        await ValidarFormaPagamentoAsync(dto.FormaPagamentoId, dto.Numero);

        var p = new ParcelaCondicaoPagamento
        {
            Numero = dto.Numero, Dias = dto.Dias ?? dto.Numero * 30, Percentual = dto.Percentual,
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

        await ValidarFormaPagamentoAsync(dto.FormaPagamentoId, dto.Numero);
        p.Numero = dto.Numero; p.Dias = dto.Dias ?? dto.Numero * 30; p.Percentual = dto.Percentual;
        p.FormaPagamentoId = dto.FormaPagamentoId; p.CondicaoPagamentoId = dto.CondicaoPagamentoId;
        p.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(p);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);

    private async Task ValidarFormaPagamentoAsync(int formaPagamentoId, int numero)
    {
        var forma = await _formaPagamentoRepository.GetByIdAsync(formaPagamentoId);
        if (forma == null)
            throw new ArgumentException("Forma de pagamento informada nao foi encontrada.");
        if (!forma.AceitaParcela && numero > 1)
            throw new ArgumentException($"A forma de pagamento '{forma.NomeFormaPagamento}' nao aceita parcelamento em mais de 1x.");
    }
}

