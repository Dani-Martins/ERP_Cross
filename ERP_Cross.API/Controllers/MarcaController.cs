#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MarcaController(MarcaService service) : ControllerBase
{
    private readonly MarcaService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MarcaView>>> GetAll([FromQuery] string? q)
        => Ok(await _service.GetAllAsync(q));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MarcaView>> GetById(int id)
    {
        var marca = await _service.GetByIdAsync(id);
        return marca == null ? NotFound() : Ok(marca);
    }

    [HttpPost]
    public async Task<ActionResult<MarcaView>> Create([FromBody] CreateMarcaDto dto)
    {
        var marca = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = marca.Id }, marca);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMarcaDto dto)
        => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

