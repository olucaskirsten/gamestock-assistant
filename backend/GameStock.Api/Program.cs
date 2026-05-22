using GameStock.Api.Models;
using GameStock.Api.Services;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicy = "FrontendPolicy";

builder.Services.AddSingleton<ProductService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors(CorsPolicy);

app.MapGet("/", () => Results.Ok(new
{
    message = "GameStock API is running.",
    version = "1.0",
    endpoints = new[]
    {
        "POST /api/auth/login",
        "GET /api/products",
        "GET /api/products/{id}",
        "POST /api/products",
        "PUT /api/products/{id}",
        "DELETE /api/products/{id}",
        "GET /api/products/summary",
        "GET /api/products/alerts/low-stock"
    }
}));

app.MapPost("/api/auth/login", (LoginRequest request) =>
{
    var validEmail = request.Email.Trim().Equals("admin@gamestock.com", StringComparison.OrdinalIgnoreCase);
    var validPassword = request.Password == "123456";

    if (!validEmail || !validPassword)
    {
        return Results.Unauthorized();
    }

    return Results.Ok(new LoginResponse(
        true,
        "Login completed successfully.",
        new LoggedUser("GameStock Admin", "admin@gamestock.com", "Manager")
    ));
});

app.MapGet("/api/products", (ProductService service, string? console) =>
{
    var products = string.IsNullOrWhiteSpace(console)
        ? service.GetAll()
        : service.GetByConsole(console);

    return Results.Ok(products);
});

app.MapGet("/api/products/{id:int}", (ProductService service, int id) =>
{
    var product = service.GetById(id);
    return product is null ? Results.NotFound(new { message = "Product not found." }) : Results.Ok(product);
});

app.MapGet("/api/products/search", (ProductService service, string name) =>
{
    var products = service.GetByName(name);

    return products.Count == 0
        ? Results.NotFound(new { message = "No products found with that name." })
        : Results.Ok(products);
});

app.MapPost("/api/products", (ProductService service, ProductCreateRequest request) =>
{
    var result = service.Create(request);

    if (!result.Success)
    {
        return Results.BadRequest(new { message = result.Message });
    }

    return Results.Created($"/api/products/{result.Product!.Id}", result.Product);
});

app.MapPut("/api/products/{id:int}", (ProductService service, int id, ProductUpdateRequest request) =>
{
    var result = service.Update(id, request);

    if (!result.Success)
    {
        return result.StatusCode == 404
            ? Results.NotFound(new { message = result.Message })
            : Results.BadRequest(new { message = result.Message });
    }

    return Results.Ok(result.Product);
});

app.MapDelete("/api/products/{id:int}", (ProductService service, int id) =>
{
    var removed = service.Delete(id);

    return removed
        ? Results.Ok(new { message = "Product removed successfully." })
        : Results.NotFound(new { message = "Product not found." });
});

app.MapGet("/api/products/summary", (ProductService service) =>
{
    return Results.Ok(service.GetSummary());
});

app.MapGet("/api/products/alerts/low-stock", (ProductService service, int? limit) =>
{
    return Results.Ok(service.GetLowStockProducts(limit ?? 6));
});

app.Run();
