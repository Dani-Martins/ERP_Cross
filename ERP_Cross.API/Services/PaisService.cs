using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class PaisService
{
    private readonly PaisRepository _repository;

    public PaisService(PaisRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Pais>> GetAllAsync(string? q = null)
    {
        return await _repository.GetAllAsync(q);
    }

    public async Task<Pais?> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Pais> CreateAsync(CreatePaisDto dto)
    {
        var pais = new Pais
        {
            NomePais = dto.NomePais,
            Sigla = dto.Sigla,
            Ddi = dto.Ddi,
            Ativo = dto.Ativo
        };

        pais.Id = await _repository.InsertAsync(pais);
        return pais;
    }

    public async Task<bool> UpdateAsync(int id, UpdatePaisDto dto)
    {
        var pais = await _repository.GetByIdAsync(id);
        if (pais == null) return false;

        pais.NomePais = dto.NomePais;
        pais.Sigla = dto.Sigla;
        pais.Ddi = dto.Ddi;
        pais.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(pais);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }
}
