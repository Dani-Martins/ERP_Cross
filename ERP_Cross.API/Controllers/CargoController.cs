#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CargoController(CargoService service) : ControllerBase
{
    private readonly CargoService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CargoView>>> GetAll([FromQuery] string? q)
        => Ok(await _service.GetAllAsync(q));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CargoView>> GetById(int id)
    {
        var cargo = await _service.GetByIdAsync(id);
        return cargo == null ? NotFound() : Ok(cargo);
    }

    [HttpPost]
    public async Task<ActionResult<CargoView>> Create([FromBody] CreateCargoDto dto)
    {
        var cargo = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = cargo.Id }, cargo);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCargoDto dto)
        => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

