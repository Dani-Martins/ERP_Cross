#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Errors;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContaPagarController(ContaPagarService service) : ControllerBase
{
    private readonly ContaPagarService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContaPagar>>> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ContaPagar>> GetById(long id)
    {
        var item = await _service.GetByIdAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ContaPagarView>> Create(CreateContaPagarDto dto)
    {
        var item = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, UpdateContaPagarDto dto)
        => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpPost("sincronizar-notas")]
    public async Task<IActionResult> SincronizarNotas()
        => Ok(new { criadas = await _service.SincronizarNotasAbertasAsync() });

    [HttpGet("{id:long}/parcelas")]
    public async Task<ActionResult<IEnumerable<ContaPagarParcela>>> GetParcelas(long id)
        => Ok(await _service.GetParcelasAsync(id));

    [HttpPost("parcelas/{parcelaId:long}/pagar")]
    public async Task<IActionResult> PagarParcela(long parcelaId, PagarParcelaDto dto)
        => await _service.PagarParcelaAsync(parcelaId, dto.DataPagamento) ? NoContent() : BadRequest(new ApiErrorResponse("PAGAMENTO_INVALIDO", "Parcela não encontrada, já paga ou conta não está em aberto."));

    [HttpPost("{id:long}/cancelar")]
    public async Task<IActionResult> Cancelar(long id)
        => await _service.CancelarAsync(id) ? NoContent() : NotFound();
}