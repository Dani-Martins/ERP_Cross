#nullable enable
using System.Data;
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class NotaCompraService
{
    private readonly NotaCompraRepository _repository;
    private readonly ContaPagarService _contasPagar;
    private readonly NotaCompraItemRepository _itensNota;
    private readonly ProdutoRepository _produtoRepository;
    private readonly IDbConnection _db;
    private readonly NotaCompraItemService _itensService;
    public NotaCompraService(
        NotaCompraRepository repository,
        ContaPagarService contasPagar,
        NotaCompraItemRepository itensNota,
        ProdutoRepository produtoRepository,
        IDbConnection db,
        NotaCompraItemService itensService)
    {
        _repository = repository;
        _contasPagar = contasPagar;
        _itensNota = itensNota;
        _produtoRepository = produtoRepository;
        _db = db;
        _itensService = itensService;
    }

    public async Task<IEnumerable<NotaCompra>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<NotaCompra?> GetByIdAsync(long id) => await _repository.GetByIdAsync(id);

    public async Task<NotaCompra> CreateAsync(CreateNotaCompraDto dto)
    {
        var existing = await _repository.GetByNumeroModeloSerieAsync(dto.NumeroNota, dto.Modelo, dto.Serie, dto.FornecedorId);
        if (existing != null)
            throw new InvalidOperationException($"Este fornecedor já possui uma nota com Número '{dto.NumeroNota}', Modelo '{dto.Modelo}' e Série '{dto.Serie}'.");

        var n = new NotaCompra
        {
            FornecedorId = dto.FornecedorId, Modelo = dto.Modelo, Serie = dto.Serie, NumeroNota = dto.NumeroNota,
            DataEmissao = dto.DataEmissao, DataChegada = dto.DataChegada, ChaveAcesso = dto.ChaveAcesso, TipoFrete = dto.TipoFrete,
            ValorFrete = dto.ValorFrete, ValorSeguro = dto.ValorSeguro, OutrasDespesas = dto.OutrasDespesas,
            TotalProdutos = dto.TotalProdutos,
            TotalPagar = dto.TotalProdutos + dto.ValorFrete + dto.ValorSeguro + dto.OutrasDespesas,
            CondicaoPagamentoId = dto.CondicaoPagamentoId, TransportadoraId = dto.TransportadoraId,
            PlacaVeiculo = dto.PlacaVeiculo, Observacao = dto.Observacao, Status = dto.Status,
            Ativo = dto.Ativo
        };
        var abriuConexao = _db.State == ConnectionState.Closed;
        if (abriuConexao) _db.Open();
        try
        {
            using var transaction = _db.BeginTransaction();
            n.Id = await _repository.InsertAsync(n, transaction);
            if (dto.Itens != null)
                await SalvarItensAsync(n, dto.Itens, transaction);
            await _contasPagar.SincronizarDaNotaAsync(n, transaction);
            transaction.Commit();
            return n;
        }
        finally
        {
            if (abriuConexao) _db.Close();
        }
    }

    public Task<bool> UpdateAsync(long id, UpdateNotaCompraDto dto)
        => throw new ArgumentException("Uma compra cadastrada não pode ser alterada.");

    private async Task SalvarItensAsync(NotaCompra nota, List<NotaCompraItemSalvarDto> itens, IDbTransaction transaction)
    {
        if (!nota.Ativo || string.Equals(nota.Status, "CANCELADO", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Não é possível alterar itens de uma nota de compra inativa ou cancelada.");
        if (itens.Any(i => i.Quantidade <= 0 || !i.Ativo))
            throw new ArgumentException("Informe itens ativos com quantidade positiva.");
        if (itens.Any(i => i.Id.HasValue))
            throw new ArgumentException("Uma nova compra não pode conter itens já cadastrados.");
        foreach (var item in itens.OrderBy(i => i.ProdutoId))
        {
            item.NotaCompraId = nota.Id;
            await _itensService.CreateAsync(item, transaction);
        }
    }

    public async Task<(string? Erro, string? Aviso)> CancelarContaPagarAsync(long id)
    {
        var abriuConexao = _db.State == ConnectionState.Closed;
        if (abriuConexao) _db.Open();
        try
        {
            using var transaction = _db.BeginTransaction();
            var n = await _repository.GetByIdAsync(id, transaction);
            if (n == null) return ("Nota de compra não encontrada.", null);
            if (!n.Ativo || string.Equals(n.Status, "CANCELADO", StringComparison.OrdinalIgnoreCase))
                return ("A nota de compra já está cancelada ou inativa.", null);
            if (!await _contasPagar.CancelarDaNotaCompraAsync(id, transaction))
                return ("Não é possível cancelar a compra: existe parcela paga.", null);
            var itens = await _itensNota.GetByNotaCompraIdAsync(id, transaction);
            var insuficientes = new List<string>();
            foreach (var item in itens.OrderBy(i => i.ProdutoId))
            {
                if (await _produtoRepository.EstornarCompraAsync(item.ProdutoId, item.Id, item.Quantidade, item.LiquidoUnit, transaction))
                    insuficientes.Add(item.NomeProduto ?? $"Produto {item.ProdutoId}");
            }
            n.Status = "CANCELADO";
            if (!await _repository.UpdateAsync(n, transaction))
                throw new InvalidOperationException("Não foi possível cancelar a nota de compra.");
            transaction.Commit();
            var aviso = insuficientes.Count == 0 ? null
                : $"Não foi possível estornar todas as unidades de {string.Join(", ", insuficientes.Distinct())}; o estoque foi ajustado para zero.";
            return (null, aviso);
        }
        finally
        {
            if (abriuConexao) _db.Close();
        }
    }

    public Task<bool> DeleteAsync(long id)
        => throw new ArgumentException("Uma compra cadastrada não pode ser excluída. Utilize o cancelamento.");
}

