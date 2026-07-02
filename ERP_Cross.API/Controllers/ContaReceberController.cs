#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContaReceberController(ContaReceberService service) : ControllerBase
{
    private readonly ContaReceberService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContaReceberView>>> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("proximo-numero")]
    public async Task<ActionResult<long>> GetProximoNumero()
        => Ok(await _service.GetProximoNumeroNotaAsync());

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ContaReceberView>> GetById(long id)
    {
        var item = await _service.GetByIdAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ContaReceberView>> Create(CreateContaReceberDto dto)
    {
        var item = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPost("lote")]
    public async Task<ActionResult<IEnumerable<ContaReceberView>>> CreateLote(CreateContaReceberLoteDto dto)
    {
        try
        {
            var items = await _service.CreateLoteAsync(dto);
            return Ok(items);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("baixa-lote")]
    public async Task<IActionResult> BaixaLote(BaixaContaReceberLoteDto dto)
    {
        var count = await _service.BaixaLoteAsync(dto);
        return Ok(new { atualizadas = count });
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, UpdateContaReceberDto dto)
        => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

