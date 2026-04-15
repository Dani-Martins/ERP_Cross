using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CidadeController : ControllerBase
{
    private readonly CidadeService _service;

    public CidadeController(CidadeService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cidades = await _service.GetAllAsync();
        return Ok(cidades);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cidade = await _service.GetByIdAsync(id);
        if (cidade == null) return NotFound();
        return Ok(cidade);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCidadeDto dto)
    {
        var cidade = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = cidade.Id }, cidade);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCidadeDto dto)
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
