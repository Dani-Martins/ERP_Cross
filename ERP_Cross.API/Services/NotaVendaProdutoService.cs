using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class NotaVendaProdutoService
{
    private readonly NotaVendaProdutoRepository _repository;
    public NotaVendaProdutoService(NotaVendaProdutoRepository repository) { _repository = repository; }

    public async Task<IEnumerable<NotaVendaProduto>> GetByNotaVendaAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _repository.GetByNotaVendaAsync(numeroNota, modelo, serie, clienteId);

    public async Task<NotaVendaProduto?> GetByKeyAsync(string numeroNota, string modelo, string serie, int clienteId, int produtoId)
        => await _repository.GetByKeyAsync(numeroNota, modelo, serie, clienteId, produtoId);

    public async Task<NotaVendaProduto?> CreateAsync(CreateNotaVendaProdutoDto dto)
    {
        var p = new NotaVendaProduto
        {
            NumeroNota = dto.NumeroNota, Modelo = dto.Modelo, Serie = dto.Serie, ClienteId = dto.ClienteId,
            ProdutoId = dto.ProdutoId, Quantidade = dto.Quantidade, PrecoUnit = dto.PrecoUnit, Desconto = dto.Desconto
        };
        var ok = await _repository.InsertAsync(p);
        return ok ? p : null;
    }

    public async Task<bool> UpdateAsync(string numeroNota, string modelo, string serie, int clienteId, int produtoId, UpdateNotaVendaProdutoDto dto)
    {
        var p = await _repository.GetByKeyAsync(numeroNota, modelo, serie, clienteId, produtoId);
        if (p == null) return false;

        p.Quantidade = dto.Quantidade; p.PrecoUnit = dto.PrecoUnit; p.Desconto = dto.Desconto;

        return await _repository.UpdateAsync(p);
    }

    public async Task<bool> DeleteAsync(string numeroNota, string modelo, string serie, int clienteId, int produtoId)
        => await _repository.DeleteAsync(numeroNota, modelo, serie, clienteId, produtoId);
}
