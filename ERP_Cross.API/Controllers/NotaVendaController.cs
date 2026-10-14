#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotaVendaController(NotaVendaService service) : ControllerBase
{
    private readonly NotaVendaService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotaVendaView>>> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpPost("sincronizar-contas-receber")]
    public async Task<IActionResult> SincronizarContasReceber()
        => Ok(new { parcelasCriadas = await _service.SincronizarContasReceberAsync() });

    [HttpGet("{numeroNota}/{modelo}/{serie}")]
    public async Task<ActionResult<NotaVenda>> GetByKey(string numeroNota, string modelo, string serie)
    {
        var item = await _service.GetByKeyAsync(numeroNota, modelo, serie);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<NotaVendaView>> Create(CreateNotaVendaDto dto)
    {
        try
        {
            var item = await _service.CreateAsync(dto);
            return item == null ? BadRequest() : Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{numeroNota}/{modelo}/{serie}")]
    public async Task<IActionResult> Update(string numeroNota, string modelo, string serie, UpdateNotaVendaDto dto)
        => await _service.UpdateAsync(numeroNota, modelo, serie, dto) ? NoContent() : NotFound();

    [HttpDelete("{numeroNota}/{modelo}/{serie}")]
    public async Task<IActionResult> Delete(string numeroNota, string modelo, string serie)
        => await _service.DeleteAsync(numeroNota, modelo, serie) ? NoContent() : NotFound();

    [HttpGet("proximo-numero/{modelo}/{serie}")]
    public async Task<ActionResult<string>> GetNextNumeroNota(string modelo, string serie)
    {
        var proximoNumero = await _service.GetNextNumeroNotaAsync(modelo, serie);
        return Ok(proximoNumero);
    }
}

