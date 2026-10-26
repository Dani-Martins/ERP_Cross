#nullable enable
using ERP_Cross.API.Entities;
using ERP_Cross.API.Errors;
using ERP_Cross.API.Models;
using ERP_Cross.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERP_Cross.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotaCompraController(NotaCompraService service) : ControllerBase
{
    private readonly NotaCompraService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotaCompraView>>> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id:long}")]
    public async Task<ActionResult<NotaCompraView>> GetById(long id)
    {
        var item = await _service.GetByIdAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<NotaCompraView>> Create(CreateNotaCompraDto dto)
    {
        var erroData = ValidarDatas(dto.DataEmissao, dto.DataChegada);
        if (erroData != null) return BadRequest(erroData);

        try
        {
            var item = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, UpdateNotaCompraDto dto)
    {
        var erroData = ValidarDatas(dto.DataEmissao, dto.DataChegada);
        if (erroData != null) return BadRequest(erroData);
        return await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();
    }

    [HttpPost("{id:long}/cancelar-conta")]
    public async Task<IActionResult> CancelarConta(long id)
    {
        var erro = await _service.CancelarContaPagarAsync(id);
        return erro == null ? NoContent() : Conflict(new { message = erro });
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
        => await _service.DeleteAsync(id) ? NoContent() : NotFound();

    private static ApiErrorResponse? ValidarDatas(DateTime emissao, DateTime? chegada)
    {
        if (emissao.Date > DateTime.Today)
            return new ApiErrorResponse("DATA_EMISSAO_FUTURA", "A data de emissão não pode ser posterior à data atual.");
        if (chegada?.Date > DateTime.Today)
            return new ApiErrorResponse("DATA_CHEGADA_FUTURA", "A data de chegada não pode ser posterior à data atual.");
        return null;
    }
}

