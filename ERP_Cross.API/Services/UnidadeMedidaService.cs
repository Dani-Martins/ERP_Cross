using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class UnidadeMedidaService
{
    private readonly UnidadeMedidaRepository _repository;

    public UnidadeMedidaService(UnidadeMedidaRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<UnidadeMedida>> GetAllAsync(string? q = null) => await _repository.GetAllAsync(q);
    public async Task<UnidadeMedida?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<UnidadeMedida> CreateAsync(CreateUnidadeMedidaDto dto)
    {
        var unidade = new UnidadeMedida
        {
            NomeUnidade = dto.NomeUnidade,
            Sigla = dto.Sigla,
            Ativo = dto.Ativo
        };
        unidade.Id = await _repository.InsertAsync(unidade);
        return unidade;
    }

    public async Task<bool> UpdateAsync(int id, UpdateUnidadeMedidaDto dto)
    {
        var unidade = await _repository.GetByIdAsync(id);
        if (unidade == null) return false;

        unidade.NomeUnidade = dto.NomeUnidade;
        unidade.Sigla = dto.Sigla;
        unidade.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(unidade);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}
