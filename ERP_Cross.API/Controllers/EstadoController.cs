#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EstadoController(EstadoService service) : ControllerBase
{
    private readonly EstadoService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EstadoView>>> GetAll([FromQuery] string? q)
        => Ok(await _service.GetAllAsync(q));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EstadoView>> GetById(int id)
    {
        var estado = await _service.GetByIdAsync(id);
        return estado == null ? NotFound() : Ok(estado);
    }

    [HttpPost]
    public async Task<ActionResult<EstadoView>> Create([FromBody] CreateEstadoDto dto)
    {
        var estado = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = estado.Id }, estado);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEstadoDto dto)
        => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

