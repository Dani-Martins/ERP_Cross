using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FormaPagamentoController(FormaPagamentoService service) : ControllerBase
{
    private readonly FormaPagamentoService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FormaPagamentoView>>> GetAll([FromQuery] string? q)
        => Ok(await _service.GetAllAsync(q));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<FormaPagamentoView>> GetById(int id)
    {
        var forma = await _service.GetByIdAsync(id);
        return forma == null ? NotFound() : Ok(forma);
    }

    [HttpPost]
    public async Task<ActionResult<FormaPagamentoView>> Create([FromBody] CreateFormaPagamentoDto dto)
    {
        var forma = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = forma.Id }, forma);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateFormaPagamentoDto dto)
        => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
