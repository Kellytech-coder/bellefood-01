import { createServer } from "node:http";
import { randomUUID, createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { app, db } from "./firebase.js";

const PORT = Number(process.env.PORT || 8083);
const API_PREFIX = "/api";
const DELIVERY_FEE = 1000;
const CART_COOKIE = "bellefood_cart";
const MAX_BODY_BYTES = 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const ADMIN_SESSION_COOKIE = "bellefood_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;
const CUSTOMER_SESSION_COOKIE = "bellefood_customer_session";
const CUSTOMER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const customerFirebaseAuth = getAuth(app);
const TRACKING_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateTrackingCode() {
  const random = randomBytes(7);
  let code = "T";
  for (let index = 0; index < 7; index += 1) {
    code += TRACKING_CODE_ALPHABET[random[index] % TRACKING_CODE_ALPHABET.length];
  }
  return code;
}

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

async function readProductImage(request) {
  const contentType = String(request.headers["content-type"] ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (!IMAGE_TYPES.has(contentType)) {
    throw new HttpError(415, "Choose a JPEG, PNG, or WebP image.");
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_IMAGE_BYTES) {
      throw new HttpError(413, "Images must be 5 MB or smaller.");
    }
    chunks.push(chunk);
  }
  if (size === 0) throw new HttpError(400, "Choose an image to upload.");
  return { buffer: Buffer.concat(chunks), contentType };
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

function customerSessionCookie(token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${CUSTOMER_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/api/backend; HttpOnly; SameSite=Lax; Max-Age=${CUSTOMER_SESSION_TTL_SECONDS}${secure}`;
}

function customerSessionSecret() {
  if (process.env.CUSTOMER_SESSION_SECRET) return process.env.CUSTOMER_SESSION_SECRET;
  if (process.env.ADMIN_SESSION_SECRET) {
    return createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update("bellefood-customer-session-v1").digest();
  }
  return null;
}

function customerSessionToken(user) {
  const secret = customerSessionSecret();
  if (!secret) throw new Error("Customer session signing is not configured.");
  const payload = Buffer.from(JSON.stringify({ ...user, expiresAt: Date.now() + CUSTOMER_SESSION_TTL_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
}

async function getCustomerSession(request) {
  const secret = customerSessionSecret();
  if (!secret) return null;
  const cookie = request.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${CUSTOMER_SESSION_COOKIE}=`));
  if (!cookie) return null;
  try {
    const token = decodeURIComponent(cookie.slice(CUSTOMER_SESSION_COOKIE.length + 1));
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const expected = createHmac("sha256", secret).update(payload).digest();
    const received = Buffer.from(signature, "base64url");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof session.email !== "string" || typeof session.name !== "string" || session.expiresAt <= Date.now()) return null;
    const accountId = createHash("sha256").update(session.email).digest("hex");
    const account = await db.collection("customerAccounts").doc(accountId).get();
    if (!account.exists || account.data().active === false) return null;
    return { name: account.data().name, email: account.data().email, cashOnDeliveryAllowed: account.data().cashOnDeliveryAllowed !== false };
  } catch {
    return null;
  }
}

function validPassword(password, salt, expectedHash) {
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function firebaseIdentityRequest(action, payload) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY?.trim();
  if (!apiKey) throw new HttpError(503, "Firebase Authentication is not configured. Set FIREBASE_WEB_API_KEY on the backend.");

  let response;
  try {
    response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new HttpError(503, "Firebase Authentication could not be reached. Please try again later.");
  }

  const data = await response.json().catch(() => ({}));
  if (response.ok) return { ok: true, data };
  const message = String(data?.error?.message ?? "UNKNOWN_ERROR");
  return { ok: false, code: message.split(/[ :]/, 1)[0] };
}

async function findFirebaseCustomer(email) {
  try {
    return await customerFirebaseAuth.getUserByEmail(email);
  } catch (error) {
    if (error.code === "auth/user-not-found") return null;
    throw new HttpError(503, "Firebase Authentication could not look up this account.");
  }
}

async function markCustomerAsFirebaseAuth(ref, account) {
  if (account.authProvider === "firebase" && !account.salt && !account.hash) return;
  await ref.update({
    authProvider: "firebase",
    authMigratedAt: new Date().toISOString(),
    salt: FieldValue.delete(),
    hash: FieldValue.delete(),
  });
}

function firebaseSignInError(code) {
  if (code === "USER_DISABLED") return new HttpError(403, "This account has been disabled. Contact BelleFood support for help.");
  if (code === "TOO_MANY_ATTEMPTS_TRY_LATER") return new HttpError(429, "Too many sign-in attempts. Please wait and try again.");
  if (["OPERATION_NOT_ALLOWED", "API_KEY_INVALID", "INVALID_API_KEY", "CONFIGURATION_NOT_FOUND"].includes(code)) return new HttpError(503, "Enable Email/Password sign-in in Firebase Authentication and check FIREBASE_WEB_API_KEY.");
  return new HttpError(401, "Email or password is incorrect.");
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
    salePrice: Number.isFinite(Number(data.salePrice)) ? Number(data.salePrice) : null,
    label: String(data.label ?? ""),
  };
}

function productPrice(product) {
  return product.salePrice && product.salePrice > 0 && product.salePrice < product.price
    ? product.salePrice
    : product.price;
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

  if (segments[0] === "auth" && segments[1] === "session" && method === "GET" && segments.length === 2) {
    const session = await getCustomerSession(request);
    if (!session) throw new HttpError(401, "Sign in before placing an order.");
    return send(response, 200, session);
  }

  if (segments[0] === "auth" && segments[1] === "signout" && method === "POST" && segments.length === 2) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const expiredCookies = ["/api/backend", "/api/backend/auth"].map((cookiePath) => `${CUSTOMER_SESSION_COOKIE}=; Path=${cookiePath}; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
    return send(response, 200, { status: "signed-out" }, { "Set-Cookie": expiredCookies });
  }

  if (segments[0] === "auth" && segments[1] === "forgot-password" && method === "POST" && segments.length === 2) {
    if (!process.env.FIREBASE_WEB_API_KEY?.trim()) throw new HttpError(503, "Firebase Authentication is not configured. Set FIREBASE_WEB_API_KEY on the backend.");
    const body = await readJson(request);
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Enter a valid email address.");
    const accountId = createHash("sha256").update(email).digest("hex");
    const accountRef = db.collection("customerAccounts").doc(accountId);
    const accountSnapshot = await accountRef.get();
    if (accountSnapshot.exists && accountSnapshot.data().active !== false) {
      const account = accountSnapshot.data();
      let firebaseUser = await findFirebaseCustomer(email);
      if (!firebaseUser) {
        try {
          firebaseUser = await customerFirebaseAuth.createUser({
            email,
            password: randomBytes(48).toString("base64url"),
            displayName: String(account.name ?? "").slice(0, 120),
          });
        } catch (error) {
          if (error.code === "auth/email-already-exists") firebaseUser = await findFirebaseCustomer(email);
          else throw new HttpError(503, "Firebase could not prepare this account for password recovery.");
        }
      }
      const result = await firebaseIdentityRequest("sendOobCode", { requestType: "PASSWORD_RESET", email });
      if (!result.ok && result.code !== "EMAIL_NOT_FOUND") {
        if (result.code === "OPERATION_NOT_ALLOWED") throw firebaseSignInError(result.code);
        throw new HttpError(503, "Firebase could not send the password reset email. Check Firebase Authentication settings and try again.");
      }
      if (result.ok && firebaseUser) await markCustomerAsFirebaseAuth(accountRef, account);
    }
    return send(response, 200, { message: "If an account exists for that email, a password reset link has been sent." });
  }

  if (segments[0] === "auth" && method === "POST" && ["signup", "signin"].includes(segments[1]) && segments.length === 2) {
    if (!customerSessionSecret()) return send(response, 503, { message: "Customer sign-in is not configured on the server. Configure CUSTOMER_SESSION_SECRET or ADMIN_SESSION_SECRET." });
    if (!process.env.FIREBASE_WEB_API_KEY?.trim()) throw new HttpError(503, "Firebase Authentication is not configured. Set FIREBASE_WEB_API_KEY on the backend.");
    const body = await readJson(request);
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Enter a valid email address.");
    if (password.length < 8 || password.length > 128) throw new HttpError(400, "Password must be between 8 and 128 characters.");
    const ref = db.collection("customerAccounts").doc(createHash("sha256").update(email).digest("hex"));
    let user;
    if (segments[1] === "signup") {
      if (!name || name.length > 120) throw new HttpError(400, "Enter your name (up to 120 characters).");
      const existingAccount = await ref.get();
      if (existingAccount.exists) throw new HttpError(409, "An account with this email already exists. Sign in instead.");
      let firebaseUser;
      try {
        firebaseUser = await customerFirebaseAuth.createUser({ email, password, displayName: name });
      } catch (error) {
        if (error.code === "auth/email-already-exists") throw new HttpError(409, "An account with this email already exists. Sign in instead.");
        if (error.code === "auth/invalid-password") throw new HttpError(400, "Password must be at least 8 characters.");
        throw new HttpError(503, "Firebase could not create the account. Check Firebase Authentication settings.");
      }
      user = { name, email, active: true, authProvider: "firebase", cashOnDeliveryAllowed: true, createdAt: new Date().toISOString() };
      try {
        await ref.create(user);
      } catch (error) {
        await customerFirebaseAuth.deleteUser(firebaseUser.uid).catch(() => {});
        if (error.code === 6 || error.code === "already-exists") throw new HttpError(409, "An account with this email already exists. Sign in instead.");
        throw error;
      }
    } else {
      const snapshot = await ref.get();
      const account = snapshot.data();
      if (!account) throw new HttpError(401, "Email or password is incorrect.");
      if (account.active === false) throw new HttpError(403, "This account has been disabled. Contact BelleFood support for help.");

      let firebaseUser = await findFirebaseCustomer(email);
      if (!firebaseUser) {
        if (!account.salt || !account.hash || !validPassword(password, account.salt, account.hash)) {
          throw new HttpError(401, "Email or password is incorrect.");
        }
        try {
          firebaseUser = await customerFirebaseAuth.createUser({ email, password, displayName: String(account.name ?? "").slice(0, 120) });
        } catch (error) {
          if (error.code !== "auth/email-already-exists") throw new HttpError(503, "Firebase could not migrate this account. Please try again later.");
          firebaseUser = await findFirebaseCustomer(email);
        }
      }

      let authResult = await firebaseIdentityRequest("signInWithPassword", { email, password, returnSecureToken: true });
      if (!authResult.ok && ["INVALID_PASSWORD", "INVALID_LOGIN_CREDENTIALS"].includes(authResult.code) && !account.authProvider && account.salt && account.hash && validPassword(password, account.salt, account.hash)) {
        try {
          await customerFirebaseAuth.updateUser(firebaseUser.uid, { password });
          authResult = await firebaseIdentityRequest("signInWithPassword", { email, password, returnSecureToken: true });
        } catch {
          throw new HttpError(503, "Firebase could not migrate this account. Please try again later.");
        }
      }
      if (!authResult.ok) throw firebaseSignInError(authResult.code);
      await markCustomerAsFirebaseAuth(ref, account);
      user = { name: account.name, email: account.email, cashOnDeliveryAllowed: account.cashOnDeliveryAllowed !== false };
    }
    const sessionUser = { name: user.name, email: user.email };
    return send(response, 200, sessionUser, { "Set-Cookie": customerSessionCookie(customerSessionToken(sessionUser)) });
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

    if (segments[1] === "customers" && method === "GET" && segments.length === 2) {
      const snapshot = await db.collection("customerAccounts").orderBy("createdAt", "desc").get();
      const customers = snapshot.docs.map((doc) => {
        const account = doc.data();
        return { id: doc.id, name: String(account.name ?? ""), email: String(account.email ?? ""), createdAt: account.createdAt ?? null, active: account.active !== false, cashOnDeliveryAllowed: account.cashOnDeliveryAllowed !== false };
      });
      return send(response, 200, customers);
    }

    if (segments[1] === "customers" && method === "PATCH" && segments.length === 3) {
      const body = await readJson(request);
      const updates = {};
      if (body.active !== undefined) {
        if (typeof body.active !== "boolean") throw new HttpError(400, "Customer active status must be true or false.");
        updates.active = body.active;
      }
      if (body.cashOnDeliveryAllowed !== undefined) {
        if (typeof body.cashOnDeliveryAllowed !== "boolean") throw new HttpError(400, "Cash on delivery access must be true or false.");
        updates.cashOnDeliveryAllowed = body.cashOnDeliveryAllowed;
      }
      if (Object.keys(updates).length === 0) throw new HttpError(400, "Provide an account status or cash on delivery permission.");
      const ref = db.collection("customerAccounts").doc(segments[2]);
      const snapshot = await ref.get();
      if (!snapshot.exists) throw new HttpError(404, "Customer account not found.");
      updates.updatedAt = new Date().toISOString();
      await ref.update(updates);
      const account = snapshot.data();
      return send(response, 200, { id: ref.id, name: account.name, email: account.email, createdAt: account.createdAt ?? null, active: updates.active !== undefined ? updates.active : account.active !== false, cashOnDeliveryAllowed: updates.cashOnDeliveryAllowed !== undefined ? updates.cashOnDeliveryAllowed : account.cashOnDeliveryAllowed !== false });
    }

    if (segments[1] === "product-images" && method === "POST" && segments.length === 2) {
      if (!process.env.FIREBASE_STORAGE_BUCKET) {
        throw new HttpError(503, "Firebase Storage is not configured. Set FIREBASE_STORAGE_BUCKET on the API service.");
      }
      const { buffer, contentType } = await readProductImage(request);
      const bucket = getStorage(app).bucket(process.env.FIREBASE_STORAGE_BUCKET);
      const objectPath = `products/${randomUUID()}.${IMAGE_TYPES.get(contentType)}`;
      const downloadToken = randomUUID();
      const file = bucket.file(objectPath);
      await file.save(buffer, {
        resumable: false,
        metadata: {
          contentType,
          metadata: { firebaseStorageDownloadTokens: downloadToken },
        },
      });
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket.name)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${downloadToken}`;
      return send(response, 201, { imageUrl });
    }

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
      let updatedOrder;
      if (body.status === "preparing" && (!snapshot.data().trackingId || snapshot.data().trackingId === ref.id)) {
        let assigned = false;
        for (let attempt = 0; attempt < 10 && !assigned; attempt += 1) {
          const trackingId = generateTrackingCode();
          const trackingRef = db.collection("trackingIds").doc(trackingId);
          const result = await db.runTransaction(async (transaction) => {
            const currentSnapshot = await transaction.get(ref);
            if (!currentSnapshot.exists) throw new HttpError(404, "Order not found.");
            const currentOrder = currentSnapshot.data();
            if (currentOrder.trackingId && currentOrder.trackingId !== ref.id) {
              const currentUpdates = { ...updates, trackingId: currentOrder.trackingId };
              transaction.update(ref, currentUpdates);
              return { collision: false, order: { ...currentOrder, ...currentUpdates } };
            }
            const trackingSnapshot = await transaction.get(trackingRef);
            if (trackingSnapshot.exists) return { collision: true };
            const currentUpdates = { ...updates, trackingId };
            transaction.create(trackingRef, { orderId: ref.id, createdAt: updates.updatedAt });
            transaction.update(ref, currentUpdates);
            return { collision: false, order: { ...currentOrder, ...currentUpdates } };
          });
          if (!result.collision) {
            updatedOrder = result.order;
            assigned = true;
          }
        }
        if (!assigned) throw new HttpError(500, "Could not assign a tracking ID. Please try again.");
      } else {
        await ref.update(updates);
        updatedOrder = { ...snapshot.data(), ...updates };
      }
      if (body.paymentStatus !== undefined) {
        await db.collection("payments").doc(ref.id).set({ status: body.paymentStatus, updatedAt: updates.updatedAt }, { merge: true });
      }
      return send(response, 200, { id: ref.id, ...updatedOrder });
    }

    if (segments[1] === "products" && method === "POST" && segments.length === 2) {
      const body = await readJson(request);
      const name = String(body.name ?? "").trim();
      const category = String(body.category ?? "").trim();
      const description = String(body.description ?? "").trim();
      const price = Number(body.price);
      const imageUrl = String(body.imageUrl ?? "").trim();
      const salePrice = body.salePrice === "" || body.salePrice == null ? null : Number(body.salePrice);
      const label = String(body.label ?? "").trim();
      if (!name || name.length > 120 || !category || category.length > 60 || !description || description.length > 1000 || !Number.isFinite(price) || price <= 0 || !imageUrl.startsWith("https://firebasestorage.googleapis.com/") || imageUrl.length > 1000) {
        throw new HttpError(400, "Name, category, description, a positive price, and an uploaded product image are required.");
      }
      if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice <= 0 || salePrice >= price)) throw new HttpError(400, "Sale price must be greater than zero and below the regular price.");
      if (label.length > 30) throw new HttpError(400, "Labels can contain at most 30 characters.");
      const ref = db.collection("products").doc();
      const product = {
        name, category, description, price,
        imageUrl,
        salePrice,
        label,
        rating: 0,
        available: true,
      };
      await ref.set(product);
      return send(response, 201, { id: ref.id, ...product });
    }

    if (segments[1] === "products" && method === "PATCH" && segments.length === 3) {
      const body = await readJson(request);
      const updates = {};
      if (body.available !== undefined) {
        if (typeof body.available !== "boolean") throw new HttpError(400, "Product availability must be true or false.");
        updates.available = body.available;
      }
      if (body.imageUrl !== undefined) {
        if (typeof body.imageUrl !== "string" || body.imageUrl.length > 1000 || !body.imageUrl.startsWith("https://")) {
          throw new HttpError(400, "Provide a valid HTTPS image URL.");
        }
        updates.imageUrl = body.imageUrl;
      }
      if (body.salePrice !== undefined) {
        const price = Number(body.price);
        const current = await db.collection("products").doc(segments[2]).get();
        if (!current.exists) throw new HttpError(404, "Product not found.");
        const regularPrice = Number.isFinite(price) && price > 0 ? price : Number(current.data().price);
        const salePrice = body.salePrice === "" || body.salePrice == null ? null : Number(body.salePrice);
        if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice <= 0 || salePrice >= regularPrice)) throw new HttpError(400, "Sale price must be greater than zero and below the regular price.");
        updates.salePrice = salePrice;
      }
      if (body.label !== undefined) {
        if (typeof body.label !== "string" || body.label.trim().length > 30) throw new HttpError(400, "Labels can contain at most 30 characters.");
        updates.label = body.label.trim();
      }
      if (Object.keys(updates).length === 0) throw new HttpError(400, "Provide an image, availability, sale price, or label to update.");
      const ref = db.collection("products").doc(segments[2]);
      const snapshot = await ref.get();
      if (!snapshot.exists) throw new HttpError(404, "Product not found.");
      await ref.update(updates);
      return send(response, 200, { id: ref.id, ...snapshot.data(), ...updates });
    }

    if (segments[1] === "products" && method === "DELETE" && segments.length === 3) {
      const ref = db.collection("products").doc(segments[2]);
      const snapshot = await ref.get();
      if (!snapshot.exists) throw new HttpError(404, "Product not found.");
      await ref.delete();
      return send(response, 200, { id: ref.id, deleted: true });
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
    let complaintOrderId = String(body.orderId ?? "").trim().replace(/^#/, "").slice(0, 120);
    if (complaintOrderId) {
      let orderSnapshot = await db.collection("orders").doc(complaintOrderId).get();
      if (!orderSnapshot.exists) {
        const trackingSnapshot = await db.collection("trackingIds").doc(complaintOrderId).get();
        if (trackingSnapshot.exists) orderSnapshot = await db.collection("orders").doc(trackingSnapshot.data().orderId).get();
      }
      if (orderSnapshot.exists) {
        const order = orderSnapshot.data();
        complaintOrderId = String(order.trackingId || orderSnapshot.id);
      }
    }
    const ref = db.collection("complaints").doc();
    const complaint = {
      customerName,
      customerEmail: customerEmail.slice(0, 254),
      orderId: complaintOrderId,
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
          price: productPrice(product),
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
    next.push({ id: product.id, productId: product.id, productName: product.name, quantity, price: productPrice(product), imageUrl: product.imageUrl });
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
    const customerSession = await getCustomerSession(request);
    if (!customerSession) throw new HttpError(401, "Create an account or sign in before placing an order.");
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
    if (!["card", "bank", "cash-on-delivery"].includes(body.paymentMethod)) {
      throw new HttpError(400, "Choose a valid payment method.");
    }
    if (body.paymentMethod === "cash-on-delivery" && !customerSession.cashOnDeliveryAllowed) throw new HttpError(403, "Cash on delivery is unavailable for this account. Choose another payment method.");

    const items = [];
    for (const item of body.items) {
      const productId = String(item.productId ?? "");
      const quantity = Number(item.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw new HttpError(400, "Each order item needs a productId and quantity from 1 to 99.");
      }
      const product = await getProduct(productId);
      if (!product.available) throw new HttpError(409, `${product.name} is currently unavailable.`);
      items.push({ productId, productName: product.name, imageUrl: product.imageUrl, quantity, price: productPrice(product) });
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

    return send(response, 201, { id: orderRef.id, trackingId: null, ...order });
  }

  if (segments[0] === "orders" && segments[1] === "track" && method === "POST" && segments.length === 2) {
    const body = await readJson(request);
    const trackingId = String(body.trackingId ?? body.orderId ?? "").trim().replace(/^#/, "");
    const normalizePhone = (value) => String(value ?? "").replace(/\D/g, "").replace(/^234/, "").replace(/^0/, "");
    const phone = normalizePhone(body.phone);
    if (!trackingId || trackingId.length > 120 || phone.length < 10 || phone.length > 15) throw new HttpError(400, "Enter your tracking ID and the phone number used at checkout.");
    let snapshot = await db.collection("orders").doc(trackingId).get();
    if (!snapshot.exists) {
      const trackingSnapshot = await db.collection("trackingIds").doc(trackingId).get();
      if (trackingSnapshot.exists) snapshot = await db.collection("orders").doc(trackingSnapshot.data().orderId).get();
    }
    if (!snapshot.exists) throw new HttpError(404, "We couldn’t find an order with those details.");
    const order = snapshot.data();
    const orderPhone = normalizePhone(order.customerPhone);
    if (!orderPhone || phone !== orderPhone) throw new HttpError(404, "We couldn’t find an order with those details.");
    return send(response, 200, {
      id: snapshot.id,
      trackingId: String(order.trackingId ?? snapshot.id),
      status: String(order.status ?? "received"),
      paymentStatus: String(order.paymentStatus ?? "pending"),
      estimatedDelivery: String(order.estimatedDelivery ?? "").trim(),
      createdAt: order.createdAt ?? null,
      items: Array.isArray(order.items) ? order.items.map((item) => ({ name: String(item.productName ?? "Menu item"), quantity: Number(item.quantity ?? 1) })) : [],
    });
  }

  if (segments[0] === "orders" && segments.length === 2 && method === "GET") {
    const snapshot = await db.collection("orders").doc(segments[1]).get();
    if (!snapshot.exists) throw new HttpError(404, "Order not found.");
    const order = snapshot.data();
    return send(response, 200, { ...order, id: snapshot.id, trackingId: order.trackingId || snapshot.id });
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
