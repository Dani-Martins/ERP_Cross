using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class ContaPagarService
{
    private readonly ContaPagarRepository _repository;
    public ContaPagarService(ContaPagarRepository repository) { _repository = repository; }

    public async Task<IEnumerable<ContaPagar>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<ContaPagar?> GetByIdAsync(long id) => await _repository.GetByIdAsync(id);

    public async Task<ContaPagar> CreateAsync(CreateContaPagarDto dto)
    {
        var c = new ContaPagar
        {
            NotaCompraId = dto.NotaCompraId, FornecedorId = dto.FornecedorId, Modelo = dto.Modelo,
            Serie = dto.Serie, NumeroNota = dto.NumeroNota, NumParcela = dto.NumParcela,
            ValorParcela = dto.ValorParcela, DataEmissao = dto.DataEmissao, DataVencimento = dto.DataVencimento,
            DataPagamento = dto.DataPagamento, ValorPago = dto.ValorPago, Juros = dto.Juros,
            Multa = dto.Multa, Desconto = dto.Desconto, Status = dto.Status,
            Ativo = dto.Ativo, FormaPagamentoId = dto.FormaPagamentoId, Observacao = dto.Observacao
        };
        c.Id = await _repository.InsertAsync(c);
        return c;
    }

    public async Task<bool> UpdateAsync(long id, UpdateContaPagarDto dto)
    {
        var c = await _repository.GetByIdAsync(id);
        if (c == null) return false;

        c.NotaCompraId = dto.NotaCompraId; c.FornecedorId = dto.FornecedorId; c.Modelo = dto.Modelo;
        c.Serie = dto.Serie; c.NumeroNota = dto.NumeroNota; c.NumParcela = dto.NumParcela;
        c.ValorParcela = dto.ValorParcela; c.DataEmissao = dto.DataEmissao; c.DataVencimento = dto.DataVencimento;
        c.DataPagamento = dto.DataPagamento; c.ValorPago = dto.ValorPago; c.Juros = dto.Juros;
        c.Multa = dto.Multa; c.Desconto = dto.Desconto; c.Status = dto.Status;
        c.Ativo = dto.Ativo; c.FormaPagamentoId = dto.FormaPagamentoId; c.Observacao = dto.Observacao;

        return await _repository.UpdateAsync(c);
    }

    public async Task<bool> DeleteAsync(long id) => await _repository.DeleteAsync(id);
}
