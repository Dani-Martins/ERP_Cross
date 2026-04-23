using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ERP_Cross.API.Serialization;

public class FlexibleDateTimeConverter : JsonConverter<DateTime>
{
    private static readonly string[] AcceptedFormats =
    [
        "dd/MM/yyyy"
    ];

    private const string OutputFormat = "dd/MM/yyyy";

    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.String)
            throw new JsonException("Data invalida. Informe uma string de data.");

        var text = reader.GetString();
        if (string.IsNullOrWhiteSpace(text))
            throw new JsonException("Data invalida. Valor vazio nao e aceito.");

        if (TryParseDate(text, out var value))
            return value;

        throw new JsonException("Data invalida. Use somente o formato dd/MM/yyyy.");
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        => writer.WriteStringValue(value.ToString(OutputFormat, CultureInfo.GetCultureInfo("pt-BR")));

    internal static bool TryParseDate(string text, out DateTime value)
    {
        return DateTime.TryParseExact(
            text,
            AcceptedFormats,
            CultureInfo.GetCultureInfo("pt-BR"),
            DateTimeStyles.None,
            out value);
    }
}

public class FlexibleNullableDateTimeConverter : JsonConverter<DateTime?>
{
    public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
            return null;

        if (reader.TokenType != JsonTokenType.String)
            throw new JsonException("Data invalida. Informe uma string de data.");

        var text = reader.GetString();
        if (string.IsNullOrWhiteSpace(text))
            return null;

        if (FlexibleDateTimeConverter.TryParseDate(text, out var value))
            return value;

        throw new JsonException("Data invalida. Use somente o formato dd/MM/yyyy.");
    }

    public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
        {
            writer.WriteStringValue(value.Value.ToString("dd/MM/yyyy", CultureInfo.GetCultureInfo("pt-BR")));
            return;
        }

        writer.WriteNullValue();
    }
}