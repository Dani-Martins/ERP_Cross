using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CidadeController(CidadeService service) : ControllerBase
{
    private readonly CidadeService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CidadeView>>> GetAll([FromQuery] string? q)
        => Ok(await _service.GetAllAsync(q));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CidadeView>> GetById(int id)
    {
        var cidade = await _service.GetByIdAsync(id);
        return cidade == null ? NotFound() : Ok(cidade);
    }

    [HttpPost]
    public async Task<ActionResult<CidadeView>> Create([FromBody] CreateCidadeDto dto)
    {
        var cidade = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = cidade.Id }, cidade);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCidadeDto dto)
        => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
