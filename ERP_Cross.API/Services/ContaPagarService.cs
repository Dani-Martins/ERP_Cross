#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class ContaPagarService
{
    private readonly ContaPagarRepository _repository;
    private readonly ContaPagarParcelaRepository _parcelas;
    private readonly NotaCompraRepository _notas;
    private readonly CondicaoPagamentoRepository _condicoes;
    public ContaPagarService(ContaPagarRepository repository, ContaPagarParcelaRepository parcelas,
        NotaCompraRepository notas, CondicaoPagamentoRepository condicoes)
    {
        _repository = repository;
        _parcelas = parcelas;
        _notas = notas;
        _condicoes = condicoes;
    }

    public async Task<IEnumerable<ContaPagar>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<ContaPagar?> GetByIdAsync(long id) => await _repository.GetByIdAsync(id);
    public async Task<IEnumerable<ContaPagarParcela>> GetParcelasAsync(long contaId) => await _parcelas.GetByContaAsync(contaId);

    // ValorParcela já inclui juros e desconto; pago com atraso perde o desconto e ganha multa
    private static decimal CalcularValorPago(decimal valor, DateTime vencimento, DateTime pagamento, ContaPagar c)
    {
        if ((pagamento.Date - vencimento.Date).Days <= 0) return valor;
        var semDesconto = c.Desconto < 100 ? valor / (1 - c.Desconto / 100m) : valor;
        return Math.Round(semDesconto * (1 + c.Multa / 100m), 2);
    }

    // Grava as parcelas informadas e atualiza totais e status da conta
    private async Task SalvarParcelasAsync(ContaPagar c, List<ContaPagarParcelaInput> inputs)
    {
        var ordenadas = inputs.OrderBy(p => p.DataVencimento).ToList();
        for (var i = 0; i < ordenadas.Count; i++)
        {
            var p = ordenadas[i];
            await _parcelas.InsertAsync(new ContaPagarParcela
            {
                ContaPagarId = c.Id, NumParcela = i + 1, DataVencimento = p.DataVencimento,
                ValorParcela = p.ValorParcela, Pago = p.DataPagamento.HasValue,
                DataPagamento = p.DataPagamento,
                ValorPago = p.DataPagamento.HasValue ? CalcularValorPago(p.ValorParcela, p.DataVencimento, p.DataPagamento.Value, c) : null
            });
        }
        c.NumParcela = ordenadas.Count;
        c.ValorTotal = ordenadas.Sum(p => p.ValorParcela);
        c.DataVencimento = ordenadas[0].DataVencimento;
        if (c.Status != "CANCELADO")
            c.Status = ordenadas.All(p => p.DataPagamento.HasValue) ? "FINALIZADO" : "ABERTO";
    }

    public async Task<ContaPagar> CreateAsync(CreateContaPagarDto dto)
    {
        var c = new ContaPagar
        {
            NotaCompraId = dto.NotaCompraId, FornecedorId = dto.FornecedorId, Modelo = dto.Modelo,
            Serie = dto.Serie, NumeroNota = dto.NumeroNota, DataEmissao = dto.DataEmissao,
            Juros = dto.Juros, Multa = dto.Multa, Desconto = dto.Desconto, Status = "ABERTO",
            Ativo = dto.Ativo, FormaPagamentoId = dto.FormaPagamentoId, Observacao = dto.Observacao,
            NumParcela = dto.Parcelas.Count, DataVencimento = dto.Parcelas.Min(p => p.DataVencimento),
            ValorTotal = dto.Parcelas.Sum(p => p.ValorParcela)
        };
        c.Id = await _repository.InsertAsync(c);
        await SalvarParcelasAsync(c, dto.Parcelas);
        await _repository.UpdateAsync(c);
        return c;
    }

    public async Task<bool> UpdateAsync(long id, UpdateContaPagarDto dto)
    {
        var c = await _repository.GetByIdAsync(id);
        if (c == null) return false;

        c.NotaCompraId = dto.NotaCompraId; c.FornecedorId = dto.FornecedorId; c.Modelo = dto.Modelo;
        c.Serie = dto.Serie; c.NumeroNota = dto.NumeroNota; c.DataEmissao = dto.DataEmissao;
        c.Juros = dto.Juros; c.Multa = dto.Multa; c.Desconto = dto.Desconto;
        c.Ativo = dto.Ativo; c.FormaPagamentoId = dto.FormaPagamentoId; c.Observacao = dto.Observacao;

        await _parcelas.DeleteByContaAsync(id);
        await SalvarParcelasAsync(c, dto.Parcelas);

        return await _repository.UpdateAsync(c);
    }

    public async Task<bool> CancelarAsync(long id)
    {
        var c = await _repository.GetByIdAsync(id);
        if (c == null) return false;
        c.Status = "CANCELADO";
        return await _repository.UpdateAsync(c);
    }

    public async Task<bool> DeleteAsync(long id) => await _repository.DeleteAsync(id);

    private static bool NotaAberta(NotaCompra n)
        => n.Ativo && string.Equals(n.Status ?? "ABERTA", "ABERTA", StringComparison.OrdinalIgnoreCase);

    // Monta as parcelas pela condição de pagamento da nota (dias + percentual), aplicando juros e desconto da condição
    private async Task<(List<ContaPagarParcelaInput> Parcelas, CondicaoPagamento? Condicao, int? FormaPagamentoId)> GerarParcelasDaNotaAsync(NotaCompra nota)
    {
        var condicao = nota.CondicaoPagamentoId.HasValue ? await _condicoes.GetByIdAsync(nota.CondicaoPagamentoId.Value) : null;
        var defs = nota.CondicaoPagamentoId.HasValue
            ? (await _condicoes.GetParcelasAsync(nota.CondicaoPagamentoId.Value)).OrderBy(d => d.Numero).ToList()
            : new List<CondicaoPagamentoRepository.ParcelaCondicaoPagamento>();
        if (defs.Count == 0)
            defs.Add(new CondicaoPagamentoRepository.ParcelaCondicaoPagamento { Numero = 1, Dias = 0, Percentual = 100 });

        var juros = condicao?.TaxaJuros ?? 0m;
        var desconto = condicao?.Desconto ?? 0m;
        var total = nota.TotalPagar;
        var lista = new List<ContaPagarParcelaInput>();
        decimal acumulado = 0;
        for (var i = 0; i < defs.Count; i++)
        {
            var valor = i == defs.Count - 1
                ? Math.Round(total - acumulado, 2)
                : Math.Round(total * defs[i].Percentual / 100m, 2);
            acumulado += valor;
            var fator = (decimal)Math.Pow((double)(1 + juros / 100m), i) * (1 - desconto / 100m);
            lista.Add(new ContaPagarParcelaInput
            {
                DataVencimento = nota.DataEmissao.Date.AddDays(defs[i].Dias),
                ValorParcela = Math.Round(valor * fator, 2)
            });
        }
        return (lista, condicao, defs[0].FormaPagamentoId);
    }

    // Abre/atualiza a conta a pagar de uma nota de compra aberta; cancela a conta se a nota for cancelada ou excluída
    public async Task SincronizarDaNotaAsync(NotaCompra nota)
    {
        var existente = await _repository.GetByNotaCompraIdAsync(nota.Id);
        var status = (nota.Status ?? "ABERTA").ToUpperInvariant();

        if (!NotaAberta(nota))
        {
            if (existente != null && existente.Status == "ABERTO" && (status == "CANCELADO" || !nota.Ativo))
                await CancelarAsync(existente.Id);
            return;
        }

        var (parcelas, condicao, formaId) = await GerarParcelasDaNotaAsync(nota);
        if (parcelas.Sum(p => p.ValorParcela) <= 0) return;

        if (existente == null)
        {
            var c = new ContaPagar
            {
                NotaCompraId = nota.Id, FornecedorId = nota.FornecedorId, Modelo = nota.Modelo, Serie = nota.Serie,
                NumeroNota = nota.NumeroNota, DataEmissao = nota.DataEmissao, Juros = condicao?.TaxaJuros ?? 0,
                Multa = condicao?.Multa ?? 0, Desconto = condicao?.Desconto ?? 0, Status = "ABERTO", Ativo = true,
                FormaPagamentoId = formaId, Observacao = nota.Observacao,
                NumParcela = parcelas.Count, DataVencimento = parcelas[0].DataVencimento,
                ValorTotal = parcelas.Sum(p => p.ValorParcela)
            };
            c.Id = await _repository.InsertAsync(c);
            await SalvarParcelasAsync(c, parcelas);
            await _repository.UpdateAsync(c);
        }
        else if (existente.Status == "ABERTO" && existente.ParcelasPagas == 0)
        {
            // Sem pagamentos feitos, a conta acompanha as altera\u00e7\u00f5es da nota
            existente.FornecedorId = nota.FornecedorId; existente.Modelo = nota.Modelo; existente.Serie = nota.Serie;
            existente.NumeroNota = nota.NumeroNota; existente.DataEmissao = nota.DataEmissao;
            existente.Juros = condicao?.TaxaJuros ?? 0; existente.Multa = condicao?.Multa ?? 0;
            existente.Desconto = condicao?.Desconto ?? 0; existente.FormaPagamentoId = formaId;
            existente.Observacao = nota.Observacao;
            await _parcelas.DeleteByContaAsync(existente.Id);
            await SalvarParcelasAsync(existente, parcelas);
            await _repository.UpdateAsync(existente);
        }
    }

    // Traz para Contas a Pagar as notas abertas que ainda n\u00e3o t\u00eam conta
    public async Task<int> SincronizarNotasAbertasAsync()
    {
        var criadas = 0;
        foreach (var nota in await _notas.GetAllAsync())
        {
            if (!NotaAberta(nota)) continue;
            if (await _repository.GetByNotaCompraIdAsync(nota.Id) != null) continue;
            await SincronizarDaNotaAsync(nota);
            criadas++;
        }
        return criadas;
    }

    public async Task<bool> PagarParcelaAsync(long parcelaId, DateTime dataPagamento)
    {
        var parcela = await _parcelas.GetByIdAsync(parcelaId);
        if (parcela == null || parcela.Pago) return false;

        var conta = await _repository.GetByIdAsync(parcela.ContaPagarId);
        if (conta == null || conta.Status != "ABERTO") return false;

        var valorPago = CalcularValorPago(parcela.ValorParcela, parcela.DataVencimento, dataPagamento, conta);
        if (!await _parcelas.MarcarPagaAsync(parcelaId, dataPagamento, valorPago)) return false;

        if (await _parcelas.CountAbertasAsync(conta.Id) == 0)
        {
            conta.Status = "FINALIZADO";
            await _repository.UpdateAsync(conta);
        }
        return true;
    }
}

