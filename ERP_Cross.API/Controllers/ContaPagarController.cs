using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContaPagarController(ContaPagarService service) : ControllerBase
{
    private readonly ContaPagarService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContaPagarView>>> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ContaPagarView>> GetById(long id)
    {
        var item = await _service.GetByIdAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ContaPagarView>> Create(CreateContaPagarDto dto)
    {
        var item = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, UpdateContaPagarDto dto)
        => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
