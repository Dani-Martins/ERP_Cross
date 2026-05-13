#nullable enable
using System.Net;
using System.Text.Json;
using ERP_Cross.API.Errors;

namespace ERP_Cross.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ArgumentException ex)
        {
            await WriteErrorAsync(context, HttpStatusCode.BadRequest, "BUSINESS_RULE", ex.Message);
        }
        catch (Exception)
        {
            await WriteErrorAsync(context, HttpStatusCode.InternalServerError, "INTERNAL_ERROR", "Ocorreu um erro interno no servidor.");
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, HttpStatusCode statusCode, string code, string message)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new ApiErrorResponse(code, message);
        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
