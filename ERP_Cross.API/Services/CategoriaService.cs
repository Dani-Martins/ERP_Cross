#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class CategoriaService
{
    private readonly CategoriaRepository _repository;

    public CategoriaService(CategoriaRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Categoria>> GetAllAsync(string? q = null) => await _repository.GetAllAsync(q);
    public async Task<Categoria?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<Categoria> CreateAsync(CreateCategoriaDto dto)
    {
        var categoria = new Categoria
        {
            NomeCategoria = dto.NomeCategoria,
            Descricao = dto.Descricao,
            Ativo = dto.Ativo
        };
        categoria.Id = await _repository.InsertAsync(categoria);
        return categoria;
    }

    public async Task<bool> UpdateAsync(int id, UpdateCategoriaDto dto)
    {
        var categoria = await _repository.GetByIdAsync(id);
        if (categoria == null) return false;

        categoria.NomeCategoria = dto.NomeCategoria;
        categoria.Descricao = dto.Descricao;
        categoria.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(categoria);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}

