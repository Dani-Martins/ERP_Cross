using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CondicaoPagamentoController(CondicaoPagamentoService service) : ControllerBase
{
    private readonly CondicaoPagamentoService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CondicaoPagamentoView>>> GetAll([FromQuery] string? q)
        => Ok(await _service.GetAllAsync(q));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CondicaoPagamentoView>> GetById(int id)
    {
        var condicao = await _service.GetByIdAsync(id);
        return condicao == null ? NotFound() : Ok(condicao);
    }

    [HttpPost]
    public async Task<ActionResult<CondicaoPagamentoView>> Create([FromBody] CreateCondicaoPagamentoDto dto)
    {
        var condicao = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = condicao.Id }, condicao);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCondicaoPagamentoDto dto)
        => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
