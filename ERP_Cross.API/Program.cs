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
builder.Services.AddScoped<CargoRepository>();
builder.Services.AddScoped<CategoriaRepository>();
builder.Services.AddScoped<MarcaRepository>();
builder.Services.AddScoped<UnidadeMedidaRepository>();
builder.Services.AddScoped<FormaPagamentoRepository>();
builder.Services.AddScoped<CondicaoPagamentoRepository>();
builder.Services.AddScoped<VeiculoRepository>();
builder.Services.AddScoped<ClienteRepository>();
builder.Services.AddScoped<FornecedorRepository>();
builder.Services.AddScoped<FuncionarioRepository>();
builder.Services.AddScoped<TransportadoraRepository>();
builder.Services.AddScoped<ProdutoRepository>();
builder.Services.AddScoped<ParcelaCondicaoPagamentoRepository>();
builder.Services.AddScoped<NotaCompraRepository>();
builder.Services.AddScoped<NotaCompraItemRepository>();
builder.Services.AddScoped<NotaVendaRepository>();
builder.Services.AddScoped<NotaVendaProdutoRepository>();
builder.Services.AddScoped<ContaPagarRepository>();
builder.Services.AddScoped<ContaReceberRepository>();

// === Registrar Services ===
builder.Services.AddScoped<PaisService>();
builder.Services.AddScoped<EstadoService>();
builder.Services.AddScoped<CidadeService>();
builder.Services.AddScoped<CargoService>();
builder.Services.AddScoped<CategoriaService>();
builder.Services.AddScoped<MarcaService>();
builder.Services.AddScoped<UnidadeMedidaService>();
builder.Services.AddScoped<FormaPagamentoService>();
builder.Services.AddScoped<CondicaoPagamentoService>();
builder.Services.AddScoped<VeiculoService>();
builder.Services.AddScoped<ClienteService>();
builder.Services.AddScoped<FornecedorService>();
builder.Services.AddScoped<FuncionarioService>();
builder.Services.AddScoped<TransportadoraService>();
builder.Services.AddScoped<ProdutoService>();
builder.Services.AddScoped<ParcelaCondicaoPagamentoService>();
builder.Services.AddScoped<NotaCompraService>();
builder.Services.AddScoped<NotaCompraItemService>();
builder.Services.AddScoped<NotaVendaService>();
builder.Services.AddScoped<NotaVendaProdutoService>();
builder.Services.AddScoped<ContaPagarService>();
builder.Services.AddScoped<ContaReceberService>();

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
