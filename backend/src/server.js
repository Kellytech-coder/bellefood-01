import { createServer } from "node:http";
import { randomUUID, createHash, createHmac, timingSafeEqual } from "node:crypto";
import { db } from "./firebase.js";

const PORT = Number(process.env.PORT || 8083);
const API_PREFIX = "/api";
const DELIVERY_FEE = 1000;
const CART_COOKIE = "bellefood_cart";
const MAX_BODY_BYTES = 1024 * 1024;
const ADMIN_SESSION_COOKIE = "bellefood_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function send(response, status, data, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  response.end(JSON.stringify(data));
}

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
      throw new HttpError(413, "Request body is too large.");
    }
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

function cartIdFrom(request) {
  const cookie = request.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CART_COOKIE}=`));
  return cookie ? decodeURIComponent(cookie.slice(CART_COOKIE.length + 1)) : null;
}

function cartCookie(id) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${CART_COOKIE}=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`;
}

function adminSessionCookie(token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/api/backend/admin; HttpOnly; SameSite=Strict; Max-Age=${ADMIN_SESSION_TTL_SECONDS}${secure}`;
}

function adminSessionToken(email) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  const payload = Buffer.from(JSON.stringify({ email, expiresAt: Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function hasAdminSession(request) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const cookie = request.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  if (!cookie) return false;
  try {
    const token = decodeURIComponent(cookie.slice(ADMIN_SESSION_COOKIE.length + 1));
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return false;
    const expected = createHmac("sha256", secret).update(payload).digest();
    const received = Buffer.from(signature, "base64url");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof session.email === "string" && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

function safeEqualText(left, right) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function normalizeProduct(snapshot) {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: String(data.name ?? ""),
    description: String(data.description ?? ""),
    price: Number(data.price ?? 0),
    imageUrl: String(data.imageUrl ?? ""),
    category: String(data.category ?? "Other"),
    rating: Number(data.rating ?? 0),
    available: data.available !== false,
  };
}

async function listProducts() {
  const snapshot = await db.collection("products").get();
  return snapshot.docs.map(normalizeProduct);
}

async function getProduct(id) {
  const snapshot = await db.collection("products").doc(id).get();
  if (!snapshot.exists) throw new HttpError(404, "Product not found.");
  return normalizeProduct(snapshot);
}

async function handleApi(request, response, pathname) {
  const path = pathname.startsWith(`${API_PREFIX}/`)
    ? pathname.slice(API_PREFIX.length)
    : pathname;
  const segments = path.split("/").filter(Boolean).map(decodeURIComponent);
  const method = request.method ?? "GET";

  if (method === "GET" && path === "/health") {
    return send(response, 200, { status: "ok" });
  }

  if (segments[0] === "admin" && segments[1] === "login" && method === "POST" && segments.length === 2) {
    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (!configuredEmail || !configuredPassword || !process.env.ADMIN_SESSION_SECRET) {
      return send(response, 503, { message: "Admin email/password sign-in is not configured on the server." });
    }
    const body = await readJson(request);
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!safeEqualText(email, configuredEmail) || !safeEqualText(password, configuredPassword)) {
      return send(response, 401, { message: "Email or password is incorrect." });
    }
    return send(response, 200, { email }, { "Set-Cookie": adminSessionCookie(adminSessionToken(email)) });
  }

  if (segments[0] === "admin" && segments[1] === "logout" && method === "POST" && segments.length === 2) {
    return send(response, 200, { status: "signed-out" }, { "Set-Cookie": `${ADMIN_SESSION_COOKIE}=; Path=/api/backend/admin; HttpOnly; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}` });
  }

  if (segments[0] === "admin") {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
      return send(response, 503, { message: "Admin email/password sign-in is not configured on the server." });
    }
    if (!hasAdminSession(request)) return send(response, 401, { message: "Your admin session has expired. Please sign in again." });

    if (segments[1] === "orders" && method === "GET" && segments.length === 2) {
      const snapshot = await db.collection("orders").orderBy("createdAt", "desc").limit(100).get();
      return send(response, 200, snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }

    if (segments[1] === "orders" && method === "PATCH" && segments.length === 3) {
      const body = await readJson(request);
      const allowed = ["received", "preparing", "on-the-way", "delivered", "cancelled"];
      if (body.status !== undefined && !allowed.includes(body.status)) throw new HttpError(400, "Choose a valid order status.");
      if (body.paymentStatus !== undefined && !["pending", "paid", "failed", "refunded"].includes(body.paymentStatus)) {
        throw new HttpError(400, "Choose a valid payment status.");
      }
      if (body.estimatedDelivery !== undefined && (typeof body.estimatedDelivery !== "string" || body.estimatedDelivery.trim().length < 2 || body.estimatedDelivery.length > 80)) {
        throw new HttpError(400, "Enter an ETA between 2 and 80 characters.");
      }
      if (body.status === undefined && body.paymentStatus === undefined && body.estimatedDelivery === undefined) {
        throw new HttpError(400, "Provide an order status, payment status, or ETA to update.");
      }
      const ref = db.collection("orders").doc(segments[2]);
      const snapshot = await ref.get();
      if (!snapshot.exists) throw new HttpError(404, "Order not found.");
      const updates = { updatedAt: new Date().toISOString() };
      if (body.status !== undefined) updates.status = body.status;
      if (body.paymentStatus !== undefined) updates.paymentStatus = body.paymentStatus;
      if (body.estimatedDelivery !== undefined) updates.estimatedDelivery = body.estimatedDelivery.trim();
      await ref.update(updates);
      if (body.paymentStatus !== undefined) {
        await db.collection("payments").doc(ref.id).set({ status: body.paymentStatus, updatedAt: updates.updatedAt }, { merge: true });
      }
      return send(response, 200, { id: ref.id, ...snapshot.data(), ...updates });
    }

    if (segments[1] === "products" && method === "POST" && segments.length === 2) {
      const body = await readJson(request);
      const name = String(body.name ?? "").trim();
      const category = String(body.category ?? "").trim();
      const description = String(body.description ?? "").trim();
      const price = Number(body.price);
      if (!name || name.length > 120 || !category || category.length > 60 || !description || description.length > 1000 || !Number.isFinite(price) || price <= 0) {
        throw new HttpError(400, "Name, category, description, and a positive price are required.");
      }
      const ref = db.collection("products").doc();
      const product = {
        name, category, description, price,
        imageUrl: String(body.imageUrl ?? "").trim().slice(0, 1000),
        rating: 0,
        available: true,
      };
      await ref.set(product);
      return send(response, 201, { id: ref.id, ...product });
    }

    if (segments[1] === "products" && method === "PATCH" && segments.length === 3) {
      const body = await readJson(request);
      if (typeof body.available !== "boolean") throw new HttpError(400, "Product availability must be true or false.");
      const ref = db.collection("products").doc(segments[2]);
      const snapshot = await ref.get();
      if (!snapshot.exists) throw new HttpError(404, "Product not found.");
      await ref.update({ available: body.available });
      return send(response, 200, { id: ref.id, ...snapshot.data(), available: body.available });
    }

    if (segments[1] === "complaints" && method === "GET" && segments.length === 2) {
      const snapshot = await db.collection("complaints").orderBy("createdAt", "desc").limit(100).get();
      return send(response, 200, snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }

    if (segments[1] === "complaints" && method === "PATCH" && segments.length === 3) {
      const body = await readJson(request);
      const allowedStatuses = ["open", "in-progress", "resolved"];
      if (!allowedStatuses.includes(body.status)) throw new HttpError(400, "Choose a valid complaint status.");
      const reply = body.reply === undefined ? undefined : String(body.reply).trim();
      if (reply !== undefined && reply.length > 2000) throw new HttpError(400, "A reply can contain at most 2,000 characters.");
      const ref = db.collection("complaints").doc(segments[2]);
      const snapshot = await ref.get();
      if (!snapshot.exists) throw new HttpError(404, "Complaint not found.");
      const updates = { status: body.status, updatedAt: new Date().toISOString() };
      if (reply !== undefined) updates.reply = reply;
      await ref.update(updates);
      return send(response, 200, { id: ref.id, ...snapshot.data(), ...updates });
    }

    return send(response, 404, { message: "Admin route not found." });
  }

  if (segments[0] === "products" && method === "GET") {
    if (segments.length === 1) return send(response, 200, await listProducts());
    if (segments.length === 2) return send(response, 200, await getProduct(segments[1]));
  }

  if (segments[0] === "complaints" && method === "POST" && segments.length === 1) {
    const body = await readJson(request);
    const customerName = String(body.customerName ?? "").trim();
    const customerEmail = String(body.customerEmail ?? "").trim();
    const message = String(body.message ?? "").trim();
    if (!customerName || customerName.length > 120 || !message || message.length < 10 || message.length > 3000) {
      throw new HttpError(400, "Enter your name and a complaint between 10 and 3,000 characters.");
    }
    const ref = db.collection("complaints").doc();
    const complaint = {
      customerName,
      customerEmail: customerEmail.slice(0, 254),
      orderId: String(body.orderId ?? "").trim().slice(0, 120),
      category: String(body.category ?? "General").trim().slice(0, 80) || "General",
      message,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    await ref.set(complaint);
    return send(response, 201, { id: ref.id, status: complaint.status });
  }

  if (segments[0] === "menu" && method === "GET" && segments.length === 1) {
    const products = await listProducts();
    const categories = new Map();
    for (const product of products) {
      if (!product.available) continue;
      const key = product.category.trim();
      if (!categories.has(key)) {
        categories.set(key, {
          id: key.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          name: key,
          imageUrl: product.imageUrl,
          description: `Meals in the ${key} category.`,
        });
      }
    }
    return send(response, 200, [...categories.values()]);
  }

  if (segments[0] === "cart" && segments.length === 1) {
    let cartId = cartIdFrom(request);
    const newCart = !cartId;
    cartId ??= randomUUID();
    const cookieHeaders = newCart ? { "Set-Cookie": cartCookie(cartId) } : {};
    const cartRef = db.collection("carts").doc(cartId);

    if (method === "GET") {
      const snapshot = await cartRef.get();
      return send(response, 200, snapshot.data()?.items ?? [], cookieHeaders);
    }

    if (method === "PUT") {
      const body = await readJson(request);
      if (!Array.isArray(body.items)) throw new HttpError(400, "Cart items must be an array.");
      if (body.items.length > 100) throw new HttpError(400, "A cart can contain at most 100 products.");
      const items = [];
      for (const item of body.items) {
        const productId = String(item.productId ?? "");
        const quantity = Number(item.quantity);
        if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
          throw new HttpError(400, "Each cart item needs a productId and quantity from 1 to 99.");
        }
        const product = await getProduct(productId);
        if (!product.available) throw new HttpError(409, `${product.name} is currently unavailable.`);
        items.push({
          id: product.id,
          productId: product.id,
          productName: product.name,
          quantity,
          price: product.price,
          imageUrl: product.imageUrl,
        });
      }
      await cartRef.set({ items, updatedAt: new Date().toISOString() });
      return send(response, 200, items, cookieHeaders);
    }
  }

  if (segments[0] === "cart" && segments.length === 1 && method === "POST") {
    const body = await readJson(request);
    const productId = String(body.productId ?? "");
    const quantity = Number(body.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new HttpError(400, "A productId and quantity from 1 to 99 are required.");
    }
    const product = await getProduct(productId);
    if (!product.available) throw new HttpError(409, "This product is currently unavailable.");
    const cartId = cartIdFrom(request) ?? randomUUID();
    const cartRef = db.collection("carts").doc(cartId);
    const snapshot = await cartRef.get();
    const items = snapshot.data()?.items ?? [];
    const next = items.filter((item) => item.productId !== product.id);
    next.push({ id: product.id, productId: product.id, productName: product.name, quantity, price: product.price, imageUrl: product.imageUrl });
    await cartRef.set({ items: next, updatedAt: new Date().toISOString() });
    return send(response, 200, "Cart updated.", { "Set-Cookie": cartCookie(cartId) });
  }

  if (segments[0] === "cart" && segments.length === 2 && method === "DELETE") {
    const cartId = cartIdFrom(request);
    if (!cartId) return send(response, 200, "Cart is already empty.");
    const cartRef = db.collection("carts").doc(cartId);
    const snapshot = await cartRef.get();
    const items = (snapshot.data()?.items ?? []).filter((item) => item.productId !== segments[1]);
    await cartRef.set({ items, updatedAt: new Date().toISOString() });
    return send(response, 200, "Cart item removed.");
  }

  if (segments[0] === "orders" && method === "POST" && segments.length === 1) {
    const body = await readJson(request);
    const customerName = String(body.customerName ?? "").trim();
    const customerPhone = String(body.customerPhone ?? "").trim();
    const customerEmail = String(body.customerEmail ?? "").trim();
    const deliveryAddress = String(body.deliveryAddress ?? "").trim();
    if (!customerName || !customerPhone || !deliveryAddress) {
      throw new HttpError(400, "Customer name, phone, and delivery address are required.");
    }
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
      throw new HttpError(400, "An order must contain between 1 and 100 items.");
    }
    if (!["card", "bank"].includes(body.paymentMethod)) {
      throw new HttpError(400, "Payment method must be card or bank.");
    }

    const items = [];
    for (const item of body.items) {
      const productId = String(item.productId ?? "");
      const quantity = Number(item.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw new HttpError(400, "Each order item needs a productId and quantity from 1 to 99.");
      }
      const product = await getProduct(productId);
      if (!product.available) throw new HttpError(409, `${product.name} is currently unavailable.`);
      items.push({ productId, productName: product.name, quantity, price: product.price });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = DELIVERY_FEE;
    const total = subtotal + deliveryFee;
    const orderRef = db.collection("orders").doc();
    const paymentRef = db.collection("payments").doc(orderRef.id);
    const deliveryRef = db.collection("deliveries").doc(orderRef.id);
    const customerKey = createHash("sha256")
      .update((customerEmail || customerPhone).toLowerCase())
      .digest("hex");
    const customerRef = db.collection("customers").doc(customerKey);
    const createdAt = new Date().toISOString();
    const order = {
      id: orderRef.id,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryLandmark: String(body.deliveryLandmark ?? "").trim(),
      paymentMethod: body.paymentMethod,
      items,
      subtotal,
      deliveryFee,
      total,
      status: "received",
      paymentStatus: "pending",
      estimatedDelivery: "25-30 mins",
      createdAt,
    };

    await db.runTransaction(async (transaction) => {
      transaction.set(orderRef, order);
      transaction.set(customerRef, {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        updatedAt: createdAt,
      }, { merge: true });
      transaction.set(paymentRef, {
        orderId: orderRef.id,
        method: body.paymentMethod,
        amount: total,
        status: "pending",
        createdAt,
      });
      transaction.set(deliveryRef, {
        orderId: orderRef.id,
        address: order.deliveryAddress,
        landmark: order.deliveryLandmark,
        status: "pending",
        createdAt,
      });
    });

    return send(response, 201, { id: orderRef.id, ...order });
  }

  if (segments[0] === "orders" && segments.length === 2 && method === "GET") {
    const snapshot = await db.collection("orders").doc(segments[1]).get();
    if (!snapshot.exists) throw new HttpError(404, "Order not found.");
    return send(response, 200, { id: snapshot.id, ...snapshot.data() });
  }

  return send(response, 404, { message: "Route not found." });
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    await handleApi(request, response, url.pathname);
  } catch (error) {
    if (error instanceof HttpError) {
      return send(response, error.status, { message: error.message });
    }
    console.error("API request failed:", error);
    return send(response, 500, { message: "The BelleFood API could not complete the request." });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`BelleFood Node API listening on 0.0.0.0:${PORT}`);
});
