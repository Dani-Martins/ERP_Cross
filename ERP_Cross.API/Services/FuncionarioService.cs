#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class FuncionarioService
{
    private readonly FuncionarioRepository _repository;
    public FuncionarioService(FuncionarioRepository repository) { _repository = repository; }

    public async Task<IEnumerable<Funcionario>> GetAllAsync(string? q = null) => await _repository.GetAllAsync(q);
    public async Task<Funcionario?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<Funcionario> CreateAsync(CreateFuncionarioDto dto)
    {
        var f = new Funcionario
        {
            Nome = dto.Nome, CpfCnpj = dto.CpfCnpj, RgIe = dto.RgIe,
            Contato2 = dto.Contato2, Celular = dto.Celular, Email = dto.Email,
            Cep = dto.Cep, Endereco = dto.Endereco, Numero = dto.Numero, Complemento = dto.Complemento, Bairro = dto.Bairro,
            IdCidade = dto.IdCidade, IdCargo = dto.IdCargo, Pis = dto.Pis, Ctps = dto.Ctps,
            Salario = dto.Salario, DataAdmissao = dto.DataAdmissao, DataDemissao = dto.DataDemissao,
            Sexo = dto.Sexo, Ativo = dto.Ativo
        };
        f.Id = await _repository.InsertAsync(f);
        return f;
    }

    public async Task<bool> UpdateAsync(int id, UpdateFuncionarioDto dto)
    {
        var f = await _repository.GetByIdAsync(id);
        if (f == null) return false;

        f.Nome = dto.Nome; f.CpfCnpj = dto.CpfCnpj; f.RgIe = dto.RgIe;
        f.Contato2 = dto.Contato2; f.Celular = dto.Celular; f.Email = dto.Email;
        f.Cep = dto.Cep; f.Endereco = dto.Endereco; f.Numero = dto.Numero; f.Complemento = dto.Complemento; f.Bairro = dto.Bairro;
        f.IdCidade = dto.IdCidade; f.IdCargo = dto.IdCargo; f.Pis = dto.Pis; f.Ctps = dto.Ctps;
        f.Salario = dto.Salario; f.DataAdmissao = dto.DataAdmissao; f.DataDemissao = dto.DataDemissao;
        f.Sexo = dto.Sexo; f.Ativo = dto.Ativo;

        return await _repository.UpdateAsync(f);
    }

    public async Task<bool> DeleteAsync(int id) => await _repository.DeleteAsync(id);
}

