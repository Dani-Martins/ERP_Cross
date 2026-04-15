using System.Data;
using ERP_Cross.API.Connection;
using ERP_Cross.API.Repositories;
using ERP_Cross.API.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS - permite o frontend acessar a API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Controllers + JSON camelCase
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Conexão com o banco (MariaDB via Dapper)
builder.Services.AddSingleton<DbConnectionFactory>();
builder.Services.AddScoped<IDbConnection>(provider =>
    provider.GetRequiredService<DbConnectionFactory>().CreateConnection());

// === Registrar Repositories ===
builder.Services.AddScoped<PaisRepository>();
builder.Services.AddScoped<EstadoRepository>();
builder.Services.AddScoped<CidadeRepository>();

// === Registrar Services ===
builder.Services.AddScoped<PaisService>();
builder.Services.AddScoped<EstadoService>();
builder.Services.AddScoped<CidadeService>();

var app = builder.Build();

// Swagger habilitado em Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
