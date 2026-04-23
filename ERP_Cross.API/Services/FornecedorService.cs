#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class FornecedorService
{
    private readonly FornecedorRepository _repository;
    public FornecedorService(FornecedorRepository repository) { _repository = repository; }

    public async Task<IEnumerable<Fornecedor>> GetAllAsync(string? q = null) => await _repository.GetAllAsync(q);
    public async Task<Fornecedor?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<Fornecedor> CreateAsync(CreateFornecedorDto dto)
    {
        var f = new Fornecedor
        {
            Nome = dto.Nome, NomeFantasia = dto.NomeFantasia, CpfCnpj = dto.CpfCnpj, RgIe = dto.RgIe,
            Telefone = dto.Telefone, Celular = dto.Celular, Email = dto.Email,
            Cep = dto.Cep, Endereco = dto.Endereco, Numero = dto.Numero, Complemento = dto.Complemento, Bairro = dto.Bairro,
            IdCidade = dto.IdCidade, IdCondicaoPagamento = dto.IdCondicaoPagamento, Ativo = dto.Ativo
        };
        f.Id = await _repository.InsertAsync(f);
        return f;
    }

    public async Task<bool> UpdateAsync(int id, UpdateFornecedorDto dto)
    {
        var f = await _repository.GetByIdAsync(id);
        if (f == null) return false;

        f.Nome = dto.Nome; f.NomeFantasia = dto.NomeFantasia; f.CpfCnpj = dto.CpfCnpj; f.RgIe = dto.RgIe;
        f.Telefone = dto.Telefone; f.Celular = dto.Celular; f.Email = dto.Email;
        f.Cep = dto.Cep; f.Endereco = dto.Endereco; f.Numero = dto.Numero; f.Complemento = dto.Complemento; f.Bairro = dto.Bairro;
        f.IdCidade = dto.IdCidade; f.IdCondicaoPagamento = dto.IdCondicaoPagamento; f.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(f);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}

