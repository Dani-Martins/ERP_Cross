using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class EstadoService
{
    private readonly EstadoRepository _repository;

    public EstadoService(EstadoRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Estado>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Estado?> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Estado> CreateAsync(CreateEstadoDto dto)
    {
        var estado = new Estado
        {
            NomeEstado = dto.NomeEstado,
            Uf = dto.Uf,
            IdPais = dto.IdPais
        };

        estado.Id = await _repository.InsertAsync(estado);
        return estado;
    }

    public async Task<bool> UpdateAsync(int id, UpdateEstadoDto dto)
    {
        var estado = await _repository.GetByIdAsync(id);
        if (estado == null) return false;

        estado.NomeEstado = dto.NomeEstado;
        estado.Uf = dto.Uf;
        estado.IdPais = dto.IdPais;

        return await _repository.UpdateAsync(estado);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }
}
