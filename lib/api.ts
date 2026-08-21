const API_URL = "http://localhost:8083/api";

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
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error("Product not found");
  }

  return response.json();
}

export async function getMenu(): Promise<MenuItem[]> {
  const response = await fetch(`${API_URL}/menu`);

  if (!response.ok) {
    throw new Error("Failed to fetch menu");
  }

  return response.json();
}

export async function getCart(): Promise<CartItemApi[]> {
  const response = await fetch(`${API_URL}/cart`);

  if (!response.ok) {
    throw new Error("Failed to fetch cart");
  }

  return response.json();
}

export async function addToCart(item: {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string;
}): Promise<string> {
  const response = await fetch(`${API_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error("Failed to add item to cart");
  }

  return response.text();
}

export async function removeFromCart(id: string): Promise<string> {
  const response = await fetch(`${API_URL}/cart/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove item from cart");
  }

  return response.text();
}

export async function createOrder(order: OrderInput): Promise<{ id: string }> {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    throw new Error("Failed to place order");
  }

  return response.json();
}

