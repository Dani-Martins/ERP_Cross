using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UnidadeMedidaController(UnidadeMedidaService service) : ControllerBase
{
    private readonly UnidadeMedidaService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UnidadeMedidaView>>> GetAll([FromQuery] string? q)
        => Ok(await _service.GetAllAsync(q));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UnidadeMedidaView>> GetById(int id)
    {
        var unidade = await _service.GetByIdAsync(id);
        return unidade == null ? NotFound() : Ok(unidade);
    }

    [HttpPost]
    public async Task<ActionResult<UnidadeMedidaView>> Create([FromBody] CreateUnidadeMedidaDto dto)
    {
        var unidade = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = unidade.Id }, unidade);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUnidadeMedidaDto dto)
        => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
