const user = JSON.parse(localStorage.getItem("gamestock_user"));

if (!user) {
  window.location.href = "login.html";
}

const startScreen = document.querySelector("#startScreen");
const startConversationBtn = document.querySelector("#startConversationBtn");
const chatWindow = document.querySelector("#chatWindow");
const messageComposer = document.querySelector("#messageComposer");
const messageInput = document.querySelector("#messageInput");
const logoutBtn = document.querySelector("#logoutBtn");
const userGreeting = document.querySelector("#userGreeting");

userGreeting.textContent = `Hello, ${user.name}!`;

const formatCurrency = (value) =>
  Number(value).toLocaleString("en-US", { style: "currency", currency: "USD" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

let conversationStarted = false;
let currentFlow = null;

function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addMessage(content, type = "assistant", asHtml = true) {
  const message = document.createElement("div");
  message.className = `message ${type}`;

  if (asHtml) {
    message.innerHTML = content;
  } else {
    message.textContent = content;
  }

  chatWindow.appendChild(message);
  scrollToBottom();
}

async function botMessage(content) {
  await sleep(220);
  addMessage(content, "assistant");
}

function userMessage(content) {
  addMessage(content, "user", false);
}

function systemMessage(content) {
  addMessage(content, "system", false);
}

function createProductCard(product) {
  return `
    <article class="product-card">
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <span>${escapeHtml(product.console)}</span>
      </div>
      <ul>
        <li><b>ID:</b> ${product.id}</li>
        <li><b>Price:</b> ${formatCurrency(product.price)}</li>
        <li><b>Quantity:</b> ${product.quantity}</li>
        <li><b>Total:</b> ${formatCurrency(product.totalStockValue)}</li>
        <li><b>Status:</b> ${escapeHtml(product.status)}</li>
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

function createMenu() {
  return `
    <div class="menu-list">
      <strong>Main menu</strong><br>
      0 - Show this menu again<br>
      1 - View inventory<br>
      2 - Add a new product<br>
      3 - Find a product by ID<br>
      4 - Update a product<br>
      5 - Delete a product<br>
      6 - View low-stock alerts<br>
      7 - Generate inventory summary<br>
      8 - Filter products by console<br>
      9 - End conversation<br><br>
      Type a number in the message bar below.
    </div>
  `;
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

async function showMenu() {
  await botMessage(createMenu());
}

async function listProducts() {
  await botMessage("Sure. I will fetch the products registered in the C# API.");
  const products = await api.getProducts();
  await botMessage(createProductList(products));
  await refreshSummary();
  await botMessage("Type 0 to see the main menu again, or type another option number.");
}

async function showAlerts() {
  await botMessage("I will check for products with low stock.");
  const products = await api.getLowStock();

  if (!products.length) {
    await botMessage("There are no low-stock products right now.");
  } else {
    await botMessage(createProductList(products));
  }

  await botMessage("Type 0 to see the main menu again, or type another option number.");
}

async function showSummary() {
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
  await botMessage("Type 0 to see the main menu again, or type another option number.");
}

function setFlow(flow) {
  currentFlow = flow;
}

async function startAddProductFlow() {
  setFlow({
    type: "create",
    step: 0,
    data: {},
    fields: [
      { key: "name", label: "Type the product name." },
      { key: "price", label: "Type the product price." },
      { key: "console", label: "Type the console name." },
      { key: "quantity", label: "Type the product quantity." }
    ]
  });

  await botMessage("Perfect. I will guide you through the product registration.");
  await botMessage(currentFlow.fields[0].label);
}

async function handleAddProductFlow(input) {
  const field = currentFlow.fields[currentFlow.step];
  const value = input.trim();

  if (!value) {
    await botMessage("Please type a value to continue.");
    return;
  }

  if (field.key === "price" && Number(value) <= 0) {
    await botMessage("The price must be greater than zero. Type the product price again.");
    return;
  }

  if (field.key === "quantity" && Number(value) < 0) {
    await botMessage("The quantity cannot be negative. Type the product quantity again.");
    return;
  }

  currentFlow.data[field.key] = value;
  currentFlow.step += 1;

  if (currentFlow.step < currentFlow.fields.length) {
    await botMessage(currentFlow.fields[currentFlow.step].label);
    return;
  }

  const created = await api.createProduct({
    name: currentFlow.data.name,
    price: Number(currentFlow.data.price),
    console: currentFlow.data.console,
    quantity: Number(currentFlow.data.quantity)
  });

  currentFlow = null;
  await botMessage("Product created successfully in the API.");
  await botMessage(createProductCard(created));
  await refreshSummary();
  await botMessage("Type 0 to see the main menu again, or type another option number.");
}

async function startFindProductFlow() {
  setFlow({ type: "find" });
  await botMessage("Type the product ID you want to view.");
}

async function handleFindProductFlow(input) {
  const id = Number(input.trim());

  if (!Number.isInteger(id) || id <= 0) {
    await botMessage("Please type a valid product ID.");
    return;
  }

  const product = await api.getProduct(id);
  currentFlow = null;
  await botMessage("I found this product:");
  await botMessage(createProductCard(product));
  await botMessage("Type 0 to see the main menu again, or type another option number.");
}

async function startDeleteProductFlow() {
  setFlow({ type: "delete" });
  await botMessage("Type the ID of the product you want to delete.");
}

async function handleDeleteProductFlow(input) {
  const id = Number(input.trim());

  if (!Number.isInteger(id) || id <= 0) {
    await botMessage("Please type a valid product ID.");
    return;
  }

  await api.deleteProduct(id);
  currentFlow = null;
  await botMessage(`Product ID ${id} was removed successfully.`);
  await refreshSummary();
  await botMessage("Type 0 to see the main menu again, or type another option number.");
}

async function startFilterByConsoleFlow() {
  setFlow({ type: "filter" });
  await botMessage("Type the console name you want to filter by. Example: PlayStation, Xbox, Nintendo.");
}

async function handleFilterByConsoleFlow(input) {
  const consoleName = input.trim();

  if (!consoleName) {
    await botMessage("Please type a console name.");
    return;
  }

  const products = await api.getProducts(consoleName);
  currentFlow = null;
  await botMessage(`Here are the products found for ${escapeHtml(consoleName)}:`);
  await botMessage(createProductList(products));
  await botMessage("Type 0 to see the main menu again, or type another option number.");
}

async function startUpdateProductFlow() {
  setFlow({
    type: "update",
    step: "id",
    data: {},
    currentProduct: null,
    fields: [
      { key: "name", label: "Type the new product name, or press Enter to keep the current name." },
      { key: "price", label: "Type the new price, or press Enter to keep the current price." },
      { key: "console", label: "Type the new console, or press Enter to keep the current console." },
      { key: "quantity", label: "Type the new quantity, or press Enter to keep the current quantity." }
    ],
    fieldIndex: 0
  });

  await botMessage("Type the ID of the product you want to update.");
}

async function handleUpdateProductFlow(input) {
  const value = input.trim();

  if (currentFlow.step === "id") {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
      await botMessage("Please type a valid product ID.");
      return;
    }

    const product = await api.getProduct(id);
    currentFlow.data.id = id;
    currentFlow.currentProduct = product;
    currentFlow.step = "fields";

    await botMessage("This is the current product information:");
    await botMessage(createProductCard(product));
    await botMessage(currentFlow.fields[0].label);
    return;
  }

  const field = currentFlow.fields[currentFlow.fieldIndex];

  if (field.key === "price" && value && Number(value) <= 0) {
    await botMessage("The price must be greater than zero. Type the new price again, or press Enter to keep the current price.");
    return;
  }

  if (field.key === "quantity" && value && Number(value) < 0) {
    await botMessage("The quantity cannot be negative. Type the new quantity again, or press Enter to keep the current quantity.");
    return;
  }

  currentFlow.data[field.key] = value;
  currentFlow.fieldIndex += 1;

  if (currentFlow.fieldIndex < currentFlow.fields.length) {
    await botMessage(currentFlow.fields[currentFlow.fieldIndex].label);
    return;
  }

  const current = currentFlow.currentProduct;
  const updated = await api.updateProduct(currentFlow.data.id, {
    name: currentFlow.data.name || current.name,
    price: currentFlow.data.price ? Number(currentFlow.data.price) : Number(current.price),
    console: currentFlow.data.console || current.console,
    quantity: currentFlow.data.quantity ? Number(currentFlow.data.quantity) : Number(current.quantity)
  });

  currentFlow = null;
  await botMessage("Product updated successfully.");
  await botMessage(createProductCard(updated));
  await refreshSummary();
  await botMessage("Type 0 to see the main menu again, or type another option number.");
}

async function endConversation() {
  currentFlow = null;
  await botMessage("Conversation ended. You can initiate a new conversation whenever you want.");
  chatWindow.classList.add("hidden");
  messageComposer.classList.add("hidden");
  startScreen.classList.remove("hidden");
  conversationStarted = false;
}

async function handleMenuOption(input) {
  const command = input.trim().toLowerCase();

  const aliases = {
    "menu": "0",
    "show menu": "0",
    "inventory": "1",
    "view inventory": "1",
    "list": "1",
    "list products": "1",
    "add": "2",
    "add product": "2",
    "create": "2",
    "create product": "2",
    "find": "3",
    "find product": "3",
    "search": "3",
    "search product": "3",
    "update": "4",
    "update product": "4",
    "edit": "4",
    "edit product": "4",
    "delete": "5",
    "delete product": "5",
    "remove": "5",
    "remove product": "5",
    "alerts": "6",
    "low stock": "6",
    "summary": "7",
    "inventory summary": "7",
    "filter": "8",
    "filter by console": "8",
    "exit": "9",
    "end": "9",
    "end conversation": "9",
    "logout": "9"
  };

  const option = aliases[command] || command;

  if (option === "0") return showMenu();
  if (option === "1") return listProducts();
  if (option === "2") return startAddProductFlow();
  if (option === "3") return startFindProductFlow();
  if (option === "4") return startUpdateProductFlow();
  if (option === "5") return startDeleteProductFlow();
  if (option === "6") return showAlerts();
  if (option === "7") return showSummary();
  if (option === "8") return startFilterByConsoleFlow();
  if (option === "9") return endConversation();

  await botMessage("I did not understand that command. Type 0 to see the menu options again.");
}

async function handleFlowInput(input) {
  if (input.trim().toLowerCase() === "cancel") {
    currentFlow = null;
    await botMessage("Action canceled. Type 0 to return to the main menu.");
    return;
  }

  if (currentFlow.type === "create") return handleAddProductFlow(input);
  if (currentFlow.type === "find") return handleFindProductFlow(input);
  if (currentFlow.type === "update") return handleUpdateProductFlow(input);
  if (currentFlow.type === "delete") return handleDeleteProductFlow(input);
  if (currentFlow.type === "filter") return handleFilterByConsoleFlow(input);
}

async function handleUserInput(input) {
  if (!conversationStarted) return;

  try {
    if (currentFlow) {
      await handleFlowInput(input);
    } else {
      await handleMenuOption(input);
    }
  } catch (error) {
    await botMessage(`I could not complete the operation: ${escapeHtml(error.message)}`);
    await botMessage("Type 0 to see the main menu again, or type cancel to stop the current action.");
  }
}

async function startConversation() {
  conversationStarted = true;
  startScreen.classList.add("hidden");
  chatWindow.classList.remove("hidden");
  messageComposer.classList.remove("hidden");
  chatWindow.innerHTML = "";
  currentFlow = null;

  systemMessage("Conversation started");
  await botMessage(`Welcome, ${escapeHtml(user.name)}. This interface works like a chat-based console for the GameStock API.`);
  await showMenu();
  await refreshSummary();
  messageInput.focus();
}

messageComposer.addEventListener("submit", async (event) => {
  event.preventDefault();

  const value = messageInput.value;

  if (!value && !(currentFlow && currentFlow.type === "update" && currentFlow.step === "fields")) {
    return;
  }

  userMessage(value || "Keep current value");
  messageInput.value = "";
  await handleUserInput(value);
  messageInput.focus();
});

startConversationBtn.addEventListener("click", startConversation);

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("gamestock_user");
  window.location.href = "login.html";
});

refreshSummary();
