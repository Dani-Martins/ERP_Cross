#nullable enable
namespace ERP_Cross.API.Errors;

public class ApiErrorResponse
{
    public string Code { get; set; }
    public string Message { get; set; }

    public ApiErrorResponse(string code, string message)
    {
        Code = code;
        Message = message;
    }
}
