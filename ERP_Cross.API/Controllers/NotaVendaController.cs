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

    [HttpGet("{numeroNota}/{modelo}/{serie}/{clienteId:int}")]
    public async Task<ActionResult<NotaVenda>> GetByKey(string numeroNota, string modelo, string serie, int clienteId)
    {
        var item = await _service.GetByKeyAsync(numeroNota, modelo, serie, clienteId);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<NotaVendaView>> Create(CreateNotaVendaDto dto)
    {
        var item = await _service.CreateAsync(dto);
        return item == null ? BadRequest() : Ok(item);
    }

    [HttpPut("{numeroNota}/{modelo}/{serie}/{clienteId:int}")]
    public async Task<IActionResult> Update(string numeroNota, string modelo, string serie, int clienteId, UpdateNotaVendaDto dto)
        => await _service.UpdateAsync(numeroNota, modelo, serie, clienteId, dto) ? NoContent() : NotFound();

    [HttpDelete("{numeroNota}/{modelo}/{serie}/{clienteId:int}")]
    public async Task<IActionResult> Delete(string numeroNota, string modelo, string serie, int clienteId)
        => await _service.DeleteAsync(numeroNota, modelo, serie, clienteId) ? NoContent() : NotFound();
}

