#nullable enable
using System.Data;
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class NotaVendaProdutoService
{
    private readonly NotaVendaProdutoRepository _repository;
    private readonly ProdutoRepository _produtoRepository;
    private readonly NotaVendaRepository _notaRepository;
    private readonly IDbConnection _db;
    public NotaVendaProdutoService(NotaVendaProdutoRepository repository, ProdutoRepository produtoRepository, NotaVendaRepository notaRepository, IDbConnection db)
    {
        _repository = repository;
        _produtoRepository = produtoRepository;
        _notaRepository = notaRepository;
        _db = db;
    }

    public async Task<IEnumerable<NotaVendaProduto>> GetByNotaVendaAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _repository.GetByNotaVendaAsync(numeroNota, modelo, serie, clienteId);

    public async Task<NotaVendaProduto?> GetByKeyAsync(string numeroNota, string modelo, string serie, int clienteId, int produtoId)
        => await _repository.GetByKeyAsync(numeroNota, modelo, serie, clienteId, produtoId);

    public Task<NotaVendaProduto> CreateAsync(CreateNotaVendaProdutoDto dto, IDbTransaction? transacao = null)
        => EmTransacaoAsync(async transaction =>
    {
        if (dto.Quantidade <= 0)
            throw new ArgumentException("A quantidade do item deve ser maior que zero.");
        var nota = await _notaRepository.GetByKeyAsync(dto.NumeroNota, dto.Modelo, dto.Serie, dto.ClienteId, transaction: transaction)
            ?? throw new ArgumentException("Nota de venda informada não foi encontrada.");
        if (!nota.Ativo || string.Equals(nota.Status, "CANCELADO", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Não é possível adicionar itens a uma nota de venda inativa ou cancelada.");
        var p = new NotaVendaProduto
        {
            NumeroNota = dto.NumeroNota, Modelo = dto.Modelo, Serie = dto.Serie, ClienteId = dto.ClienteId,
            ProdutoId = dto.ProdutoId, UnidadeId = dto.UnidadeId,
            Quantidade = dto.Quantidade, PrecoUnit = dto.PrecoUnit, Desconto = dto.Desconto,
            QuantidadeBaixada = dto.Ativo ? dto.Quantidade : 0,
            Total = (dto.PrecoUnit - dto.Desconto) * dto.Quantidade,
            Ativo = dto.Ativo
        };
        var anterior = await _repository.GetByKeyAsync(p.NumeroNota, p.Modelo, p.Serie, p.ClienteId, p.ProdutoId, transaction);
        if (anterior?.Ativo == true)
            throw new ArgumentException("Este produto já está incluído na nota de venda.");
        if (p.Ativo)
            await AjustarEstoqueAsync(p.ProdutoId, -p.Quantidade, transaction);
        var ok = anterior == null
            ? await _repository.InsertAsync(p, transaction)
            : await _repository.UpdateAsync(p, transaction);
        if (!ok) throw new InvalidOperationException("Não foi possível salvar o item da nota de venda.");
        return p;
    }, transacao);

    public Task<bool> UpdateAsync(string numeroNota, string modelo, string serie, int clienteId, int produtoId, UpdateNotaVendaProdutoDto dto, IDbTransaction? transacao = null)
        => EmTransacaoAsync(async transaction =>
    {
        if (dto.Quantidade <= 0)
            throw new ArgumentException("A quantidade do item deve ser maior que zero.");
        var nota = await _notaRepository.GetByKeyAsync(numeroNota, modelo, serie, clienteId, transaction: transaction);
        if (nota == null) return false;
        if (!nota.Ativo || string.Equals(nota.Status, "CANCELADO", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Não é possível alterar itens de uma nota de venda inativa ou cancelada.");
        var p = await _repository.GetByKeyAsync(numeroNota, modelo, serie, clienteId, produtoId, transaction);
        if (p == null) return false;

        var quantidadeAnterior = p.Ativo ? p.Quantidade : 0;
        var baixadaAnterior = p.Ativo ? p.QuantidadeBaixada : 0;
        var baixadaNova = dto.Ativo
            ? Math.Max(0, baixadaAnterior + dto.Quantidade - quantidadeAnterior)
            : 0;
        var saidaAdicional = baixadaNova - baixadaAnterior;
        if (saidaAdicional != 0)
            await AjustarEstoqueAsync(p.ProdutoId, -saidaAdicional, transaction);

        p.UnidadeId = dto.UnidadeId;
        p.Quantidade = dto.Quantidade; p.PrecoUnit = dto.PrecoUnit; p.Desconto = dto.Desconto;
        p.QuantidadeBaixada = baixadaNova;
        p.Total = (dto.PrecoUnit - dto.Desconto) * dto.Quantidade;
        p.Ativo = dto.Ativo;

        if (!await _repository.UpdateAsync(p, transaction))
            throw new InvalidOperationException("Não foi possível atualizar o item da nota de venda.");
        return true;
    }, transacao);

    public Task<bool> DeleteAsync(string numeroNota, string modelo, string serie, int clienteId, int produtoId, IDbTransaction? transacao = null)
        => EmTransacaoAsync(async transaction =>
    {
        var nota = await _notaRepository.GetByKeyAsync(numeroNota, modelo, serie, clienteId, transaction: transaction);
        if (nota == null) return false;
        var p = await _repository.GetByKeyAsync(numeroNota, modelo, serie, clienteId, produtoId, transaction);
        if (p == null || !p.Ativo) return false;

        var excluido = await _repository.DeleteAsync(numeroNota, modelo, serie, clienteId, produtoId, transaction);
        if (excluido && p.QuantidadeBaixada > 0 && nota.Ativo && !string.Equals(nota.Status, "CANCELADO", StringComparison.OrdinalIgnoreCase))
            await AjustarEstoqueAsync(p.ProdutoId, p.QuantidadeBaixada, transaction);
        return excluido;
    }, transacao);

    private async Task AjustarEstoqueAsync(int produtoId, decimal delta, IDbTransaction transaction)
    {
        if (!await _produtoRepository.AjustarEstoqueAsync(produtoId, delta, transaction))
            throw new ArgumentException("Produto não encontrado ou estoque insuficiente para a operação.");
    }

    private async Task<T> EmTransacaoAsync<T>(Func<IDbTransaction, Task<T>> operacao, IDbTransaction? transacao)
    {
        if (transacao != null) return await operacao(transacao);
        var abriuConexao = _db.State == ConnectionState.Closed;
        if (abriuConexao) _db.Open();
        try
        {
            using var transaction = _db.BeginTransaction();
            var resultado = await operacao(transaction);
            transaction.Commit();
            return resultado;
        }
        finally
        {
            if (abriuConexao) _db.Close();
        }
    }
}

