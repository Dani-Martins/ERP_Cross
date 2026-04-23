#nullable enable
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

    public async Task<IEnumerable<Estado>> GetAllAsync(string? q = null)
    {
        return await _repository.GetAllAsync(q);
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
            IdPais = dto.IdPais,
            Ativo = dto.Ativo
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
        estado.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(estado);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }
}

