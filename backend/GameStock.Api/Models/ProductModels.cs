namespace GameStock.Api.Models;

public class ConsoleGame
{
    public string Name { get; set; }

    public ConsoleGame(string name)
    {
        Name = name;
    }
}

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public ConsoleGame Console { get; set; }
    public int Quantity { get; set; }

    public Product(int id, string name, decimal price, ConsoleGame console, int quantity)
    {
        Id = id;
        Name = name;
        Price = price;
        Console = console;
        Quantity = quantity;
    }

    public decimal TotalStockValue()
    {
        return Price * Quantity;
    }
}

public record ProductResponse(
    int Id,
    string Name,
    decimal Price,
    string Console,
    int Quantity,
    decimal TotalStockValue,
    string Status
);

public record ProductCreateRequest(
    string Name,
    decimal Price,
    string Console,
    int Quantity
);

public record ProductUpdateRequest(
    string Name,
    decimal Price,
    string Console,
    int Quantity
);

public record LoginRequest(
    string Email,
    string Password
);

public record LoggedUser(
    string Name,
    string Email,
    string Role
);

public record LoginResponse(
    bool Success,
    string Message,
    LoggedUser User
);

public record StockSummary(
    int TotalProducts,
    int TotalUnits,
    decimal TotalStockValue,
    int LowStockItems
);

public record OperationResult(
    bool Success,
    string Message,
    int StatusCode,
    ProductResponse? Product = null
);
