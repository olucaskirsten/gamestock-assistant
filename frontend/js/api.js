const API_BASE_URL = "http://localhost:5187";

async function requestApi(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
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

const api = {
  login: (email, password) =>
    requestApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),

  getProducts: (consoleName = "") => {
    const query = consoleName ? `?console=${encodeURIComponent(consoleName)}` : "";
    return requestApi(`/api/products${query}`);
  },

  getProduct: (id) => requestApi(`/api/products/${id}`),

  createProduct: (product) =>
    requestApi("/api/products", {
      method: "POST",
      body: JSON.stringify(product)
    }),

  updateProduct: (id, product) =>
    requestApi(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product)
    }),

  deleteProduct: (id) =>
    requestApi(`/api/products/${id}`, {
      method: "DELETE"
    }),

  getSummary: () => requestApi("/api/products/summary"),

  getLowStock: () => requestApi("/api/products/alerts/low-stock")
};
