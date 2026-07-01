#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClienteController(ClienteService service) : ControllerBase
{
    private readonly ClienteService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClienteView>>> GetAll([FromQuery] string? q)
        => Ok(await _service.GetAllAsync(q));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClienteView>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ClienteView>> Create(CreateClienteDto dto)
    {
        try { var item = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id = item.Id }, item); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateClienteDto dto)
    {
        try { return await _service.UpdateAsync(id, dto) ? NoContent() : NotFound(); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

