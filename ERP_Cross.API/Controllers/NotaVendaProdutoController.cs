#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotaVendaProdutoController(NotaVendaProdutoService service) : ControllerBase
{
    private readonly NotaVendaProdutoService _service = service;

    [HttpGet("{numeroNota}/{modelo}/{serie}/{clienteId:int}")]
    public async Task<ActionResult<IEnumerable<NotaVendaProduto>>> GetByNotaVenda(string numeroNota, string modelo, string serie, int clienteId)
        => Ok(await _service.GetByNotaVendaAsync(numeroNota, modelo, serie, clienteId));

    [HttpGet("{numeroNota}/{modelo}/{serie}/{clienteId:int}/{produtoId:int}")]
    public async Task<ActionResult<NotaVendaProduto>> GetByKey(string numeroNota, string modelo, string serie, int clienteId, int produtoId)
    {
        var item = await _service.GetByKeyAsync(numeroNota, modelo, serie, clienteId, produtoId);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<NotaVendaProdutoView>> Create(CreateNotaVendaProdutoDto dto)
    {
        var item = await _service.CreateAsync(dto);
        return item == null ? BadRequest() : Ok(item);
    }

    [HttpPut("{numeroNota}/{modelo}/{serie}/{clienteId:int}/{produtoId:int}")]
    public async Task<IActionResult> Update(string numeroNota, string modelo, string serie, int clienteId, int produtoId, UpdateNotaVendaProdutoDto dto)
        => await _service.UpdateAsync(numeroNota, modelo, serie, clienteId, produtoId, dto) ? NoContent() : NotFound();

    [HttpDelete("{numeroNota}/{modelo}/{serie}/{clienteId:int}/{produtoId:int}")]
    public async Task<IActionResult> Delete(string numeroNota, string modelo, string serie, int clienteId, int produtoId)
        => await _service.DeleteAsync(numeroNota, modelo, serie, clienteId, produtoId) ? NoContent() : NotFound();
}

