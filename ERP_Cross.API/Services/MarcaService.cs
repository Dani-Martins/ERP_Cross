#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class MarcaService
{
    private readonly MarcaRepository _repository;

    public MarcaService(MarcaRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Marca>> GetAllAsync(string? q = null) => await _repository.GetAllAsync(q);
    public async Task<Marca?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<Marca> CreateAsync(CreateMarcaDto dto)
    {
        var marca = new Marca
        {
            NomeMarca = dto.NomeMarca,
            Descricao = dto.Descricao,
            Ativo = dto.Ativo
        };
        marca.Id = await _repository.InsertAsync(marca);
        return marca;
    }

    public async Task<bool> UpdateAsync(int id, UpdateMarcaDto dto)
    {
        var marca = await _repository.GetByIdAsync(id);
        if (marca == null) return false;

        marca.NomeMarca = dto.NomeMarca;
        marca.Descricao = dto.Descricao;
        marca.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(marca);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}

