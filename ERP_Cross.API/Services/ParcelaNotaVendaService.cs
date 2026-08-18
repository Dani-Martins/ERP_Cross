#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Repositories;

namespace ERP_Cross.API.Services;

public class ParcelaNotaVendaService
{
    private readonly ParcelaNotaVendaRepository _repo;
    private readonly CondicaoPagamentoRepository _condicaoRepo;

    public ParcelaNotaVendaService(ParcelaNotaVendaRepository repo, CondicaoPagamentoRepository condicaoRepo)
    {
        _repo = repo;
        _condicaoRepo = condicaoRepo;
    }

    public async Task<IEnumerable<ParcelaNotaVenda>> GetByNotaAsync(string numeroNota, string modelo, string serie, int clienteId)
        => await _repo.GetByNotaAsync(numeroNota, modelo, serie, clienteId);

    public async Task<ParcelaNotaVenda?> GetByIdAsync(long id)
        => await _repo.GetByIdAsync(id);

    public async Task<bool> CalculateAndSaveAsync(string numeroNota, string modelo, string serie, int clienteId, int condicaoPagamentoId, decimal totalNota)
    {
        // Limpar parcelas antigas dessa nota
        await _repo.DeleteByNotaAsync(numeroNota, modelo, serie, clienteId);

        // Buscar a condição de pagamento com suas parcelas
        var condicao = await _condicaoRepo.GetByIdAsync(condicaoPagamentoId);
        if (condicao == null) return false;

        // Buscar as parcelas da condição de pagamento
        var parcelasCondicao = await _condicaoRepo.GetParcelasAsync(condicaoPagamentoId);
        if (!parcelasCondicao.Any()) return false;

        // Calcular data base (hoje)
        var dataBase = DateTime.Now;

        // Gerar as parcelas para essa nota
        int numParcela = 1;
        foreach (var pc in parcelasCondicao)
        {
            var valorParcela = totalNota * (pc.Percentual / 100m);
            var dataVencimento = dataBase.AddDays(pc.Dias);

            var parcela = new ParcelaNotaVenda
            {
                NumeroNota = numeroNota,
                Modelo = modelo,
                Serie = serie,
                ClienteId = clienteId,
                NumParcela = numParcela,
                FormaPagamentoId = pc.FormaPagamentoId,
                DataVencimento = dataVencimento,
                ValorParcela = valorParcela,
                Pago = false,
                DataPagamento = null,
                CriadoEm = DateTime.Now
            };

            if (!await _repo.InsertAsync(parcela)) return false;
            numParcela++;
        }

        return true;
    }

    public async Task<bool> CreateAsync(CreateParcelaNotaVendaDto dto)
    {
        var parcela = new ParcelaNotaVenda
        {
            NumeroNota = dto.NumeroNota,
            Modelo = dto.Modelo,
            Serie = dto.Serie,
            ClienteId = dto.ClienteId,
            NumParcela = dto.NumParcela,
            FormaPagamentoId = dto.FormaPagamentoId,
            DataVencimento = dto.DataVencimento,
            ValorParcela = dto.ValorParcela,
            Pago = dto.Pago,
            DataPagamento = dto.DataPagamento,
            CriadoEm = DateTime.Now
        };
        return await _repo.InsertAsync(parcela);
    }

    public async Task<bool> UpdateAsync(long id, UpdateParcelaNotaVendaDto dto)
    {
        var parcela = await _repo.GetByIdAsync(id);
        if (parcela == null) return false;

        parcela.FormaPagamentoId = dto.FormaPagamentoId;
        parcela.DataVencimento = dto.DataVencimento;
        parcela.ValorParcela = dto.ValorParcela;
        parcela.Pago = dto.Pago;
        parcela.DataPagamento = dto.DataPagamento;

        return await _repo.UpdateAsync(parcela);
    }

    public async Task<bool> DeleteAsync(long id)
        => await _repo.DeleteAsync(id);
}
