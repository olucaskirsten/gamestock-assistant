using GameStock.Api.Models;

namespace GameStock.Api.Services;

public class ProductService
{
    private readonly List<Product> _products = new()
    {
        new Product(1, "God of War", 199.90m, new ConsoleGame("PlayStation"), 10),
        new Product(2, "Halo Infinite", 249.90m, new ConsoleGame("Xbox"), 5),
        new Product(3, "Zelda: Breath of the Wild", 299.90m, new ConsoleGame("Nintendo"), 8),
        new Product(4, "The Last of Us", 279.90m, new ConsoleGame("PlayStation"), 7)
    };

    private int _nextId = 5;

    public List<ProductResponse> GetAll()
    {
        return _products.Select(ToResponse).ToList();
    }

    public List<ProductResponse> GetByConsole(string console)
    {
        return _products
            .Where(product => product.Console.Name.Equals(console, StringComparison.OrdinalIgnoreCase))
            .Select(ToResponse)
            .ToList();
    }

    public ProductResponse? GetById(int id)
    {
        var product = _products.FirstOrDefault(item => item.Id == id);
        return product is null ? null : ToResponse(product);
    }

    public List<ProductResponse> GetByName(string name)
    {
    return _products
        .Where(product => product.Name.Contains(name, StringComparison.OrdinalIgnoreCase))
        .Select(ToResponse)
        .ToList();
    }

    public OperationResult Create(ProductCreateRequest request)
    {
        var validation = Validate(request.Name, request.Price, request.Console, request.Quantity);

        if (!validation.Success)
        {
            return validation;
        }

        var product = new Product(
            _nextId++,
            request.Name.Trim(),
            request.Price,
            new ConsoleGame(request.Console.Trim()),
            request.Quantity
        );

        _products.Add(product);

        return new OperationResult(true, "Product created successfully.", 201, ToResponse(product));
    }

    public OperationResult Update(int id, ProductUpdateRequest request)
    {
        var product = _products.FirstOrDefault(item => item.Id == id);

        if (product is null)
        {
            return new OperationResult(false, "Product not found.", 404);
        }

        var validation = Validate(request.Name, request.Price, request.Console, request.Quantity);

        if (!validation.Success)
        {
            return validation;
        }

        product.Name = request.Name.Trim();
        product.Price = request.Price;
        product.Console = new ConsoleGame(request.Console.Trim());
        product.Quantity = request.Quantity;

        return new OperationResult(true, "Product updated successfully.", 200, ToResponse(product));
    }

    public bool Delete(int id)
    {
        var product = _products.FirstOrDefault(item => item.Id == id);

        if (product is null)
        {
            return false;
        }

        _products.Remove(product);
        return true;
    }

    public StockSummary GetSummary()
    {
        return new StockSummary(
            _products.Count,
            _products.Sum(product => product.Quantity),
            _products.Sum(product => product.TotalStockValue()),
            _products.Count(product => product.Quantity <= 6)
        );
    }

    public List<ProductResponse> GetLowStockProducts(int limit)
    {
        return _products
            .Where(product => product.Quantity <= limit)
            .Select(ToResponse)
            .ToList();
    }

    private static OperationResult Validate(string name, decimal price, string console, int quantity)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return new OperationResult(false, "Product name is required.", 400);
        }

        if (price <= 0)
        {
            return new OperationResult(false, "Price must be greater than zero.", 400);
        }

        if (string.IsNullOrWhiteSpace(console))
        {
            return new OperationResult(false, "Console is required.", 400);
        }

        if (quantity < 0)
        {
            return new OperationResult(false, "Quantity cannot be negative.", 400);
        }

        return new OperationResult(true, "Validation completed.", 200);
    }

    private static ProductResponse ToResponse(Product product)
    {
        var status = product.Quantity <= 0
            ? "Out of stock"
            : product.Quantity <= 6
                ? "Low stock"
                : "Available";

        return new ProductResponse(
            product.Id,
            product.Name,
            product.Price,
            product.Console.Name,
            product.Quantity,
            product.TotalStockValue(),
            status
        );
    }
}
