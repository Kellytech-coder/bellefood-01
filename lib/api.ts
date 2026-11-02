const API_URL = "/api/backend";

async function fetchResponse(path: string, init?: RequestInit): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error("Could not reach the BelleFood server. Check your connection and try again.");
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}). Please try again.`);
  }

  return response;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchResponse(path, init);
  return response.json() as Promise<T>;
}

async function requestText(path: string, init?: RequestInit): Promise<string> {
  const response = await fetchResponse(path, init);
  return response.text();
}

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  rating: number;
  available: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
};

export type CartItemApi = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string;
};

export type OrderItemInput = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type OrderInput = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryLandmark?: string;
  paymentMethod: "card" | "bank";
  items: OrderItemInput[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export async function getProducts(): Promise<Product[]> {
  return request<Product[]>("/products");
}

export async function getProduct(id: string): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(id)}`);
}

export async function getMenu(): Promise<MenuItem[]> {
  return request<MenuItem[]>("/menu");
}

export async function getCart(): Promise<CartItemApi[]> {
  return request<CartItemApi[]>("/cart");
}

export async function addToCart(item: {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string;
}): Promise<string> {
  return requestText("/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });
}

export async function removeFromCart(id: string): Promise<string> {
  return requestText(`/cart/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createOrder(order: OrderInput): Promise<{ id: string }> {
  return request<{ id: string }>("/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });
}

