#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class CidadeService
{
    private readonly CidadeRepository _repository;

    public CidadeService(CidadeRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Cidade>> GetAllAsync(string? q = null)
    {
        return await _repository.GetAllAsync(q);
    }

    public async Task<Cidade?> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Cidade> CreateAsync(CreateCidadeDto dto)
    {
        var cidade = new Cidade
        {
            NomeCidade = dto.NomeCidade,
            Ddd = dto.Ddd,
            IdEstado = dto.IdEstado,
            Ativo = dto.Ativo
        };

        cidade.Id = await _repository.InsertAsync(cidade);
        return cidade;
    }

    public async Task<bool> UpdateAsync(int id, UpdateCidadeDto dto)
    {
        var cidade = await _repository.GetByIdAsync(id);
        if (cidade == null) return false;

        cidade.NomeCidade = dto.NomeCidade;
        cidade.Ddd = dto.Ddd;
        cidade.IdEstado = dto.IdEstado;
        cidade.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(cidade);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }
}

