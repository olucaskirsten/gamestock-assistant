const API_BASE_URL = "http://localhost:5187";

const FORCE_MOCK_API = false;

const IS_LOCAL_HOST = ["localhost", "127.0.0.1", ""].includes(
  window.location.hostname
);

const USE_MOCK_API = FORCE_MOCK_API || !IS_LOCAL_HOST;

let mockProducts = [
  {
    id: 1,
    name: "God of War Ragnarök",
    price: 249.9,
    console: "PlayStation 5",
    quantity: 12,
  },
  {
    id: 2,
    name: "The Legend of Zelda: Tears of the Kingdom",
    price: 299.9,
    console: "Nintendo Switch",
    quantity: 8,
  },
  {
    id: 3,
    name: "Forza Horizon 5",
    price: 199.9,
    console: "Xbox Series X",
    quantity: 5,
  },
  {
    id: 4,
    name: "Minecraft",
    price: 99.9,
    console: "Xbox Series S",
    quantity: 30,
  },
  {
    id: 5,
    name: "Resident Evil 4 Remake",
    price: 229.9,
    console: "PlayStation 5",
    quantity: 2,
  },
];

function normalizeProduct(product) {
  const totalStockValue = Number(product.price) * Number(product.quantity);

  return {
    ...product,
    price: Number(product.price),
    quantity: Number(product.quantity),
    totalStockValue,
    status: Number(product.quantity) <= 5 ? "Low stock" : "Available",
  };
}

function delayMockResponse(data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 250);
  });
}

function getNextMockId() {
  if (mockProducts.length === 0) return 1;
  return Math.max(...mockProducts.map((product) => product.id)) + 1;
}

function findMockProductById(id) {
  return mockProducts.find((product) => product.id === Number(id));
}

async function requestApi(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = "The operation could not be completed.";

    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

const realApi = {
  login: (email, password) =>
    requestApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getProducts: (consoleName = "") => {
    const query = consoleName
      ? `?console=${encodeURIComponent(consoleName)}`
      : "";

    return requestApi(`/api/products${query}`);
  },

  getProduct: (id) => requestApi(`/api/products/${id}`),

  searchProductsByName: (name) =>
    requestApi(`/api/products/search?name=${encodeURIComponent(name)}`),

  createProduct: (product) =>
    requestApi("/api/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),

  updateProduct: (id, product) =>
    requestApi(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }),

  deleteProduct: (id) =>
    requestApi(`/api/products/${id}`, {
      method: "DELETE",
    }),

  getSummary: () => requestApi("/api/products/summary"),

  getLowStock: () => requestApi("/api/products/alerts/low-stock"),
};

const mockApi = {
  login: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanEmail === "admin@gamestock.com" && cleanPassword === "123456") {
      return delayMockResponse({
        success: true,
        message: "Login completed successfully.",
        user: {
          name: "GameStock Admin",
          email: "admin@gamestock.com",
          role: "Manager",
        },
      });
    }

    throw new Error("Invalid email or password.");
  },

  getProducts: async (consoleName = "") => {
    let products = [...mockProducts];

    if (consoleName) {
      const searchTerm = consoleName.trim().toLowerCase();

      products = products.filter((product) =>
        product.console.toLowerCase().includes(searchTerm)
      );
    }

    return delayMockResponse(products.map(normalizeProduct));
  },

  getProduct: async (id) => {
    const product = findMockProductById(id);

    if (!product) {
      throw new Error("Product not found.");
    }

    return delayMockResponse(normalizeProduct(product));
  },

  searchProductsByName: async (name) => {
    const searchTerm = name.trim().toLowerCase();

    const products = mockProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm)
    );

    if (products.length === 0) {
      throw new Error("No products found with that name.");
    }

    return delayMockResponse(products.map(normalizeProduct));
  },

  createProduct: async (product) => {
    const newProduct = {
      id: getNextMockId(),
      name: product.name,
      price: Number(product.price),
      console: product.console,
      quantity: Number(product.quantity),
    };

    mockProducts.push(newProduct);

    return delayMockResponse(normalizeProduct(newProduct));
  },

  updateProduct: async (id, product) => {
    const productIndex = mockProducts.findIndex(
      (item) => item.id === Number(id)
    );

    if (productIndex === -1) {
      throw new Error("Product not found.");
    }

    mockProducts[productIndex] = {
      id: Number(id),
      name: product.name,
      price: Number(product.price),
      console: product.console,
      quantity: Number(product.quantity),
    };

    return delayMockResponse(normalizeProduct(mockProducts[productIndex]));
  },

  deleteProduct: async (id) => {
    const productIndex = mockProducts.findIndex(
      (item) => item.id === Number(id)
    );

    if (productIndex === -1) {
      throw new Error("Product not found.");
    }

    mockProducts.splice(productIndex, 1);

    return delayMockResponse({
      message: "Product deleted successfully.",
    });
  },

  getSummary: async () => {
    const totalProducts = mockProducts.length;

    const totalUnits = mockProducts.reduce(
      (sum, product) => sum + Number(product.quantity),
      0
    );

    const totalStockValue = mockProducts.reduce(
      (sum, product) =>
        sum + Number(product.price) * Number(product.quantity),
      0
    );

    const lowStockItems = mockProducts.filter(
      (product) => Number(product.quantity) <= 5
    ).length;

    return delayMockResponse({
      totalProducts,
      totalUnits,
      totalStockValue,
      lowStockItems,
    });
  },

  getLowStock: async () => {
    const products = mockProducts.filter(
      (product) => Number(product.quantity) <= 5
    );

    return delayMockResponse(products.map(normalizeProduct));
  },
};

const api = USE_MOCK_API ? mockApi : realApi;