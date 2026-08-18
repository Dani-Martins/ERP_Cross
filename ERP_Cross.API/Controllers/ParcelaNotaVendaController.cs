#nullable enable
using Microsoft.AspNetCore.Mvc;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ParcelaNotaVendaController : ControllerBase
{
    private readonly ParcelaNotaVendaService _service;

    public ParcelaNotaVendaController(ParcelaNotaVendaService service)
    {
        _service = service;
    }

    [HttpGet("por-nota/{numeroNota}/{modelo}/{serie}/{clienteId}")]
    public async Task<ActionResult<IEnumerable<ParcelaNotaVendaView>>> GetByNota(string numeroNota, string modelo, string serie, int clienteId)
    {
        var parcelas = await _service.GetByNotaAsync(numeroNota, modelo, serie, clienteId);
        return Ok(parcelas);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ParcelaNotaVendaView>> GetById(long id)
    {
        var parcela = await _service.GetByIdAsync(id);
        if (parcela == null) return NotFound();
        return Ok(parcela);
    }

    [HttpPost("calcular/{numeroNota}/{modelo}/{serie}/{clienteId}/{condicaoPagamentoId}")]
    public async Task<ActionResult> CalculateAndSave(string numeroNota, string modelo, string serie, int clienteId, int condicaoPagamentoId, [FromQuery] decimal totalNota)
    {
        var result = await _service.CalculateAndSaveAsync(numeroNota, modelo, serie, clienteId, condicaoPagamentoId, totalNota);
        return result ? Ok(new { message = "Parcelas calculadas e salvas com sucesso" }) : BadRequest(new { message = "Erro ao calcular parcelas" });
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateParcelaNotaVendaDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _service.CreateAsync(dto);
        return result ? Ok(new { message = "Parcela adicionada com sucesso" }) : BadRequest(new { message = "Erro ao adicionar parcela" });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(long id, [FromBody] UpdateParcelaNotaVendaDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _service.UpdateAsync(id, dto);
        return result ? Ok(new { message = "Parcela atualizada com sucesso" }) : NotFound(new { message = "Parcela não encontrada" });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(long id)
    {
        var result = await _service.DeleteAsync(id);
        return result ? Ok(new { message = "Parcela removida com sucesso" }) : NotFound(new { message = "Parcela não encontrada" });
    }
}
