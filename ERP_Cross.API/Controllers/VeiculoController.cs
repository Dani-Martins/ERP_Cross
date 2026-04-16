using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VeiculoController(VeiculoService service) : ControllerBase
{
    private readonly VeiculoService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VeiculoView>>> GetAll([FromQuery] string? q)
        => Ok(await _service.GetAllAsync(q));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VeiculoView>> GetById(int id)
    {
        var veiculo = await _service.GetByIdAsync(id);
        return veiculo == null ? NotFound() : Ok(veiculo);
    }

    [HttpPost]
    public async Task<ActionResult<VeiculoView>> Create([FromBody] CreateVeiculoDto dto)
    {
        var veiculo = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = veiculo.Id }, veiculo);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateVeiculoDto dto)
        => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
