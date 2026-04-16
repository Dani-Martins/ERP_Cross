using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class TransportadoraService
{
    private readonly TransportadoraRepository _repository;
    public TransportadoraService(TransportadoraRepository repository) { _repository = repository; }

    public async Task<IEnumerable<Transportadora>> GetAllAsync(string? q = null) => await _repository.GetAllAsync(q);
    public async Task<Transportadora?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<Transportadora> CreateAsync(CreateTransportadoraDto dto)
    {
        var t = new Transportadora
        {
            Nome = dto.Nome, NomeFantasia = dto.NomeFantasia, CpfCnpj = dto.CpfCnpj, RgIe = dto.RgIe,
            Telefone = dto.Telefone, Celular = dto.Celular, Email = dto.Email,
            Cep = dto.Cep, Endereco = dto.Endereco, Numero = dto.Numero, Complemento = dto.Complemento, Bairro = dto.Bairro,
            IdCidade = dto.IdCidade, TipoPessoa = dto.TipoPessoa, IdCondicaoPagamento = dto.IdCondicaoPagamento, Ativo = dto.Ativo
        };
        t.Id = await _repository.InsertAsync(t);
        return t;
    }

    public async Task<bool> UpdateAsync(int id, UpdateTransportadoraDto dto)
    {
        var t = await _repository.GetByIdAsync(id);
        if (t == null) return false;

        t.Nome = dto.Nome; t.NomeFantasia = dto.NomeFantasia; t.CpfCnpj = dto.CpfCnpj; t.RgIe = dto.RgIe;
        t.Telefone = dto.Telefone; t.Celular = dto.Celular; t.Email = dto.Email;
        t.Cep = dto.Cep; t.Endereco = dto.Endereco; t.Numero = dto.Numero; t.Complemento = dto.Complemento; t.Bairro = dto.Bairro;
        t.IdCidade = dto.IdCidade; t.TipoPessoa = dto.TipoPessoa; t.IdCondicaoPagamento = dto.IdCondicaoPagamento; t.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(t);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}
