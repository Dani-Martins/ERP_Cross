using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EstadoController : ControllerBase
{
    private readonly EstadoService _service;

    public EstadoController(EstadoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var estados = await _service.GetAllAsync();
        return Ok(estados);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var estado = await _service.GetByIdAsync(id);
        if (estado == null) return NotFound();
        return Ok(estado);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEstadoDto dto)
    {
        var estado = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = estado.Id }, estado);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEstadoDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
