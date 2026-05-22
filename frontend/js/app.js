const user = JSON.parse(localStorage.getItem("gamestock_user"));

if (!user) {
  window.location.href = "login.html";
}

const chatWindow = document.querySelector("#chatWindow");
const quickActions = document.querySelector("#quickActions");
const logoutBtn = document.querySelector("#logoutBtn");
const userGreeting = document.querySelector("#userGreeting");

userGreeting.textContent = `Hello, ${user.name}!`;

const formatCurrency = (value) =>
  Number(value).toLocaleString("en-US", { style: "currency", currency: "USD" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function addMessage(content, type = "assistant") {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.innerHTML = content;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function botMessage(content) {
  await sleep(250);
  addMessage(content, "assistant");
}

function userMessage(content) {
  addMessage(content, "user");
}

function createProductCard(product) {
  return `
    <article class="product-card">
      <div>
        <strong>${product.name}</strong>
        <span>${product.console}</span>
      </div>
      <ul>
        <li><b>ID:</b> ${product.id}</li>
        <li><b>Price:</b> ${formatCurrency(product.price)}</li>
        <li><b>Quantity:</b> ${product.quantity}</li>
        <li><b>Total:</b> ${formatCurrency(product.totalStockValue)}</li>
        <li><b>Status:</b> ${product.status}</li>
      </ul>
    </article>
  `;
}

function createProductList(products) {
  if (!products.length) {
    return "<p>No products found.</p>";
  }

  return `<div class="product-grid">${products.map(createProductCard).join("")}</div>`;
}

function createForm(fields, buttonText, onSubmit) {
  const form = document.createElement("form");
  form.className = "chat-form";

  form.innerHTML = fields.map((field) => `
    <label>
      ${field.label}
      <input
        name="${field.name}"
        type="${field.type || "text"}"
        placeholder="${field.placeholder || ""}"
        value="${field.value || ""}"
        ${field.required === false ? "" : "required"}
      />
    </label>
  `).join("") + `<button type="submit">${buttonText}</button>`;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    form.querySelector("button").disabled = true;

    try {
      await onSubmit(data);
      form.remove();
    } catch (error) {
      addMessage(error.message, "assistant error");
      form.querySelector("button").disabled = false;
    }
  });

  const wrapper = document.createElement("div");
  wrapper.className = "message assistant";
  wrapper.appendChild(form);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function refreshSummary() {
  try {
    const summary = await api.getSummary();

    document.querySelector("#metricProducts").textContent = summary.totalProducts;
    document.querySelector("#metricUnits").textContent = summary.totalUnits;
    document.querySelector("#metricValue").textContent = formatCurrency(summary.totalStockValue);
  } catch {
    document.querySelector("#metricProducts").textContent = "-";
    document.querySelector("#metricUnits").textContent = "-";
    document.querySelector("#metricValue").textContent = "API offline";
  }
}

async function listProducts() {
  userMessage("View inventory");
  await botMessage("Sure. I will fetch the products registered in the C# API.");

  const products = await api.getProducts();
  await botMessage(createProductList(products));
  await refreshSummary();
}

async function showCreateForm() {
  userMessage("Add product");
  await botMessage("Perfect. Fill in the new product details so I can add it to the inventory.");

  createForm(
    [
      { label: "Product name", name: "name", placeholder: "Example: Spider-Man 2" },
      { label: "Price", name: "price", type: "number", placeholder: "249.90" },
      { label: "Console", name: "console", placeholder: "PlayStation, Xbox, Nintendo..." },
      { label: "Quantity", name: "quantity", type: "number", placeholder: "10" }
    ],
    "Add product",
    async (data) => {
      const created = await api.createProduct({
        name: data.name,
        price: Number(data.price),
        console: data.console,
        quantity: Number(data.quantity)
      });

      userMessage(`Add ${created.name}`);
      await botMessage("Product created successfully in the API.");
      await botMessage(createProductCard(created));
      await refreshSummary();
    }
  );
}

async function showSearchForm() {
  userMessage("Find product");
  await botMessage("Enter the product ID you want to view.");

  createForm(
    [{ label: "Product ID", name: "id", type: "number", placeholder: "Example: 1" }],
    "Find",
    async (data) => {
      const product = await api.getProduct(Number(data.id));
      userMessage(`Find product ID ${data.id}`);
      await botMessage("I found this product:");
      await botMessage(createProductCard(product));
    }
  );
}

async function showUpdateForm() {
  userMessage("Update product");
  await botMessage("Enter the product ID and the new product details.");

  createForm(
    [
      { label: "Product ID", name: "id", type: "number", placeholder: "Example: 1" },
      { label: "New name", name: "name", placeholder: "Example: God of War Ragnarök" },
      { label: "New price", name: "price", type: "number", placeholder: "199.90" },
      { label: "New console", name: "console", placeholder: "PlayStation" },
      { label: "New quantity", name: "quantity", type: "number", placeholder: "12" }
    ],
    "Update product",
    async (data) => {
      const updated = await api.updateProduct(Number(data.id), {
        name: data.name,
        price: Number(data.price),
        console: data.console,
        quantity: Number(data.quantity)
      });

      userMessage(`Update product ID ${data.id}`);
      await botMessage("Product updated successfully.");
      await botMessage(createProductCard(updated));
      await refreshSummary();
    }
  );
}

async function showAlerts() {
  userMessage("View stock alerts");
  await botMessage("I will check for products with low stock.");

  const products = await api.getLowStock();

  if (!products.length) {
    await botMessage("There are no low-stock products right now.");
    return;
  }

  await botMessage(createProductList(products));
}

async function showSummary() {
  userMessage("Generate summary");
  const summary = await api.getSummary();

  await botMessage(`
    <div class="summary-card">
      <strong>General inventory summary</strong>
      <p>Total products: ${summary.totalProducts}</p>
      <p>Total units: ${summary.totalUnits}</p>
      <p>Total inventory value: ${formatCurrency(summary.totalStockValue)}</p>
      <p>Items on alert: ${summary.lowStockItems}</p>
    </div>
  `);

  await refreshSummary();
}

async function handleAction(action) {
  try {
    if (action === "list") await listProducts();
    if (action === "create") await showCreateForm();
    if (action === "search") await showSearchForm();
    if (action === "update") await showUpdateForm();
    if (action === "alerts") await showAlerts();
    if (action === "summary") await showSummary();
  } catch (error) {
    await botMessage(`I could not complete the action: ${error.message}`);
  }
}

quickActions.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) return;

  handleAction(button.dataset.action);
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("gamestock_user");
  window.location.href = "login.html";
});

async function init() {
  await botMessage(`
    Welcome to GameStock Assistant. I can view inventory, add products,
    find products by ID, update product details, and generate low-stock alerts.
  `);

  await refreshSummary();
}

init();
