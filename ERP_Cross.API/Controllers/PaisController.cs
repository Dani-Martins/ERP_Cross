using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaisController(PaisService service) : ControllerBase
{
    private readonly PaisService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaisView>>> GetAll([FromQuery] string? q)
        => Ok(await _service.GetAllAsync(q));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PaisView>> GetById(int id)
    {
        var pais = await _service.GetByIdAsync(id);
        return pais == null ? NotFound() : Ok(pais);
    }

    [HttpPost]
    public async Task<ActionResult<PaisView>> Create([FromBody] CreatePaisDto dto)
    {
        var pais = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = pais.Id }, pais);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePaisDto dto)
        => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
