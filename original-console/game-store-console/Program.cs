using System;
using System.Collections.Generic;

class Product
{
    public string name;
    public double price;
    public ConsoleGame console;
    public int quantity;

    public Product(string name, double price, ConsoleGame console, int quantity)
    {
        this.name = name;
        this.price = price;
        this.console = console;
        this.quantity = quantity;
    }

    public double TotalInventoryValue()
    {
        return price * quantity;
    }

    public void Display()
    {
        Console.WriteLine("Name: " + name);
        Console.WriteLine("Price: " + price);
        Console.WriteLine("Console: " + console.Name);
        Console.WriteLine("Quantity: " + quantity);
        Console.WriteLine("Total inventory value: " + TotalInventoryValue());
    }
}

class ConsoleGame
{
    public string Name;

    public ConsoleGame(string name)
    {
        Name = name;
    }
}

class Program
{
    static void Main()
    {
        List<Product> products = new List<Product>();

        products.Add(new Product("God of War", 199.90, new ConsoleGame("PlayStation"), 10));
        products.Add(new Product("Halo Infinite", 249.90, new ConsoleGame("Xbox"), 5));
        products.Add(new Product("Zelda: Breath of the Wild", 299.90, new ConsoleGame("Nintendo"), 8));
        products.Add(new Product("The Last of Us", 279.90, new ConsoleGame("PlayStation"), 7));

        int option = 0;
        string searchName;

        do
        {
            Console.WriteLine("
1 - Add product");
            Console.WriteLine("2 - List products");
            Console.WriteLine("3 - Search product");
            Console.WriteLine("4 - Remove product");
            Console.WriteLine("5 - Update product");
            Console.WriteLine("6 - Show total inventory value");
            Console.WriteLine("7 - Exit");

            Console.Write("Enter an option: ");
            option = int.Parse(Console.ReadLine());

            switch (option)
            {
                case 1:
                    Console.Write("Enter the product name: ");
                    string name = Console.ReadLine();

                    Console.Write("Enter the product price: ");
                    double price = double.Parse(Console.ReadLine());

                    Console.Write("Enter the console (PlayStation, Xbox, Nintendo, etc.): ");
                    string consoleName = Console.ReadLine();
                    ConsoleGame console = new ConsoleGame(consoleName);

                    Console.Write("Enter the product quantity: ");
                    int quantity = int.Parse(Console.ReadLine());

                    if (price <= 0)
                    {
                        Console.WriteLine("Price must be greater than 0.");
                        break;
                    }
                    if (quantity < 0)
                    {
                        Console.WriteLine("Invalid quantity.");
                        break;
                    }

                    products.Add(new Product(name, price, console, quantity));
                    Console.WriteLine("Product created successfully.");
                    break;

                case 2:
                    if (products.Count == 0)
                    {
                        Console.WriteLine("No products have been registered yet.");
                        break;
                    }

                    Console.WriteLine("Enter 1 to list all products or 2 to list by console:");
                    int listOption = int.Parse(Console.ReadLine());

                    if (listOption == 1)
                    {
                        foreach (Product product in products)
                        {
                            Console.WriteLine("-------------");
                            product.Display();
                        }
                    }
                    else if (listOption == 2)
                    {
                        Console.Write("Enter the console to filter by: ");
                        string consoleSearch = Console.ReadLine().ToLower();

                        bool found = false;

                        foreach (Product product in products)
                        {
                            if (product.console.Name.ToLower() == consoleSearch)
                            {
                                Console.WriteLine("-------------");
                                product.Display();
                                found = true;
                            }
                        }

                        if (!found)
                        {
                            Console.WriteLine("No products found for this console.");
                        }
                    }
                    else
                    {
                        Console.WriteLine("Invalid option.");
                    }
                    break;

                case 3:
                    Console.Write("Enter the product name to search: ");
                    searchName = Console.ReadLine();

                    bool productFound = false;

                    foreach (Product product in products)
                    {
                        if (product.name.ToLower() == searchName.ToLower())
                        {
                            Console.WriteLine("Product found:");
                            product.Display();
                            productFound = true;
                            break;
                        }
                    }

                    if (!productFound)
                    {
                        Console.WriteLine("Product not found.");
                    }
                    break;

                case 4:
                    Console.Write("Enter the product name to remove: ");
                    searchName = Console.ReadLine();

                    Product removeProduct = null;

                    foreach (Product product in products)
                    {
                        if (product.name.ToLower() == searchName.ToLower())
                        {
                            removeProduct = product;
                            break;
                        }
                    }

                    if (removeProduct != null)
                    {
                        products.Remove(removeProduct);
                        Console.WriteLine("Product removed.");
                    }
                    else
                    {
                        Console.WriteLine("Product not found.");
                    }
                    break;

                case 5:
                    Console.Write("Enter the product name you want to update: ");
                    searchName = Console.ReadLine();

                    bool updated = false;

                    foreach (Product product in products)
                    {
                        if (product.name.ToLower() == searchName.ToLower())
                        {
                            Console.WriteLine("Product found. Enter the new data:");

                            Console.Write("New name: ");
                            product.name = Console.ReadLine();

                            Console.Write("New price: ");
                            double newPrice = double.Parse(Console.ReadLine());
                            if (newPrice <= 0)
                            {
                                Console.WriteLine("Invalid price.");
                                break;
                            }
                            product.price = newPrice;

                            Console.Write("New console: ");
                            string newConsole = Console.ReadLine();
                            product.console = new ConsoleGame(newConsole);

                            Console.Write("New quantity: ");
                            product.quantity = int.Parse(Console.ReadLine());

                            Console.WriteLine("Product updated successfully.");
                            updated = true;
                            break;
                        }
                    }

                    if (!updated)
                    {
                        Console.WriteLine("Product not found.");
                    }
                    break;

                case 6:
                    double totalValue = 0;

                    foreach (Product product in products)
                    {
                        totalValue += product.TotalInventoryValue();
                    }

                    Console.WriteLine("Total inventory value: " + totalValue);
                    break;

                case 7:
                    Console.WriteLine("Closing the system...");
                    break;

                default:
                    Console.WriteLine("Invalid option.");
                    break;
            }

        } while (option != 7);
    }
}
