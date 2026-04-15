using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaisController : ControllerBase
{
    private readonly PaisService _service;

    public PaisController(PaisService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var paises = await _service.GetAllAsync();
        return Ok(paises);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var pais = await _service.GetByIdAsync(id);
        if (pais == null) return NotFound();
        return Ok(pais);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePaisDto dto)
    {
        var pais = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = pais.Id }, pais);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePaisDto dto)
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
