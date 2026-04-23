#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class VeiculoService
{
    private readonly VeiculoRepository _repository;

    public VeiculoService(VeiculoRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Veiculo>> GetAllAsync(string? q = null) => await _repository.GetAllAsync(q);
    public async Task<Veiculo?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<Veiculo> CreateAsync(CreateVeiculoDto dto)
    {
        var veiculo = new Veiculo
        {
            Placa = dto.Placa,
            Modelo = dto.Modelo,
            Marca = dto.Marca,
            Ano = dto.Ano,
            Descricao = dto.Descricao,
            Ativo = dto.Ativo
        };
        veiculo.Id = await _repository.InsertAsync(veiculo);
        return veiculo;
    }

    public async Task<bool> UpdateAsync(int id, UpdateVeiculoDto dto)
    {
        var veiculo = await _repository.GetByIdAsync(id);
        if (veiculo == null) return false;

        veiculo.Placa = dto.Placa;
        veiculo.Modelo = dto.Modelo;
        veiculo.Marca = dto.Marca;
        veiculo.Ano = dto.Ano;
        veiculo.Descricao = dto.Descricao;
        veiculo.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(veiculo);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}

