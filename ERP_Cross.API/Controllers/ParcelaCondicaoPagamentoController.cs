#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ParcelaCondicaoPagamentoController(ParcelaCondicaoPagamentoService service) : ControllerBase
{
    private readonly ParcelaCondicaoPagamentoService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ParcelaCondicaoPagamentoView>>> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("condicao/{condicaoId:int}")]
    public async Task<ActionResult<IEnumerable<ParcelaCondicaoPagamento>>> GetByCondicaoId(int condicaoId)
        => Ok(await _service.GetByCondicaoIdAsync(condicaoId));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ParcelaCondicaoPagamentoView>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ParcelaCondicaoPagamentoView>> Create(CreateParcelaCondicaoPagamentoDto dto)
    {
        var item = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateParcelaCondicaoPagamentoDto dto)
        => await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

