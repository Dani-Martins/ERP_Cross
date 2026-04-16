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
        var c = new Cliente
        {
            Nome = dto.Nome, NomeFantasia = dto.NomeFantasia, CpfCnpj = dto.CpfCnpj, RgIe = dto.RgIe,
            Telefone = dto.Telefone, Celular = dto.Celular, Email = dto.Email,
            Cep = dto.Cep, Endereco = dto.Endereco, Numero = dto.Numero, Complemento = dto.Complemento, Bairro = dto.Bairro,
            IdCidade = dto.IdCidade, Pf = dto.Pf, DataNascimento = dto.DataNascimento, Sexo = dto.Sexo,
            IdCondicaoPagamento = dto.IdCondicaoPagamento, LimiteCredito = dto.LimiteCredito, Ativo = dto.Ativo
        };
        c.Id = await _repository.InsertAsync(c);
        return c;
    }

    public async Task<bool> UpdateAsync(int id, UpdateClienteDto dto)
    {
        var c = await _repository.GetByIdAsync(id);
        if (c == null) return false;

        c.Nome = dto.Nome; c.NomeFantasia = dto.NomeFantasia; c.CpfCnpj = dto.CpfCnpj; c.RgIe = dto.RgIe;
        c.Telefone = dto.Telefone; c.Celular = dto.Celular; c.Email = dto.Email;
        c.Cep = dto.Cep; c.Endereco = dto.Endereco; c.Numero = dto.Numero; c.Complemento = dto.Complemento; c.Bairro = dto.Bairro;
        c.IdCidade = dto.IdCidade; c.Pf = dto.Pf; c.DataNascimento = dto.DataNascimento; c.Sexo = dto.Sexo;
        c.IdCondicaoPagamento = dto.IdCondicaoPagamento; c.LimiteCredito = dto.LimiteCredito; c.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(c);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}
