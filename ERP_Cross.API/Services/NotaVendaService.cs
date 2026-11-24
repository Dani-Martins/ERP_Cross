#nullable enable
using System.Data;
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class NotaVendaService
{
    private readonly NotaVendaRepository _repository;
    private readonly ContaReceberService _contasReceber;
    private readonly NotaVendaProdutoRepository _produtosNota;
    private readonly ProdutoRepository _produtoRepository;
    private readonly IDbConnection _db;
    private readonly NotaVendaProdutoService _itensService;
    public NotaVendaService(
        NotaVendaRepository repository,
        ContaReceberService contasReceber,
        NotaVendaProdutoRepository produtosNota,
        ProdutoRepository produtoRepository,
        IDbConnection db,
        NotaVendaProdutoService itensService)
    {
        _repository = repository;
        _contasReceber = contasReceber;
        _produtosNota = produtosNota;
        _produtoRepository = produtoRepository;
        _db = db;
        _itensService = itensService;
    }

    public async Task<IEnumerable<NotaVenda>> GetAllAsync() => await _repository.GetAllAsync();

    public async Task<NotaVenda?> GetByKeyAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _repository.GetByKeyAsync(numeroNota, modelo, serie, clienteId);

    public async Task<NotaVenda?> CreateAsync(CreateNotaVendaDto dto)
    {
        if (dto.Itens == null || dto.Itens.Count == 0)
            throw new ArgumentException("Adicione ao menos um produto antes de salvar a nota de venda.");

        var existing = await _repository.GetByKeyAsync(dto.NumeroNota, dto.Modelo, dto.Serie, dto.ClienteId);
        if (existing != null)
            throw new InvalidOperationException($"Este cliente já possui uma nota com Número '{dto.NumeroNota}', Modelo '{dto.Modelo}' e Série '{dto.Serie}'.");

        var n = new NotaVenda
        {
            NumeroNota = dto.NumeroNota, Modelo = dto.Modelo, Serie = dto.Serie, ClienteId = dto.ClienteId,
            DataEmissao = dto.DataEmissao, TransportadoraId = dto.TransportadoraId, PlacaVeiculo = dto.PlacaVeiculo,
            TipoFrete = dto.TipoFrete, ValorFrete = dto.ValorFrete, Desconto = dto.Desconto,
            TotalProdutos = dto.TotalProdutos,
            TotalPagar = dto.TotalProdutos + dto.ValorFrete - dto.Desconto,
            CondicaoPagamentoId = dto.CondicaoPagamentoId,
            Observacao = dto.Observacao, Status = dto.Status,
            Ativo = dto.Ativo
        };
        var abriuConexao = _db.State == ConnectionState.Closed;
        if (abriuConexao) _db.Open();
        try
        {
            using var transaction = _db.BeginTransaction();
            if (!await _repository.InsertAsync(n, transaction))
                throw new InvalidOperationException("Não foi possível salvar a nota de venda.");
            if (dto.Itens != null)
                await SalvarItensAsync(n, dto.Itens, transaction);
            await _contasReceber.SincronizarDaNotaAsync(n, transaction);
            transaction.Commit();
            return n;
        }
        finally
        {
            if (abriuConexao) _db.Close();
        }
    }

    public async Task<bool> UpdateAsync(string numeroNota, string modelo, string serie, int clienteId, UpdateNotaVendaDto dto)
    {
        NotaVenda? n;
        var abriuConexao = _db.State == ConnectionState.Closed;
        if (abriuConexao) _db.Open();
        try
        {
            using var transaction = _db.BeginTransaction();
            n = await _repository.GetByKeyAsync(numeroNota, modelo, serie, clienteId, transaction: transaction);
            if (n == null) return false;

            var movimentavaEstoque = n.Ativo && !string.Equals(n.Status, "CANCELADO", StringComparison.OrdinalIgnoreCase);
            var movimentaraEstoque = dto.Ativo && !string.Equals(dto.Status, "CANCELADO", StringComparison.OrdinalIgnoreCase);
            if (movimentavaEstoque != movimentaraEstoque)
            {
                var itens = await _produtosNota.GetByNotaVendaAsync(numeroNota, modelo, serie, clienteId, transaction);
                foreach (var item in itens.Where(i => i.Ativo).OrderBy(i => i.ProdutoId))
                {
                    var delta = movimentaraEstoque ? -item.QuantidadeBaixada : item.QuantidadeBaixada;
                    if (delta != 0 && !await _produtoRepository.AjustarEstoqueAsync(item.ProdutoId, delta, transaction))
                        throw new ArgumentException("Produto não encontrado ou estoque insuficiente para reativar a venda.");
                }
            }

            n.DataEmissao = dto.DataEmissao; n.TransportadoraId = dto.TransportadoraId;
            n.PlacaVeiculo = dto.PlacaVeiculo; n.TipoFrete = dto.TipoFrete; n.ValorFrete = dto.ValorFrete;
            n.Desconto = dto.Desconto; n.TotalProdutos = dto.TotalProdutos;
            n.TotalPagar = dto.TotalProdutos + dto.ValorFrete - dto.Desconto;
            n.CondicaoPagamentoId = dto.CondicaoPagamentoId; n.Observacao = dto.Observacao; n.Status = dto.Status;
            n.Ativo = dto.Ativo;
            if (!await _repository.UpdateAsync(n, transaction))
                throw new InvalidOperationException("Não foi possível atualizar a nota de venda.");
            if (dto.Itens != null)
                await SalvarItensAsync(n, dto.Itens, transaction);
            await _contasReceber.SincronizarDaNotaAsync(n, transaction);
            transaction.Commit();
        }
        finally
        {
            if (abriuConexao) _db.Close();
        }
        return true;
    }

    private async Task SalvarItensAsync(NotaVenda nota, List<CreateNotaVendaProdutoDto> itens, IDbTransaction transaction)
    {
        if (!nota.Ativo || string.Equals(nota.Status, "CANCELADO", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Não é possível alterar itens de uma nota de venda inativa ou cancelada.");
        if (itens.Count == 0)
            throw new ArgumentException("A nota de venda deve conter ao menos um produto.");
        if (itens.Any(i => i.Quantidade <= 0 || !i.Ativo) || itens.Select(i => i.ProdutoId).Distinct().Count() != itens.Count)
            throw new ArgumentException("Informe itens ativos com quantidade positiva e sem produtos repetidos.");

        var existentes = (await _produtosNota.GetByNotaVendaAsync(nota.NumeroNota, nota.Modelo, nota.Serie, nota.ClienteId, transaction))
            .Where(i => i.Ativo).ToDictionary(i => i.ProdutoId);
        foreach (var anterior in existentes.Values.OrderBy(i => i.ProdutoId))
            if (!itens.Any(i => i.ProdutoId == anterior.ProdutoId)
                && !await _itensService.DeleteAsync(nota.NumeroNota, nota.Modelo, nota.Serie, nota.ClienteId, anterior.ProdutoId, transaction))
                throw new InvalidOperationException("Não foi possível remover um item da venda.");

        foreach (var item in itens.OrderBy(i => existentes.TryGetValue(i.ProdutoId, out var anterior) && i.Quantidade <= anterior.Quantidade ? 0 : 1).ThenBy(i => i.ProdutoId))
        {
            if (existentes.ContainsKey(item.ProdutoId))
            {
                var atualizacao = new UpdateNotaVendaProdutoDto
                {
                    UnidadeId = item.UnidadeId, Quantidade = item.Quantidade, PrecoUnit = item.PrecoUnit,
                    Desconto = item.Desconto, Ativo = true
                };
                if (!await _itensService.UpdateAsync(nota.NumeroNota, nota.Modelo, nota.Serie, nota.ClienteId, item.ProdutoId, atualizacao, transaction))
                    throw new InvalidOperationException("Não foi possível atualizar um item da venda.");
            }
            else
            {
                item.NumeroNota = nota.NumeroNota; item.Modelo = nota.Modelo; item.Serie = nota.Serie; item.ClienteId = nota.ClienteId;
                await _itensService.CreateAsync(item, transaction);
            }
        }
    }

    public async Task<string?> CancelarContaReceberAsync(string numeroNota, string modelo, string serie, int clienteId)
    {
        var abriuConexao = _db.State == ConnectionState.Closed;
        if (abriuConexao) _db.Open();
        try
        {
            using var transaction = _db.BeginTransaction();
            var nota = await _repository.GetByKeyAsync(numeroNota, modelo, serie, clienteId, transaction: transaction);
            if (nota == null) return "Nota de venda não encontrada.";
            if (!nota.Ativo) return "A nota de venda está inativa.";
            if (string.Equals(nota.Status, "CANCELADO", StringComparison.OrdinalIgnoreCase))
                return "A nota de venda já está cancelada.";
            if (!await _contasReceber.CancelarDaNotaAsync(numeroNota, modelo, serie, clienteId, transaction))
                return "Não é possível cancelar a conta: ela não está aberta, já foi cancelada ou possui parcela paga.";

            var itens = await _produtosNota.GetByNotaVendaAsync(numeroNota, modelo, serie, clienteId, transaction);
            foreach (var item in itens.Where(i => i.Ativo).OrderBy(i => i.ProdutoId))
            {
                if (item.QuantidadeBaixada > 0 && !await _produtoRepository.AjustarEstoqueAsync(item.ProdutoId, item.QuantidadeBaixada, transaction))
                    throw new ArgumentException("Não foi possível devolver o produto ao estoque.");
            }
            nota.Status = "CANCELADO";
            if (!await _repository.UpdateAsync(nota, transaction))
                throw new InvalidOperationException("Não foi possível cancelar a nota de venda.");
            transaction.Commit();
            return null;
        }
        finally
        {
            if (abriuConexao) _db.Close();
        }
    }

    public async Task<bool> DeleteAsync(string numeroNota, string modelo, string serie, int clienteId)
    {
        NotaVenda? nota;
        var abriuConexao = _db.State == ConnectionState.Closed;
        if (abriuConexao) _db.Open();
        try
        {
            using var transaction = _db.BeginTransaction();
            nota = await _repository.GetByKeyAsync(numeroNota, modelo, serie, clienteId, transaction: transaction);
            if (nota == null || !nota.Ativo) return false;
            var itens = await _produtosNota.GetByNotaVendaAsync(numeroNota, modelo, serie, clienteId, transaction);
            foreach (var item in itens.Where(i => i.Ativo).OrderBy(i => i.ProdutoId))
            {
                if (!string.Equals(nota.Status, "CANCELADO", StringComparison.OrdinalIgnoreCase)
                    && item.QuantidadeBaixada > 0
                    && !await _produtoRepository.AjustarEstoqueAsync(item.ProdutoId, item.QuantidadeBaixada, transaction))
                    throw new ArgumentException("Não foi possível devolver o produto ao estoque.");
                if (!await _produtosNota.DeleteAsync(numeroNota, modelo, serie, clienteId, item.ProdutoId, transaction))
                    throw new InvalidOperationException("Não foi possível excluir um item da venda.");
            }
            if (!await _repository.DeleteAsync(numeroNota, modelo, serie, clienteId, transaction))
                throw new InvalidOperationException("Não foi possível excluir a nota de venda.");
            nota.Ativo = false;
            await _contasReceber.SincronizarDaNotaAsync(nota, transaction);
            transaction.Commit();
        }
        finally
        {
            if (abriuConexao) _db.Close();
        }
        return true;
    }

    public async Task<int> SincronizarContasReceberAsync()
        => await _contasReceber.SincronizarNotasDeVendaAsync();

    public async Task<string> GetNextNumeroNotaAsync(string modelo, string serie)
        => await _repository.GetNextNumeroNotaAsync(modelo, serie);
}

