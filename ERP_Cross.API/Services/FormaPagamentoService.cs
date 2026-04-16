using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class FormaPagamentoService
{
    private readonly FormaPagamentoRepository _repository;

    public FormaPagamentoService(FormaPagamentoRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<FormaPagamento>> GetAllAsync(string? q = null) => await _repository.GetAllAsync(q);
    public async Task<FormaPagamento?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<FormaPagamento> CreateAsync(CreateFormaPagamentoDto dto)
    {
        var forma = new FormaPagamento { NomeFormaPagamento = dto.NomeFormaPagamento };
        forma.Id = await _repository.InsertAsync(forma);
        return forma;
    }

    public async Task<bool> UpdateAsync(int id, UpdateFormaPagamentoDto dto)
    {
        var forma = await _repository.GetByIdAsync(id);
        if (forma == null) return false;

        forma.NomeFormaPagamento = dto.NomeFormaPagamento;
        return await _repository.UpdateAsync(forma);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}
