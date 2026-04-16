using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class CargoService
{
    private readonly CargoRepository _repository;

    public CargoService(CargoRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Cargo>> GetAllAsync(string? q = null) => await _repository.GetAllAsync(q);
    public async Task<Cargo?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<Cargo> CreateAsync(CreateCargoDto dto)
    {
        var cargo = new Cargo
        {
            NomeCargo = dto.NomeCargo,
            Descricao = dto.Descricao,
            SalarioBase = dto.SalarioBase,
            ExigeCnh = dto.ExigeCnh,
            Ativo = dto.Ativo
        };
        cargo.Id = await _repository.InsertAsync(cargo);
        return cargo;
    }

    public async Task<bool> UpdateAsync(int id, UpdateCargoDto dto)
    {
        var cargo = await _repository.GetByIdAsync(id);
        if (cargo == null) return false;

        cargo.NomeCargo = dto.NomeCargo;
        cargo.Descricao = dto.Descricao;
        cargo.SalarioBase = dto.SalarioBase;
        cargo.ExigeCnh = dto.ExigeCnh;
        cargo.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(cargo);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}
