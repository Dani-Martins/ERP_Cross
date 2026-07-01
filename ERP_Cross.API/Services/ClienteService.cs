#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class ClienteService
{
    private readonly ClienteRepository _repository;
    public ClienteService(ClienteRepository repository) { _repository = repository; }

    public async Task<IEnumerable<Cliente>> GetAllAsync(string? q = null) => await _repository.GetAllAsync(q);
    public async Task<Cliente?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<Cliente> CreateAsync(CreateClienteDto dto)
    {
        if (await _repository.CpfCnpjExistsAsync(dto.CpfCnpj))
            throw new InvalidOperationException($"Já existe um cliente cadastrado com o CPF/CNPJ '{dto.CpfCnpj}'.");

        var c = new Cliente
        {
            Nome = dto.Nome, NomeFantasia = dto.NomeFantasia, CpfCnpj = dto.CpfCnpj, RgIe = dto.RgIe,
            Contato2 = dto.Contato2, Celular = dto.Celular, Email = dto.Email,
            Cep = dto.Cep, Endereco = dto.Endereco, Numero = dto.Numero, Complemento = dto.Complemento, Bairro = dto.Bairro,
            IdCidade = dto.IdCidade, Pf = dto.Pf, DataNascimento = dto.DataNascimento, Sexo = dto.Sexo,
            IdCondicaoPagamento = dto.IdCondicaoPagamento,
            FuncionalKids = dto.FuncionalKids,
            NomeResponsavel = dto.NomeResponsavel, CpfResponsavel = dto.CpfResponsavel,
            ParentescoResponsavel = dto.ParentescoResponsavel, Observacao = dto.Observacao, Ativo = dto.Ativo
        };
        c.Id = await _repository.InsertAsync(c);
        return c;
    }

    public async Task<bool> UpdateAsync(int id, UpdateClienteDto dto)
    {
        var c = await _repository.GetByIdAsync(id);
        if (c == null) return false;

        if (await _repository.CpfCnpjExistsAsync(dto.CpfCnpj, excludeId: id))
            throw new InvalidOperationException($"Já existe outro cliente cadastrado com o CPF/CNPJ '{dto.CpfCnpj}'.");

        c.Nome = dto.Nome; c.NomeFantasia = dto.NomeFantasia; c.CpfCnpj = dto.CpfCnpj; c.RgIe = dto.RgIe;
        c.Contato2 = dto.Contato2; c.Celular = dto.Celular; c.Email = dto.Email;
        c.Cep = dto.Cep; c.Endereco = dto.Endereco; c.Numero = dto.Numero; c.Complemento = dto.Complemento; c.Bairro = dto.Bairro;
        c.IdCidade = dto.IdCidade; c.Pf = dto.Pf; c.DataNascimento = dto.DataNascimento; c.Sexo = dto.Sexo;
        c.IdCondicaoPagamento = dto.IdCondicaoPagamento;
        c.FuncionalKids = dto.FuncionalKids;
        c.NomeResponsavel = dto.NomeResponsavel; c.CpfResponsavel = dto.CpfResponsavel;
        c.ParentescoResponsavel = dto.ParentescoResponsavel; c.Observacao = dto.Observacao; c.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(c);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}

