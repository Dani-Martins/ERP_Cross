#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class ProdutoService
{
    private readonly ProdutoRepository _repository;
    public ProdutoService(ProdutoRepository repository) { _repository = repository; }

    public async Task<IEnumerable<Produto>> GetAllAsync(string? q = null) => await _repository.GetAllAsync(q);
    public async Task<Produto?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<Produto> CreateAsync(CreateProdutoDto dto)
    {
        var p = new Produto
        {
            NomeProduto = dto.NomeProduto, UnidadeId = dto.UnidadeId, MarcaId = dto.MarcaId,
            CategoriaId = dto.CategoriaId, Descricao = dto.Descricao, CodigoBarras = dto.CodigoBarras,
            CustoCompra = dto.CustoCompra, PrecoVenda = dto.PrecoVenda, LucroPercentual = dto.LucroPercentual,
            Estoque = dto.Estoque, EstoqueMinimo = dto.EstoqueMinimo, Ativo = dto.Ativo
        };
        p.Id = await _repository.InsertAsync(p);
        return p;
    }

    public async Task<bool> UpdateAsync(int id, UpdateProdutoDto dto)
    {
        var p = await _repository.GetByIdAsync(id);
        if (p == null) return false;

        p.NomeProduto = dto.NomeProduto; p.UnidadeId = dto.UnidadeId; p.MarcaId = dto.MarcaId;
        p.CategoriaId = dto.CategoriaId; p.Descricao = dto.Descricao; p.CodigoBarras = dto.CodigoBarras;
        p.CustoCompra = dto.CustoCompra; p.PrecoVenda = dto.PrecoVenda; p.LucroPercentual = dto.LucroPercentual;
        p.Estoque = dto.Estoque; p.EstoqueMinimo = dto.EstoqueMinimo; p.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(p);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}

