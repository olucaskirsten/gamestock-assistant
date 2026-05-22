# GameStock Assistant — Front-end + C# API

Portfolio project based on the academic project **Game Store - C#**.

This version turns the original console-based logic into an application with:

- C# / ASP.NET Core API;
- front-end built with HTML, CSS, and JavaScript;
- login screen;
- WhatsApp-inspired conversational interface;
- fixed message input bar;
- numbered menu operated by typing commands;
- product creation, inventory listing, product lookup, product updates, product deletion, alerts, and inventory summary.

---

## Project structure

```txt
GameStock_Assistant_Portfolio/
├── backend/
│   └── GameStock.Api/
│       ├── Models/
│       ├── Services/
│       ├── Program.cs
│       └── GameStock.Api.csproj
│
├── frontend/
│   ├── login.html
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js
│       ├── login.js
│       └── app.js
│
└── original-console/
    └── game-store-console/
```

---

## Demo login

```txt
Email: admin@gamestock.com
Password: 123456
```

---

## How to run the back-end

Open the API folder:

```bash
cd backend/GameStock.Api
dotnet run
```

The API should start on an address similar to:

```txt
http://localhost:5187
```

Test it in the browser:

```txt
http://localhost:5187/api/products
```

If a JSON list appears, the back-end is running correctly.

---

## How to run the front-end

Open the `frontend` folder in VS Code and use the **Live Server** extension.

1. Right-click `login.html`;
2. Select **Open with Live Server**;
3. Log in using the demo credentials;
4. Click **Initiate conversation**;
5. Type a number in the message bar to use the system.

The front-end is configured to call the API at:

```js
const API_BASE_URL = "http://localhost:5187";
```

If `dotnet run` shows another port, update this value in:

```txt
frontend/js/api.js
```

---

## Conversational menu

```txt
0 - Show this menu again
1 - View inventory
2 - Add a new product
3 - Find a product by ID
4 - Update a product
5 - Delete a product
6 - View low-stock alerts
7 - Generate inventory summary
8 - Filter products by console
9 - End conversation
```

The interface also accepts text commands such as:

```txt
view inventory
add product
find product
update product
delete product
low stock
summary
filter by console
```

During creation or update flows, the assistant asks for each value directly inside the chat. The user answers by typing in the fixed message bar.

---

## Main API routes

```txt
POST   /api/auth/login
GET    /api/products
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
GET    /api/products/summary
GET    /api/products/alerts/low-stock
```

---

## About the project

The original project was a C# console application with:

- product creation;
- product listing;
- product search by name;
- product deletion;
- product updates;
- total inventory value calculation.

In this version, the logic was reorganized into a structure closer to a real application, separating:

- **Models:** data representation;
- **Services:** business rules and operations;
- **Program.cs:** API configuration and routes;
- **Front-end:** visual interface and user experience.

---

## Important note

This version uses in-memory data. This means that products created during testing are lost when the API stops running.

Possible future improvements:

- database persistence;
- JWT authentication;
- real user registration;
- chart-based dashboard;
- sales history;
- front-end deployment separated from the API.
